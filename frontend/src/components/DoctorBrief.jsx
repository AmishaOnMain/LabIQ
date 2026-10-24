import React from "react";
import { Download, Activity } from "lucide-react";

// In src/components/DoctorBrief.jsx

export default function DoctorBrief({ report }) {
  if (!report) return null;

  // Uses the extracted patient name from the backend payload
  const patientName = report.extractedPatientName || "Patient";

  const abnormalMetrics = report.metrics.filter((m) => m.status !== "NORMAL");

  // ... rest of component stays the same

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header bar (Hidden when printing to PDF) */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Doctor Visit Preparation Brief
          </h3>
          <p className="text-xs text-slate-500">
            1-Page summary optimized for fast physician review during
            appointments.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Save as PDF / Print
        </button>
      </div>

      {/* Printable Area */}
      <div className="p-6 bg-white text-slate-900 space-y-6 border border-slate-100 rounded-lg print:border-none print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
              <Activity className="w-6 h-6" /> LabIQ Clinical Brief
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generated Lab Report Summary & Triage Data
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">Patient:</strong> {patientName}
            </p>
            <p>
              <strong className="text-slate-800">Date:</strong>{" "}
              {new Date(report.reportDate).toLocaleDateString()}
            </p>
            <p>
              <strong className="text-slate-800">Triage Level:</strong>{" "}
              {report.triageLevel}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            1. Plain-English Overview
          </h4>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md leading-relaxed border border-slate-200">
            {report.summary.plainEnglishOverview}
          </p>
        </div>

        {/* Flagged Biomarkers Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            2. Flagged Biomarkers Requiring Physician Review (
            {abnormalMetrics.length})
          </h4>
          {abnormalMetrics.length === 0 ? (
            <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-md border border-emerald-200">
              All measured biomarkers fall within standard reference ranges. No
              abnormal markers detected.
            </p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-md overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Biomarker</th>
                  <th className="p-2">Patient Value</th>
                  <th className="p-2">Reference Range</th>
                  <th className="p-2">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {abnormalMetrics.map((m, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-2 font-medium text-slate-900">{m.name}</td>
                    <td className="p-2 font-bold text-slate-900">
                      {m.value} {m.unit}
                    </td>
                    <td className="p-2 text-slate-500">
                      {m.referenceMin !== null && m.referenceMax !== null
                        ? `${m.referenceMin} - ${m.referenceMax}`
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Suggested Physician Questions */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            3. Recommended Consultation Questions
          </h4>
          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5 bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
            {report.summary.recommendedDoctorQuestions.map((q, idx) => (
              <li key={idx} className="leading-snug">
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          Notice: LabIQ is an automated extraction tool and does not provide
          clinical diagnosis. All values should be verified by a licensed
          healthcare professional.
        </div>
      </div>
    </div>
  );
}
