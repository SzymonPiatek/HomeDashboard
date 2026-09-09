"use client";

import { authSessionSchema, type AuthSession } from "@repo/contracts/auth";
import { useQuery } from "@tanstack/react-query";

import { authKeys } from "./query-keys";

// Sesja zmienia się rzadko; logowanie i wylogowanie robią pełną nawigację przeglądarki
// (nowy QueryClient), więc staleTime chroni tylko przed zbędnym odpytywaniem w tle
// przy zwykłym przełączaniu widoków — .claude/rules/web.md.
const SESSION_STALE_TIME_MS = 60_000;

async function fetchSession(): Promise<AuthSession> {
  const response = await fetch("/api/auth/session");

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać sesji (status ${response.status}).`);
  }

  return authSessionSchema.parse(await response.json());
}

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchSession,
    staleTime: SESSION_STALE_TIME_MS,
    // Ponowienie nie pomoże przy błędzie walidacji kontraktu, a przy awarii sieci
    // użytkownik ma jawny przycisk "Spróbuj ponownie" w AuthGate.
    retry: false,
  });
}
