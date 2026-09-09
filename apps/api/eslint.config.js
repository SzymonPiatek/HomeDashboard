import { nodeConfig } from "@repo/config/eslint/node";

export default [
  ...nodeConfig,
  {
    // Prisma wymaga default exportu w swoim pliku konfiguracyjnym.
    files: ["prisma.config.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
