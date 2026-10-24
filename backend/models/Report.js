const mongoose = require("mongoose");

const MetricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  value: {
    type: Number,
    required: true,
  },

  unit: {
    type: String,
    required: true,
  },

  referenceMin: {
    type: Number,
    default: null,
  },

  referenceMax: {
    type: Number,
    default: null,
  },

  status: {
    type: String,
    enum: ["NORMAL", "ELEVATED", "LOW", "CRITICAL_HIGH", "CRITICAL_LOW"],
    required: true,
  },
});

// In models/Report.js
const ReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  extractedPatientName: { type: String, default: "Patient" }, // <--- Added
  reportDate: { type: Date, default: Date.now },
  rawText: { type: String, required: true },
  metrics: [MetricSchema],
  summary: {
    plainEnglishOverview: { type: String, required: true },
    keyTakeaways: [{ type: String }],
    recommendedDoctorQuestions: [{ type: String }],
  },
  triageLevel: {
    type: String,
    enum: ["ROUTINE", "ATTENTION_NEEDED", "URGENT"],
    default: "ROUTINE",
  },
});
module.exports = mongoose.model("Report", ReportSchema);
