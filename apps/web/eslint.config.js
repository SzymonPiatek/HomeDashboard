import { reactConfig } from "@repo/config/eslint/react";

export default [
  ...reactConfig,
  {
    // Vitest wymaga domyślnego eksportu w konfiguracji — jak next.config.ts.
    files: ["vitest.config.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
