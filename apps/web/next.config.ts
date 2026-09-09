import type { NextConfig } from "next";

// `next dev` odpala subprocess przez NODE_OPTIONS, gdzie --env-file* jest zakazane
// przez Node — więc env wczytujemy tu, nie flagą CLI (.claude/rules/dev.md).
for (const file of ["../../envs/shared.env", "../../envs/web.env"]) {
  try {
    process.loadEnvFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

// Jedyny dozwolony wyjątek od granicy front/back — .claude/rules/web.md.
const DEV_API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];

    return [{ source: "/api/:path*", destination: `${DEV_API_TARGET}/api/:path*` }];
  },
};

export default nextConfig;
