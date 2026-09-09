import { FloorPlanViewer } from "./FloorPlanViewer";

// Widok strony elementu — bez propsów; ramka strony (AuthGate, Navbar) należy
// do powłoki obszaru w app/floor-plan/page.tsx (.claude/rules/web.md).
export function FloorPlanPageView() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Rzut mieszkania</h1>
        <p className="text-muted-foreground">
          Prototyp: te same dane ścian i pokoi w widoku 2D i 3D.
        </p>
      </div>
      <FloorPlanViewer />
    </div>
  );
}
