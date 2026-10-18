import api from "./api";

const dataExportService = {
  downloadDataset: async (dataset, format, filters = {}) => {
    const response = await api.get(`/api/v1/export/${dataset}`, {
      params: { ...filters, format, limit: "all" },
      responseType: "blob"
    });
    return response.data;
  },
  downloadReports: async (format, filters = {}) => {
    const response = await api.get("/api/v1/export/reports", {
      params: { ...filters, format, limit: "all" },
      responseType: "blob"
    });
    return response.data;
  }
};

export default dataExportService;
