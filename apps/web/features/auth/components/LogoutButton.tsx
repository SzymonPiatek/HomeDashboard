"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useLogout } from "../api/use-logout";

export function LogoutButton() {
  const logout = useLogout();
  const label = logout.isPending ? "Wylogowywanie…" : "Wyloguj się";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="default"
        size="icon"
        className="size-11"
        aria-label={label}
        tooltip={label}
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut aria-hidden="true" />
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
