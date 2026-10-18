import api from "./api";

const backupService = {
  downloadFullBackup: async (format) => {
    const response = await api.get("/api/v1/export/full-backup", {
      params: { format },
      responseType: "blob"
    });
    return response.data;
  }
};

export default backupService;
