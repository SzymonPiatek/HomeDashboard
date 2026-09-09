import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { CornerActions } from "@/features/dashboard/components/CornerActions";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";

// Wspólna powłoka wszystkich stron za logowaniem: okruszki na górze (puste, gdy
// strona żadnych nie zgłosiła przez useSetBreadcrumbs), treść strony, na końcu
// pływające akcje konta w rogu (CornerActions — nie zajmują stałego paska u góry).
// Padding i szerokość ustalone raz, tutaj — .claude/rules/web.md. `/login` zostaje
// poza tą grupą tras i tej powłoki nie dostaje.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Breadcrumbs />
          <main className="flex w-full flex-1 flex-col gap-6 p-2 md:p-4 lg:p-6">{children}</main>
          <CornerActions />
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
