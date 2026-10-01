import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import AppRoutes from "./routes/AppRoutes";

import "react-toastify/dist/ReactToastify.css";
import useAuth from "./hooks/useAuth";
import useUiStore from "./store/uiStore";
import { themeColors } from "./config/theme";


function App() {
  const theme = useUiStore((state) => state.theme);
  const { initializeAuth } = useAuth();
  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    Object.entries(themeColors[resolvedTheme] || themeColors.light).forEach(
      ([token, value]) => root.style.setProperty(token, value)
    );
  }, [resolvedTheme]);

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
        theme={resolvedTheme}
      />
    </>
  );
}

export default App;