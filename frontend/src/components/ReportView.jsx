import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, FileCheck } from 'lucide-react';

export default function ReportView({ report, onSelectMetric }) {
  if (!report) return null;

  const getTriageBadge = (level) => {
    switch (level) {
      case 'URGENT':
        return {
          bg: 'bg-red-100 border-red-300 text-red-800',
          icon: <AlertOctagon className="w-6 h-6 text-red-600" />,
          title: 'Urgent Medical Attention Advised',
        };
      case 'ATTENTION_NEEDED':
        return {
          bg: 'bg-amber-100 border-amber-300 text-amber-800',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          title: 'Attention Needed - Out of Range Bounds',
        };
      default:
        return {
          bg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          title: 'Routine - Biomarkers Within Range',
        };
    }
  };

  const triageInfo = getTriageBadge(report.triageLevel);

  return (
    <div className="space-y-6">
      {/* Top Triage Banner */}
      <div className={`p-4 rounded-xl border flex items-center gap-4 ${triageInfo.bg}`}>
        {triageInfo.icon}
        <div>
          <h2 className="font-bold text-lg">{triageInfo.title}</h2>
          <p className="text-sm opacity-90">Evaluated deterministically based on reference threshold bounds.</p>
        </div>
      </div>

      {/* Plain-English Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" /> Executive Plain-English Summary
        </h3>
        <p className="text-slate-600 leading-relaxed">{report.summary.plainEnglishOverview}</p>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2 text-sm">Key Clinical Findings</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {report.summary.keyTakeaways.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2 text-sm">Doctor Consultation Checklist</h4>
            <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1">
              {report.summary.recommendedDoctorQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Biomarker Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Extracted Biomarker Analysis</h3>
          <p className="text-xs text-slate-500">Click any row to view historical trend progression across past labs.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-3">Biomarker</th>
                <th className="p-3">Value</th>
                <th className="p-3">Reference Range</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {report.metrics.map((metric, idx) => (
                <tr
                  key={idx}
                  onClick={() => onSelectMetric(metric.name)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition"
                >
                  <td className="p-3 font-medium text-slate-800">{metric.name}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {metric.value} <span className="text-xs text-slate-500 font-normal">{metric.unit}</span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {metric.referenceMin !== null && metric.referenceMax !== null
                      ? `${metric.referenceMin} - ${metric.referenceMax}`
                      : 'N/A'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        metric.status === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : metric.status.includes('CRITICAL')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {metric.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}