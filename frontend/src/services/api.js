import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getLatestReport = (patientId) =>
  API.get(`/reports/latest/${patientId}`);

export const registerPatient = (patientData) =>
  API.post("/patients", patientData);

export const uploadReport = (patientId, file) => {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("reportPdf", file);

  return API.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMetricHistory = (patientId, metricName) =>
  API.get(`/reports/history/${patientId}`, {
    params: { metricName },
  });
