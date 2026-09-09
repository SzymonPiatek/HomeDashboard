import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

// Zastępuje dawny górny pasek (Navbar): te same dwie akcje jako pływający stos
// w prawym dolnym rogu, `position: fixed` niezależny od przewijania strony.
// Kolejność w DOM = kolejność wizualna od góry; kotwica w rogu (bottom-4 right-4)
// sprawia, że dołożenie kolejnej ikony rozciąga stos w górę, nie w dół.
export function CornerActions() {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-center gap-2">
      <ThemeToggle />
      <LogoutButton />
    </div>
  );
}
