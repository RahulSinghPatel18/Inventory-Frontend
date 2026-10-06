import api, { get } from "./api";

const udhaarService = {
  getUdhaar: async (params = {}) => {
    const response = await get("/udhaar", { params });
    return response.data;
  },

  createUdhaar: async (payload) => {
    const response = await api.post("/udhaar", payload);
    return response.data;
  },

  updateUdhaar: async (id, payload) => {
    const response = await api.put(`/udhaar/${id}`, payload);
    return response.data;
  },

  getUdhaarDetails: async (id) => {
    const response = await get(`/udhaar/${id}`);
    return response.data;
  },

  cancelUdhaar: async (id) => {
    const response = await api.delete(`/udhaar/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await get("/udhaar/stats");
    return response.data;
  },

  getCustomers: async (params = {}) => {
    const response = await get("/udhaar/customers", { params });
    return response.data;
  },

  getCustomerStats: async () => {
    const response = await get("/customers/stats");
    return response.data;
  },

  listCustomers: async (params = {}) => {
    const response = await get("/customers", { params });
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (payload) => {
    const response = await api.post("/udhaar/customers", payload);
    return response.data;
  },

  updateCustomer: async (id, payload) => {
    const response = await api.put(`/udhaar/customers/${id}`, payload);
    return response.data;
  },

  getLedger: async (id, params = {}) => {
    const response = await get(`/udhaar/customers/${id}/ledger`, { params });
    return response.data;
  },

  recordPayment: async (customerId, payload) => {
    const response = await api.post(`/udhaar/customers/${customerId}/payments`, payload);
    return response.data;
  }
};

export default udhaarService;
