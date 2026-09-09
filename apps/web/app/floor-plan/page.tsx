import { AuthGate } from "@/features/auth/components/AuthGate";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function FloorPlanPage() {
  const FloorPlanPageView = ELEMENT_REGISTRY["floor-plan"].page;

  return (
    <AuthGate>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-6">
          <FloorPlanPageView />
        </main>
      </div>
    </AuthGate>
  );
}
