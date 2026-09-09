// Klucz zapamiętanego wyboru motywu w localStorage — współdzielony między skryptem
// startowym w layout.tsx (przed hydracją) i ThemeToggle (po hydracji).
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";
