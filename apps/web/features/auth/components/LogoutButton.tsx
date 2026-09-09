"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useLogout } from "../api/use-logout";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        className="h-11 gap-2"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut aria-hidden="true" className="size-4" />
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
