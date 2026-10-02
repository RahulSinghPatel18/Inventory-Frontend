import api, { get } from "./api";

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
    const response = await get("/stock/History", { params });
    return response.data;
  },

  getLowStock: async (params = {}) => {
    const response = await get("/stock/LowStock", { params });
    return response.data;
  },

  getOutOfStock: async (params = {}) => {
    const response = await get("/stock/OutOfStock", { params });
    return response.data;
  },

  getSummary: async (productId) => {
    const response = await get("/stock/Summary", {
      params: { productId }
    });
    return response.data;
  }
};

export default stockService;