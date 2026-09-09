import globals from "globals";

import { baseConfig } from "./base.js";

// Pliki wymagane przez Next.js muszą mieć default export (.claude/rules/typescript.md).
const FRAMEWORK_FILES = [
  "**/app/**/page.tsx",
  "**/app/**/layout.tsx",
  "**/app/**/error.tsx",
  "**/app/**/loading.tsx",
  "**/app/**/not-found.tsx",
  "**/app/**/template.tsx",
  "**/next.config.ts",
  "**/postcss.config.mjs",
];

export const reactConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: FRAMEWORK_FILES,
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
