import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";

// Wspólna powłoka wszystkich stron za logowaniem: Navbar zawsze, pod nim okruszki
// (puste, gdy strona żadnych nie zgłosiła przez useSetBreadcrumbs), na końcu treść
// strony. Padding i szerokość ustalone raz, tutaj — .claude/rules/web.md. `/login`
// zostaje poza tą grupą tras i tej powłoki nie dostaje.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <Breadcrumbs />
          <main className="flex w-full flex-1 flex-col gap-6 p-2 md:p-4 lg:p-6">{children}</main>
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
