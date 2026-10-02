import api, { get } from "./api";

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
    const response = await get("/users/Profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/UpdateProfile", profileData);
    return response.data;
  }
};

export default authService;