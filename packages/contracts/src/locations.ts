import { z } from "zod";

import { paginatedResponseSchema, paginationQuerySchema } from "./pagination.js";

/** Limity egzekwowane serwerowo — .claude/rules/locations.md. */
export const MAX_LOCATIONS_PER_ACCOUNT = 50;
export const MAX_LEVELS_PER_LOCATION = 20;
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 60;

const nameSchema = z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH);

export const locationParamsSchema = z.object({
  locationId: z.string().min(1),
});

export const levelParamsSchema = locationParamsSchema.extend({
  levelId: z.string().min(1),
});

export const locationSummarySchema = z.object({
  id: z.string(),
  name: nameSchema,
  levelCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
});

export const levelSummarySchema = z.object({
  id: z.string(),
  name: nameSchema,
  order: z.number().int(),
});

export const locationDetailSchema = z.object({
  id: z.string(),
  name: nameSchema,
  levels: z.array(levelSummarySchema),
});

export const listLocationsQuerySchema = paginationQuerySchema;
export const listLocationsResponseSchema = paginatedResponseSchema(locationSummarySchema);

export const createLocationBodySchema = z.object({ name: nameSchema });
export const updateLocationBodySchema = z.object({ name: nameSchema });

// Klient nie przysyła `order` — nadaje go serwer (.claude/rules/locations.md).
export const createLevelBodySchema = z.object({ name: nameSchema });
export const updateLevelBodySchema = z.object({ name: nameSchema });

export type LocationParams = z.infer<typeof locationParamsSchema>;
export type LevelParams = z.infer<typeof levelParamsSchema>;
export type LocationSummary = z.infer<typeof locationSummarySchema>;
export type LevelSummary = z.infer<typeof levelSummarySchema>;
export type LocationDetail = z.infer<typeof locationDetailSchema>;
export type ListLocationsResponse = z.infer<typeof listLocationsResponseSchema>;
export type CreateLocationBody = z.infer<typeof createLocationBodySchema>;
export type UpdateLocationBody = z.infer<typeof updateLocationBodySchema>;
export type CreateLevelBody = z.infer<typeof createLevelBodySchema>;
export type UpdateLevelBody = z.infer<typeof updateLevelBodySchema>;
