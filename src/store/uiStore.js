import { create } from "zustand";

const useUiStore = create((set) => ({
theme: localStorage.getItem("theme") || "system",

setTheme: (theme) => {
localStorage.setItem("theme", theme);
set({ theme });
},

toggleTheme: () =>
set((state) => {
const newTheme = state.theme === "light" ? "dark" : "light";


  localStorage.setItem("theme", newTheme);

  return { theme: newTheme };
})


}));

export default useUiStore;
