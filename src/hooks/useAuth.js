import useAuthStore from "../store/authStore";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const login = useAuthStore((state) => state.login);
  const verifyRegistrationOtp = useAuthStore((state) => state.verifyRegistrationOtp);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const registerGoogleOrganization = useAuthStore((state) => state.registerGoogleOrganization);
  const verifyTwoFactor = useAuthStore((state) => state.verifyTwoFactor);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updateOrganization = useAuthStore((state) => state.updateOrganization);
  const deleteOrganization = useAuthStore((state) => state.deleteOrganization);
  const updateTwoFactor = useAuthStore((state) => state.updateTwoFactor);
  const changePassword = useAuthStore((state) => state.changePassword);

  return {
    user,
    isAuthenticated,
    isInitializing,
    login,
    verifyRegistrationOtp,
    googleLogin,
    registerGoogleOrganization,
    verifyTwoFactor,
    logout,
    updateProfile,
    updateOrganization,
    deleteOrganization,
    updateTwoFactor,
    changePassword
  };
};

export default useAuth;