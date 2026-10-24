import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetricHistory } from '../services/api';
import { TrendingUp, X } from 'lucide-react';

export default function TrendChart({ patientId, metricName, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !metricName) return;
    setLoading(true);
    getMetricHistory(patientId, metricName)
      .then((res) => {
        const formatted = res.data.dataPoints.map((pt) => ({
          date: new Date(pt.reportDate).toLocaleDateString(),
          value: pt.value,
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [patientId, metricName]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Longitudinal Trend: <span className="text-indigo-600">{metricName}</span>
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">Loading trend history...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400">No historical records found for this metric.</div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}