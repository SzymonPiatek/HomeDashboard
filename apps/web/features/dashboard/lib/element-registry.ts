import { Building2 } from "lucide-react";
import type { ComponentType } from "react";

import { LocationsListPageView } from "@/features/elements/locations/LocationsListPageView";

// Klucz jest zamkniętą listą — dodanie elementu bez wpisu w rejestrze poniżej jest
// błędem kompilacji, nie pustym kafelkiem na produkcji (.claude/rules/web.md).
export type ElementKey = "locations";

// Providerów jeszcze nie ma (ADR-0019 dotyczy kolejnej gałęzi) — pole zostaje jako
// wymagane o dopuszczalnie pustej wartości, żeby pierwszy provider nie zmieniał kształtu.
export type ProviderKey = never;

type ElementDefinition = {
  label: string;
  path: string;
  provider: ProviderKey | null;
  page: ComponentType;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

// Rejestr zna wyłącznie wejście do elementu — adresy wewnętrzne (lokalizacja,
// poziom) powstają w `features/elements/locations/lib/routes.ts`.
export const ELEMENT_REGISTRY: Record<ElementKey, ElementDefinition> = {
  locations: {
    label: "Lokalizacje",
    path: "/locations",
    provider: null,
    page: LocationsListPageView,
    icon: Building2,
  },
};
