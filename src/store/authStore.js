
import { create } from "zustand";
import authService from "../services/authService";
import { storage } from "../utils/storage";

const initialToken = storage.getToken();

const applySession = (set, data) => {
  if (data.token) {
    storage.setToken(data.token);
    set({ isAuthenticated: true, user: data.user, isInitializing: false });
  }
  return data;
};

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!initialToken,
  isInitializing: !!initialToken,

  login: async (loginData) => {
    const data = await authService.login(loginData);
    return applySession(set, data);
  },

  verifyRegistrationOtp: async (email, otp) => {
    const data = await authService.verifyRegistrationOtp(email, otp);
    return applySession(set, data);
  },

  registerGoogleOrganization: async (payload) => {
    const data = await authService.registerGoogleOrganization(payload);
    return applySession(set, data);
  },

  googleLogin: async (payload) => {
    const data = await authService.googleLogin(payload);
    return applySession(set, data);
  },

  verifyTwoFactor: async (payload) => {
    const data = await authService.verifyTwoFactor(payload);
    return applySession(set, data);
  },

  initializeAuth: async () => {
    const token = storage.getToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isInitializing: false });
      return;
    }

    try {
      const data = await authService.getProfile();
      if (storage.getToken() === token) {
        set({ user: data.user, isAuthenticated: true, isInitializing: false });
      }
    } catch (error) {
      if (storage.getToken() === token) {
        storage.removeToken();
        set({ user: null, isAuthenticated: false, isInitializing: false });
      }
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    const data = await authService.updateProfile(profileData);
    set((state) => ({
      user: { ...state.user, ...data.user }
    }));
    return data;
  },

  updateOrganization: async (organizationName) => {
    const data = await authService.updateOrganization(organizationName);
    set((state) => ({
      user: { ...state.user, ...data.user }
    }));
    return data;
  },

  deleteOrganization: async (confirmationName, confirmationText) => (
    authService.deleteOrganization(confirmationName, confirmationText)
  ),

  updateTwoFactor: async (enabled) => {
    const data = await authService.updateTwoFactor(enabled);
    set((state) => ({
      user: { ...state.user, ...data.user }
    }));
    return data;
  },

  changePassword: async (passwordData) => {
    const data = await authService.changePassword(passwordData);
    storage.setToken(data.token);
    set({ user: data.user, isAuthenticated: true, isInitializing: false });
    return data;
  },

  logout: () => {
    storage.removeToken();
    set({ user: null, isAuthenticated: false, isInitializing: false });
  }
}));

export default useAuthStore;
