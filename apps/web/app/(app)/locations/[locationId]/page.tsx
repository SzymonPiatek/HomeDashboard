import { LocationDetailPageView } from "@/features/elements/locations/LocationDetailPageView";

// Podstrona elementu — rejestr zna wyłącznie wejście /locations
// (.claude/rules/locations.md), więc widok importuje się tutaj wprost.
export default function LocationDetailPage() {
  return <LocationDetailPageView />;
}
