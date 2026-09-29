import api from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/users/Register", userData);
    return response.data;
  },

  login: async (loginData) => {
    const response = await api.post("/users/Login", loginData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/Profile");
    return response.data;
  }
};

export default authService;