import { z } from "zod";

/**
 * `?device=` startu przepływu OAuth — endpoint redirect-only, więc walidacja
 * żyje lokalnie w apps/api, nie w @repo/contracts (.claude/rules/contracts.md).
 */
export const deviceSchema = z.enum(["kiosk", "standard"]);
export type Device = z.infer<typeof deviceSchema>;

export const startQuerySchema = z.object({ device: deviceSchema });
