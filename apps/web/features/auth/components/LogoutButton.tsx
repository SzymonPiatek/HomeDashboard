"use client";

import { Button } from "@/components/ui/Button";

import { useLogout } from "../api/use-logout";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Wylogowywanie…" : "Wyloguj się"}
      </Button>
      {logout.isError ? (
        // Przekierowanie do /login trwa w onError hooka; komunikat jest na wypadek,
        // gdyby z jakiegoś powodu nie nastąpiło od razu — .claude/rules/web.md.
        <p role="alert" className="text-sm text-destructive">
          Sesja wygasła. Trwa przekierowanie do logowania…
        </p>
      ) : null}
    </div>
  );
}
