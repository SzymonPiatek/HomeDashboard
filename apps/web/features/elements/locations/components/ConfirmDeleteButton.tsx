"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteButtonProps = {
  // Pełny opis usuwanego zasobu do etykiet dostępności, np. `lokalizację „Mieszkanie”`.
  itemLabel: string;
  onConfirm: () => void;
  isPending?: boolean;
  error?: string | null;
};

// Usunięcie kasuje kaskadowo geometrię rzutu bez cofnięcia — wymaga jawnego
// potwierdzenia w interfejsie (.claude/rules/locations.md). Modal zamiast
// rozwijanego bloku w miejscu przycisku — ten sam wymóg potwierdzenia, mniej miejsca.
export function ConfirmDeleteButton({
  itemLabel,
  onConfirm,
  isPending,
  error,
}: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`Usuń ${itemLabel}`}
          tooltip={`Usuń ${itemLabel}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usunąć {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>Tej operacji nie da się cofnąć.</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            aria-label={`Potwierdź usunięcie: ${itemLabel}`}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Usuwanie…" : "Potwierdź"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
