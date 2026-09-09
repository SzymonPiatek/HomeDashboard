"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Zapamiętanie wyboru jest wygodą, nie warunkiem działania przełącznika —
    // localStorage bywa zablokowany w trybie prywatnym.
  }
}

// Jedynym źródłem prawdy o bieżącym motywie jest klasa na <html>, ustawiona przez
// skrypt startowy w layout.tsx — stąd odczyt z DOM zamiast lokalnego stanu na starcie.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    persistTheme(nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  }

  const label = isDark ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny";

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      className="size-11"
      onClick={toggleTheme}
      disabled={isDark === null}
      aria-label={label}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
