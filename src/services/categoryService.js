import api from "./api";

const categoryService = {
  createCategory: async (categoryData) => {
    const response = await api.post("/categories/Create", categoryData);

    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/categories/GetAll");

    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/GetById/${id}`);

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