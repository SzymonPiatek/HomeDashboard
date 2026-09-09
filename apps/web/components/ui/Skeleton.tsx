import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

// motion-safe: respektuje prefers-reduced-motion — .claude/rules/web.md.
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("motion-safe:animate-pulse rounded-md bg-muted", className)} {...props} />
  );
}
