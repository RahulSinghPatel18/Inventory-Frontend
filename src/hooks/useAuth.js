import useAuthStore from "../store/authStore";

const useAuth = () => {
  const { user,token,isAuthenticated,isLoading,login,logout,getProfile,updateProfile,initializeAuth} = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getProfile,
    updateProfile,
    initializeAuth
  };
};

export default useAuth;