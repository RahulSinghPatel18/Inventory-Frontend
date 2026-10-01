import api from "./api";

const stockService = {
  stockIn: async (payload) => {
    const response = await api.post("/stock/In", payload);
    return response.data;
  },

  stockOut: async (payload) => {
    const response = await api.post("/stock/Out", payload);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get("/stock/History", { params });
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get("/stock/LowStock");
    return response.data;
  },

  getOutOfStock: async () => {
    const response = await api.get("/stock/OutOfStock");
    return response.data;
  },

  getSummary: async (productId) => {
    const response = await api.get("/stock/Summary", {
      params: { productId }
    });
    return response.data;
  }
};

export default stockService;