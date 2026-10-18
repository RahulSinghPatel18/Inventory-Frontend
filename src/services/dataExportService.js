import api from "./api";

const dataExportService = {
  downloadDataset: async (dataset, format) => {
    const response = await api.get(`/api/v1/export/${dataset}`, {
      params: { format },
      responseType: "blob"
    });
    return response.data;
  },
  downloadReports: async (format, filters = {}) => {
    const response = await api.get("/api/v1/export/reports", {
      params: { format, ...filters },
      responseType: "blob"
    });
    return response.data;
  }
};

export default dataExportService;
