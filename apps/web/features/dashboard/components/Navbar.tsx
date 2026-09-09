import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

// Górna belka pulpitu — bez tła, wyłącznie przełącznik motywu i wylogowanie.
// Bez propsów: to element ramki pulpitu, nie komponent domenowy — .claude/rules/web.md.
export function Navbar() {
  return (
    <nav aria-label="Pulpit" className="flex items-center justify-end gap-2 p-2">
      <ThemeToggle />
      <LogoutButton />
    </nav>
  );
}
