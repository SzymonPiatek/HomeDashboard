import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";
import { LocationDetailPageView } from "@/features/elements/locations/LocationDetailPageView";

// Podstrona elementu — rejestr zna wyłącznie wejście /locations
// (.claude/rules/locations.md), więc widok importuje się tutaj wprost.
export default function LocationDetailPage() {
  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <Breadcrumbs />
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6">
            <LocationDetailPageView />
          </main>
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
