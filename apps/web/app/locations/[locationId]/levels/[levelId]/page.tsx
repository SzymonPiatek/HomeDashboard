import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";
import { LevelPlanPageView } from "@/features/elements/locations/LevelPlanPageView";

// Strona poziomu JEST rzutem, bez segmentu /plan (.claude/rules/locations.md).
export default function LevelPlanPage() {
  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <Breadcrumbs />
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-6">
            <LevelPlanPageView />
          </main>
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
