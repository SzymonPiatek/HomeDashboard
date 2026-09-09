import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const baseConfig = [
  {
    ignores: ["**/dist/**", "**/.next/**", "**/.turbo/**", "**/node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-syntax": [
        "error",
        {
          // .claude/rules/typescript.md — wyłącznie named exports.
          selector: "ExportDefaultDeclaration",
          message: "Default export jest zakazany poza plikami wymaganymi przez framework.",
        },
      ],
    },
  },
  {
    // Format ESLint flat config wymaga default exportu — to nie jest kod aplikacji.
    files: ["eslint.config.js", "eslint.config.mjs", "eslint.config.cjs"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
