import Link from "next/link";
import type { ComponentType } from "react";

type TileProps = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export function Tile({ href, label, icon: Icon }: TileProps) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:bg-primary/15 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Icon aria-hidden className="size-14" />
      </span>
      <span className="relative text-sm font-semibold text-foreground">{label}</span>
    </Link>
  );
}
