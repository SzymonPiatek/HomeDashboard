import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function LocationsPage() {
  const LocationsListPageView = ELEMENT_REGISTRY.locations.page;

  return <LocationsListPageView />;
}
