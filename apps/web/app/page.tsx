import Link from "next/link";

import { AuthGate } from "@/features/auth/components/AuthGate";
import { Breadcrumbs } from "@/features/dashboard/components/Breadcrumbs";
import { Navbar } from "@/features/dashboard/components/Navbar";
import { BreadcrumbProvider } from "@/features/dashboard/lib/breadcrumbs";
import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function DashboardPage() {
  const elements = Object.values(ELEMENT_REGISTRY);

  return (
    <AuthGate>
      <BreadcrumbProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <Breadcrumbs />
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
            <h1 className="sr-only">Pulpit domowy</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {elements.map((element) => (
                <Link
                  key={element.path}
                  href={element.path}
                  className="group flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
                    <element.icon aria-hidden className="size-6" />
                  </span>
                  <span className="text-base font-semibold text-foreground">{element.label}</span>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </BreadcrumbProvider>
    </AuthGate>
  );
}
