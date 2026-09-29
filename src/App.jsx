import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import AppRoutes from "./routes/AppRoutes";

import "react-toastify/dist/ReactToastify.css";
import useAuth from "./hooks/useAuth";
import useUiStore from "./store/uiStore";
import { themeColors } from "./config/theme";


function App() {
  const theme = useUiStore((state) => state.theme);
   const { initializeAuth } = useAuth();
   
useEffect(() => {
const root = document.documentElement;
root.classList.toggle("dark", theme === "dark");
Object.entries(themeColors[theme] || themeColors.light).forEach(
  ([token, value]) => root.style.setProperty(token, value)
);
}, [theme]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <AppRoutes />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme}
      />
    </>
  );
}

export default App;