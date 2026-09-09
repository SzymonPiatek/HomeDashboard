"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

import { useSession } from "../api/use-session";

// Osłania resztę aplikacji za sesją — cztery stany widoku wymagane przez
// .claude/rules/web.md (ładowanie, błąd, pusto/niezalogowany, dane).
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isSuccess && !session.data.authenticated) {
      router.replace("/login");
    }
  }, [session.isSuccess, session.data, router]);

  if (session.isPending) {
    return (
      <div
        role="status"
        aria-label="Sprawdzanie sesji…"
        className="flex min-h-dvh flex-col items-center justify-center gap-3"
      >
        <Skeleton aria-hidden="true" className="h-8 w-48" />
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-destructive">
          Nie udało się sprawdzić sesji. Sprawdź połączenie z siecią i spróbuj ponownie.
        </p>
        <Button type="button" onClick={() => session.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!session.data.authenticated) {
    // Przekierowanie do /login trwa w efekcie powyżej.
    return null;
  }

  return <>{children}</>;
}
