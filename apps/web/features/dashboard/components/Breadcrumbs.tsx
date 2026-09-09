"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { useBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

// Pasek okruszków pod Navbarem, pełna szerokość. Przewija się poziomo bez widocznego
// paska na wąskich ekranach (klasa scrollbar-hide, app/globals.css). Bez propsów: to
// element ramki pulpitu, nie komponent domenowy — .claude/rules/web.md.
export function Breadcrumbs() {
  const trail = useBreadcrumbs();
  const items = [{ label: "Pulpit", href: "/" }, ...trail];

  return (
    <nav aria-label="Okruszki" className="px-2 py-2">
      <ol className="scrollbar-hide flex items-center gap-1 overflow-x-auto whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              ) : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="px-1 py-1 text-sm font-medium"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded px-1 py-1 text-sm text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
