import { create } from "zustand";

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    return ["light", "dark", "system"].includes(saved) ? saved : "system";
  } catch (error) {
    console.warn("Appearance preference could not be read from this device.", error);
    return "system";
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.warn("Appearance preference could not be saved on this device.", error);
  }
};

const useUiStore = create((set) => ({
theme: getSavedTheme(),

setTheme: (theme) => {
saveTheme(theme);
set({ theme });
},

toggleTheme: () =>
set((state) => {
const newTheme = state.theme === "light" ? "dark" : "light";


  saveTheme(newTheme);

  return { theme: newTheme };
})


}));

export default useUiStore;
