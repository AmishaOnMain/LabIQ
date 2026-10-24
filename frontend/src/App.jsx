import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import ReportView from "./components/ReportView";
import TrendChart from "./components/TrendChart";
import DoctorBrief from "./components/DoctorBrief";
import { Activity, RefreshCw } from "lucide-react";

export default function App() {
  const [patientId] = useState("65f123456789abcdef123456");
  const [activeReport, setActiveReport] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // 1. Load report from localStorage on initial render
  useEffect(() => {
    const savedReport = localStorage.getItem("activeLabReport");
    if (savedReport) {
      try {
        setActiveReport(JSON.parse(savedReport));
      } catch (err) {
        console.error("Failed to parse cached report:", err);
      }
    }
  }, []);

  // 2. Handler to set active report and cache it in localStorage
  const handleReportUpload = (report) => {
    setActiveReport(report);
    localStorage.setItem("activeLabReport", JSON.stringify(report));
  };

  // 3. Clear session option
  const handleClearSession = () => {
    localStorage.removeItem("activeLabReport");
    setActiveReport(null);
    setSelectedMetric(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">LabIQ</h1>
            <p className="text-xs text-slate-400">
              AI Clinical Triage & Lab Report Analyzer
            </p>
          </div>
        </div>

        {activeReport && (
          <button
            onClick={handleClearSession}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Workspace
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6 print:hidden">
          <FileUploader
            patientId={patientId}
            onUploadSuccess={handleReportUpload}
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          {selectedMetric && (
            <TrendChart
              patientId={patientId}
              metricName={selectedMetric}
              onClose={() => setSelectedMetric(null)}
            />
          )}

          {activeReport ? (
            <>
              <DoctorBrief report={activeReport} />
              <ReportView
                report={activeReport}
                onSelectMetric={(name) => setSelectedMetric(name)}
              />
            </>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-400">
              Upload a lab report PDF on the left panel to begin analysis.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
