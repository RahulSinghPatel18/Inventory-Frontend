import api, { get } from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/users/Register", userData);
    return response.data;
  },

  verifyRegistrationOtp: async (email, otp) => {
    const response = await api.post("/users/VerifyRegistrationOtp", { email, otp });
    return response.data;
  },

  resendRegistrationOtp: async (email) => {
    const response = await api.post("/users/ResendRegistrationOtp", { email });
    return response.data;
  },

  googleLogin: async (payload) => {
    const response = await api.post("/users/Google", payload);
    return response.data;
  },

  registerGoogleOrganization: async (payload) => {
    const response = await api.post("/users/Google/Register", payload);
    return response.data;
  },

  verifyTwoFactor: async (payload) => {
    const response = await api.post("/users/VerifyTwoFactor", payload);
    return response.data;
  },

  resendTwoFactor: async (challengeToken) => {
    const response = await api.post("/users/ResendTwoFactor", { challengeToken });
    return response.data;
  },

  login: async (loginData) => {
    const response = await api.post("/users/Login", loginData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/users/ForgotPassword", { email });
    return response.data;
  },

  verifyResetOtp: async (email, otp) => {
    const response = await api.post("/users/VerifyResetOtp", { email, otp });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await api.post("/users/ResetPassword", payload);
    return response.data;
  },

  changePassword: async (payload) => {
    const response = await api.put("/users/ChangePassword", payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await get("/users/Profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/UpdateProfile", profileData);
    return response.data;
  },

  updateOrganization: async (organizationName) => {
    const response = await api.put("/users/Organization", { organizationName });
    return response.data;
  },

  deleteOrganization: async (confirmationName, confirmationText) => {
    const response = await api.delete("/users/Organization", {
      data: { confirmationName, confirmationText }
    });
    return response.data;
  },

  updateTwoFactor: async (enabled) => {
    const response = await api.put("/users/TwoFactor", { enabled });
    return response.data;
  },

  getOrganizationUsers: async (params = {}) => {
    const response = await get("/users/Members", { params });
    return response.data;
  },

  createOrganizationUser: async (userData) => {
    const response = await api.post("/users/Members", userData);
    return response.data;
  },

  updateOrganizationUser: async (id, userData) => {
    const response = await api.put(`/users/Members/${id}`, userData);
    return response.data;
  },

  resetOrganizationUserPassword: async (id, password) => {
    const response = await api.put(`/users/Members/${id}/ResetPassword`, { password });
    return response.data;
  },

  deleteOrganizationUser: async (id) => {
    const response = await api.delete(`/users/Members/${id}`);
    return response.data;
  }
};

export default authService;