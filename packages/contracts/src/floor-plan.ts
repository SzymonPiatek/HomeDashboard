import { z } from "zod";

/** Ściana to blok o czterech jawnych rogach, bez grubości — ADR-0010. */
export const DEFAULT_WALL_HEIGHT_MM = 2500;
export const MIN_WALL_HEIGHT_MM = 100;
export const MAX_WALL_HEIGHT_MM = 10_000;

export const MIN_COORDINATE_MM = -100_000;
export const MAX_COORDINATE_MM = 100_000;

export const MAX_WALLS_PER_LEVEL = 200;
export const MAX_ROOMS_PER_LEVEL = 50;
export const MIN_ROOM_VERTICES = 3;
export const MAX_ROOM_VERTICES = 32;
export const ROOM_NAME_MAX_LENGTH = 60;

// .claude/rules/floor-plan.md — krok przyciągania do siatki jest stałą tu, nie kolumną w bazie.
export const SNAP_GRID_MM = 50;
export const DEFAULT_WALL_THICKNESS_MM = 200;
export const MIN_WALL_LENGTH_MM = 200;

// Jedyna jednostka w bazie, w kontrakcie i w kodzie — .claude/rules/floor-plan.md.
const coordinateSchema = z.number().int().min(MIN_COORDINATE_MM).max(MAX_COORDINATE_MM);

export const pointSchema = z.object({
  xMm: coordinateSchema,
  yMm: coordinateSchema,
});

// Identyfikator ściany/pokoju przychodzi od klienta jako uuid (crypto.randomUUID()).
export const wallSchema = z.object({
  id: z.string().uuid(),
  points: z.tuple([pointSchema, pointSchema, pointSchema, pointSchema]),
  heightMm: z
    .number()
    .int()
    .min(MIN_WALL_HEIGHT_MM)
    .max(MAX_WALL_HEIGHT_MM)
    .default(DEFAULT_WALL_HEIGHT_MM),
});

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(ROOM_NAME_MAX_LENGTH),
  vertices: z.array(pointSchema).min(MIN_ROOM_VERTICES).max(MAX_ROOM_VERTICES),
});

export const floorPlanDocumentSchema = z.object({
  version: z.number().int().min(0),
  walls: z.array(wallSchema).max(MAX_WALLS_PER_LEVEL),
  rooms: z.array(roomSchema).max(MAX_ROOMS_PER_LEVEL),
});

// PUT: `version` to wersja, od której klient wychodzi — .claude/rules/floor-plan.md.
export const putFloorPlanBodySchema = floorPlanDocumentSchema;

export type Point = z.infer<typeof pointSchema>;
export type Wall = z.infer<typeof wallSchema>;
export type Room = z.infer<typeof roomSchema>;
export type FloorPlanDocument = z.infer<typeof floorPlanDocumentSchema>;
export type PutFloorPlanBody = z.infer<typeof putFloorPlanBodySchema>;
