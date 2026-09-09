import Link from "next/link";

import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function DashboardPage() {
  const elements = Object.values(ELEMENT_REGISTRY);

  return (
    <>
      <h1 className="sr-only">Pulpit domowy</h1>
      {/* auto-fill z minmax daje responsywną liczbę kolumn bez ręcznych breakpointów (.claude/rules/web.md) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {elements.map((element) => (
          <Link
            key={element.path}
            href={element.path}
            className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <element.icon aria-hidden className="size-14 text-foreground" />
            </span>
            <span className="relative text-md font-semibold text-foreground">{element.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
