import { describe, expect, it } from "vitest";

import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

import { LOCATION_ROUTES } from "./routes";

describe("LOCATION_ROUTES", () => {
  it("zgadza się z wejściem elementu w rejestrze (.claude/rules/locations.md)", () => {
    expect(ELEMENT_REGISTRY.locations.path).toBe(LOCATION_ROUTES.list);
  });

  it("buduje adres szczegółów lokalizacji", () => {
    expect(LOCATION_ROUTES.detail("loc-1")).toBe("/locations/loc-1");
  });

  it("buduje adres rzutu poziomu bez segmentu /plan", () => {
    expect(LOCATION_ROUTES.level("loc-1", "lvl-1")).toBe("/locations/loc-1/levels/lvl-1");
  });
});
