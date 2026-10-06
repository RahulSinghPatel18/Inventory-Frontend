import api, { get } from "./api";

const categoryService = {
  createCategory: async (categoryData) => {
    const response = await api.post("/categories/Create", categoryData);

    return response.data;
  },

  getCategories: async (params = {}) => {
    const response = await get("/categories/GetAll", { params });

    return response.data;
  },

  getCategoryStats: async () => {
    const response = await get("/categories/Stats");

    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await get(`/categories/GetById/${id}`);

    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/Update/${id}`, categoryData);

    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/Delete/${id}`);

    return response.data;
  }
};

export default categoryService;