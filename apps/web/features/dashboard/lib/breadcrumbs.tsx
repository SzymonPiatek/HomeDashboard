"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const BreadcrumbItemsContext = createContext<BreadcrumbItem[]>([]);
const BreadcrumbSetterContext = createContext<Dispatch<SetStateAction<BreadcrumbItem[]>> | null>(
  null,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  return (
    <BreadcrumbSetterContext.Provider value={setItems}>
      <BreadcrumbItemsContext.Provider value={items}>{children}</BreadcrumbItemsContext.Provider>
    </BreadcrumbSetterContext.Provider>
  );
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  return useContext(BreadcrumbItemsContext);
}

// Strona zgłasza swój ślad okruszków raz, gdy zna nazwy — Breadcrumbs go tylko czyta i nie
// zna elementów (rejestr jest jedynym miejscem importującym features/elements/**,
// .claude/rules/web.md). `items` musi być zmemoizowane u wywołującego (useMemo),
// inaczej efekt odpala przy każdym renderze.
export function useSetBreadcrumbs(items: BreadcrumbItem[]): void {
  const setItems = useContext(BreadcrumbSetterContext);

  useEffect(() => {
    setItems?.(items);
    return () => setItems?.([]);
  }, [setItems, items]);
}
