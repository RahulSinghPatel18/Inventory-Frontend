
import { create } from "zustand";
import authService from "../services/authService";
import { storage } from "../utils/storage";

let profileRequest;
let authInitializationRequest;
const initialToken = storage.getToken();

const fetchProfileOnce = (set) => {
  if (!profileRequest) {
    profileRequest = authService.getProfile()
      .then((data) => {
        set({ user: data.user });
        return data;
      })
      .finally(() => {
        profileRequest = undefined;
      });
  }

  return profileRequest;
};

const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: !!initialToken,

  login: async (loginData) => {
    set({ isLoading: true });

    try {
      const data = await authService.login(loginData);
      storage.setToken(data.token);

      set({
        token: data.token,
        isAuthenticated: true,
        user: null
      });

      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  // refresh ke time kam krta hai initializeAuth
  initializeAuth: () => {
    if (authInitializationRequest) {
      return authInitializationRequest;
    }

    const token = storage.getToken();

    if (!token) return Promise.resolve();

    set({ token, isAuthenticated: true, isLoading: true });

    authInitializationRequest = fetchProfileOnce(set)
      .catch(() => {
        storage.removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      })
      .finally(() => {
        set({ isLoading: false });
        authInitializationRequest = undefined;
      });

    return authInitializationRequest;
  },

  getProfile: () => {
    const user = get().user;
    return user ? Promise.resolve({ user }) : fetchProfileOnce(set);
  },

  updateProfile: async (profileData) => {
    const data = await authService.updateProfile(profileData);
    set((state) => ({
      user: { ...state.user, ...data.user }
    }));
    return data;
  },

  logout: () => {
    storage.removeToken();
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
