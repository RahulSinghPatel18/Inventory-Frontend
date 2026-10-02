import useAuthStore from "../store/authStore";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const getProfile = useAuthStore((state) => state.getProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  return {
    user,
    token,
    isAuthenticated,
    isInitializing,
    isLoading,
    login,
    logout,
    getProfile,
    updateProfile,
    initializeAuth
  };
};

export default useAuth;