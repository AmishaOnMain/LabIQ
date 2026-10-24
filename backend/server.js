require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const cors = require("cors");

const mongoose = require("mongoose");

const multer = require("multer");

const { PDFParse } = require("pdf-parse");

const { GoogleGenAI } = require("@google/genai");

const Patient = require("./models/Patient");

const Report = require("./models/Report");

const { evaluateTriageLevel } = require("./utils/triageValidator");

const app = express();

app.use(express.json());
// In backend/server.js

app.use(
  cors({
    origin: ["http://localhost:5173", "https://lab-iq-liard.vercel.app/"],
    credentials: true,
  }),
);

const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose
  .connect(process.env.MONGO_URI_ATLAS)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/test", (req, res) => {
  res.send("LabIQ server is working!");
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// GET /api/reports/latest/:patientId - Fetch the most recent report for a patient
app.get("/api/reports/latest/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const latestReport = await Report.findOne({ patientId }).sort({
      reportDate: -1,
    });

    if (!latestReport) {
      return res
        .status(404)
        .json({ message: "No reports found for this patient." });
    }

    res.json(latestReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 1. POST /api/patients - Register a new patient
 */
app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 2. POST /api/reports/upload - Process PDF, call LLM, run rules, and save report
 */

app.post(
  "/api/reports/upload",
  upload.single("reportPdf"),
  async (req, res) => {
    try {
      const { patientId } = req.body;

      if (!patientId) {
        return res.status(400).json({
          error: "patientId is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No PDF file uploaded.",
        });
      }

      const parser = new PDFParse({ data: req.file.buffer });

      const pdfData = await parser.getText();
      const extractedText = pdfData.text;

      await parser.destroy();
      if (!extractedText.trim()) {
        return res.status(400).json({
          error: "Failed to extract text from PDF file.",
        });
      }

      // In server.js inside app.post('/api/reports/upload', ...)

      const prompt = `
  You are an expert clinical lab report data extraction engine.
  Analyze the raw lab report text below and extract:
  1. Patient's full name (if found, otherwise null).
  2. All numerical biomarkers, reference ranges, status classifications.
  3. Patient summaries.

  RAW LAB TEXT:
  "${extractedText}"
`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              extractedPatientName: { type: "STRING", nullable: true }, // <--- Added field
              metrics: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    value: { type: "NUMBER" },
                    unit: { type: "STRING" },
                    referenceMin: { type: "NUMBER", nullable: true },
                    referenceMax: { type: "NUMBER", nullable: true },
                    status: {
                      type: "STRING",
                      enum: [
                        "NORMAL",
                        "ELEVATED",
                        "LOW",
                        "CRITICAL_HIGH",
                        "CRITICAL_LOW",
                      ],
                    },
                  },
                  required: ["name", "value", "unit", "status"],
                },
              },
              summary: {
                type: "OBJECT",
                properties: {
                  plainEnglishOverview: { type: "STRING" },
                  keyTakeaways: { type: "ARRAY", items: { type: "STRING" } },
                  recommendedDoctorQuestions: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                  },
                },
                required: [
                  "plainEnglishOverview",
                  "keyTakeaways",
                  "recommendedDoctorQuestions",
                ],
              },
            },
            required: ["metrics", "summary"],
          },
        },
      });

      const parsedData = JSON.parse(aiResponse.text);

      const triageLevel = evaluateTriageLevel(parsedData.metrics);

      const report = new Report({
        patientId,
        extractedPatientName: parsedData.extractedPatientName || "Patient",
        rawText: extractedText,
        metrics: parsedData.metrics,
        summary: parsedData.summary,
        triageLevel,
      });

      await report.save();

      return res.status(201).json({
        message: "Report analyzed and stored successfully",
        report,
      });
    } catch (error) {
      console.error("Error in /api/reports/upload:", error);

      return res.status(500).json({
        error: "Internal Server Error processing report.",
      });
    }
  },
);

/**
 * 3. GET /api/reports/history/:patientId - Fetch metric trend history across past reports
 */
app.get("/api/reports/history/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const { metricName } = req.query; // e.g. ?metricName=Glucose

    const reports = await Report.find({ patientId }).sort({ reportDate: 1 });

    if (!metricName) {
      return res.json({ reports });
    }

    // Filter historical points for a specific biomarker
    const trendData = reports
      .map((report) => {
        const match = report.metrics.find(
          (m) => m.name.toLowerCase() === metricName.toLowerCase(),
        );
        return {
          reportDate: report.reportDate,
          value: match ? match.value : null,
          unit: match ? match.unit : null,
          status: match ? match.status : "NOT_TESTED",
        };
      })
      .filter((point) => point.value !== null);

    return res.json({
      metricName,
      patientId,
      dataPoints: trendData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Phase 1 Backend Server running on port ${PORT}`),
);
