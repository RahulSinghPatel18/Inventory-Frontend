import useAuthStore from "../store/authStore";

const useAuth = () => {
  const { user,token,isAuthenticated,isLoading,login,logout,getProfile,initializeAuth} = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getProfile,
    initializeAuth
  };
};

export default useAuth;