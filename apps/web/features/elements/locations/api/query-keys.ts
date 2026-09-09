// Jedyne miejsce budowania kluczy zapytań elementu "Lokalizacje" — .claude/rules/web.md.
export const locationKeys = {
  all: () => ["locations"] as const,
  detail: (locationId: string) => ["locations", locationId] as const,
  plan: (locationId: string, levelId: string) =>
    ["locations", locationId, "levels", levelId, "plan"] as const,
};
