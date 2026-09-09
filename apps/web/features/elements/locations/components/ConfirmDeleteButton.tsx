"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDeleteButtonProps = {
  // Pełny opis usuwanego zasobu do etykiet dostępności, np. `lokalizację „Mieszkanie”`.
  itemLabel: string;
  onConfirm: () => void;
  isPending?: boolean;
};

// Usunięcie kasuje kaskadowo geometrię rzutu bez cofnięcia — wymaga jawnego
// potwierdzenia w interfejsie (.claude/rules/locations.md). Dwuetapowy przycisk
// zamiast modalu: prostsze, wciąż w pełni dostępne klawiaturowo. Blok potwierdzenia
// montuje się od nowa przy zmianie stanu, więc `autoFocus` przenosi fokus bez `ref`.
export function ConfirmDeleteButton({ itemLabel, onConfirm, isPending }: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-11"
        aria-label={`Usuń ${itemLabel}`}
        onClick={() => setIsConfirming(true)}
      >
        Usuń
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span role="alert" className="text-sm text-destructive">
        Tej operacji nie da się cofnąć.
      </span>
      <Button
        type="button"
        variant="destructive"
        className="h-11"
        aria-label={`Potwierdź usunięcie: ${itemLabel}`}
        autoFocus
        disabled={isPending}
        onClick={onConfirm}
      >
        {isPending ? "Usuwanie…" : "Potwierdź usunięcie"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11"
        disabled={isPending}
        onClick={() => setIsConfirming(false)}
      >
        Anuluj
      </Button>
    </div>
  );
}
