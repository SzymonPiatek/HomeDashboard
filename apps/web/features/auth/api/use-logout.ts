"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authKeys } from "./query-keys";

// Wylogowanie nie jest startem przepływu OAuth, więc jest zwykłym fetchem,
// nie nawigacją — .claude/rules/auth.md.
async function postLogout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw new Error(`Wylogowanie nie powiodło się (status ${response.status}).`);
  }
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
      router.push("/login");
    },
    // Serwer odrzucił wylogowanie najczęściej dlatego, że sesji już nie ma
    // (np. 401) — zostawanie na stronie w takim stanie nie ma sensu,
    // więc mimo błędu przekierowujemy tak samo jak przy sukcesie.
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
      router.push("/login");
    },
  });
}
