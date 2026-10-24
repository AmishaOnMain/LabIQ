import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import { uploadReport } from '../services/api';

export default function FileUploader({ patientId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a PDF file first.');
    if (!patientId) return setError('Patient context missing. Select a patient.');

    setLoading(true);
    setStatusMsg('Extracting text and running AI verification...');
    setError('');

    try {
      const res = await uploadReport(patientId, file);
      setLoading(false);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(res.data.report);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to process lab report.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Diagnostic Report</h3>
      <p className="text-sm text-slate-500 mb-4">Upload lab report PDFs to extract structured biomarkers and triage metrics.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              {file ? file.name : 'Click to upload or drag & drop PDF'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF files up to 10MB</p>
          </div>
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
        </label>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{statusMsg}</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Analyze Report</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}