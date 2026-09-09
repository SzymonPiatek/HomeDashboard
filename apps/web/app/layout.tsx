import type { Metadata } from "next";
import type { ReactNode } from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulpit domowy",
  description: "Pulpit domowy z rzutem mieszkania",
};

// Ustawia klasę `dark` przed pierwszym malowaniem, żeby uniknąć mignięcia złym
// motywem — .claude/rules/web.md. Zapamiętany wybór ma pierwszeństwo przed
// preferencją systemową; localStorage bywa zablokowany (tryb prywatny), stąd try/catch.
const THEME_INIT_SCRIPT = `
  (function () {
    var stored = null;
    try {
      stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    } catch (error) {}
    var isDark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
