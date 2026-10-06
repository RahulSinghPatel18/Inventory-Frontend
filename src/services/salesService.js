import api, { get } from "./api";

const salesService = {
  getSales: async (params = {}) => {
    const response = await get("/sales", { params });
    return response.data;
  },

  getSale: async (id) => {
    const response = await get(`/sales/${id}`);
    return response.data;
  },

  createSale: async (payload) => {
    const response = await api.post("/sales", payload);
    return response.data;
  },

  cancelSale: async (id) => {
    const response = await api.post(`/sales/${id}/cancel`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await get("/sales/analytics");
    return response.data;
  },
};

export default salesService;
