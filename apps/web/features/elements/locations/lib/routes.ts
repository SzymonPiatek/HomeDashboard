// Jedyne miejsce, w którym powstają adresy wewnętrzne elementu "Lokalizacje"
// (.claude/rules/locations.md). Rejestr elementów zna wyłącznie `list`.
export const LOCATION_ROUTES = {
  list: "/locations",
  detail: (locationId: string) => `/locations/${locationId}`,
  level: (locationId: string, levelId: string) => `/locations/${locationId}/levels/${levelId}`,
} as const;
