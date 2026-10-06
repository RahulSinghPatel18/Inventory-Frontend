import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import AppRoutes from "./routes/AppRoutes";

import useAuthStore from "./store/authStore";
import useUiStore from "./store/uiStore";
import { themeColors } from "./config/theme";

function App() {
  const theme = useUiStore((state) => state.theme);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
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
    root.style.colorScheme = resolvedTheme;
    Object.entries(themeColors[resolvedTheme] || themeColors.light).forEach(
      ([token, value]) => root.style.setProperty(token, value)
    );
  }, [resolvedTheme]);

  useEffect(() => {
    initializeAuth().catch((error) => {
      console.error("Unable to load the current member profile", error);
    });
  }, [initializeAuth]);

  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-center"
        duration={3000}
        closeButton
        richColors
        theme={resolvedTheme}
      />
    </>
  );
}

export default App;