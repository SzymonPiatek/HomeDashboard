import { createApp } from "./app.js";
import { readEnv } from "./config/env.js";

const env = readEnv();

createApp({ env }).listen(env.PORT, () => {
  console.log(JSON.stringify({ level: "info", msg: "api listening", port: env.PORT }));
});
