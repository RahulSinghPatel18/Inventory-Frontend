
import { create } from "zustand";
import authService from "../services/authService";
import { storage } from "../utils/storage";

const useAuthStore = create((set) => ({
  user: null,
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,

  login: async (loginData) => {
    set({ isLoading: true });

    try {
      const data = await authService.login(loginData);
      storage.setToken(data.token);

      set({
        token: data.token,
        isAuthenticated: true
      });

      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  // refresh ke time kam krta hai initializeAuth
  initializeAuth: async () => {
    const token = storage.getToken();

    if (!token) return;

    set({ token, isAuthenticated: true, isLoading: true });

    try {
      const data = await authService.getProfile();
      set({ user: data.user });
    } catch {
      storage.removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    } finally {
      set({ isLoading: false });
    }
  },

  getProfile: async () => {
    const data = await authService.getProfile();
    set({ user: data.user });
    return data;
  },

  logout: () => {
    storage.removeToken();
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;

