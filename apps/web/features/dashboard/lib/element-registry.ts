import type { ComponentType } from "react";

import { FloorPlanPageView } from "@/features/elements/floor-plan/FloorPlanPageView";

// Klucz jest zamkniętą listą — dodanie elementu bez wpisu w rejestrze poniżej jest
// błędem kompilacji, nie pustym kafelkiem na produkcji (.claude/rules/web.md).
export type ElementKey = "floor-plan";

// Providerów jeszcze nie ma (ADR-0019 dotyczy kolejnej gałęzi) — pole zostaje jako
// wymagane o dopuszczalnie pustej wartości, żeby pierwszy provider nie zmieniał kształtu.
export type ProviderKey = never;

type ElementDefinition = {
  label: string;
  path: string;
  provider: ProviderKey | null;
  page: ComponentType;
};

// Minimalna wersja na potrzeby tego spike'a — jedyny element to floor-plan.
export const ELEMENT_REGISTRY: Record<ElementKey, ElementDefinition> = {
  "floor-plan": {
    label: "Rzut mieszkania",
    path: "/floor-plan",
    provider: null,
    page: FloorPlanPageView,
  },
};
