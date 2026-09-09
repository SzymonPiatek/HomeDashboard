import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";
import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function LocationsPage() {
  const LocationsListPageView = ELEMENT_REGISTRY.locations.page;

  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <Breadcrumbs />
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6">
            <LocationsListPageView />
          </main>
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
