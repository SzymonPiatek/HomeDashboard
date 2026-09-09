"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUpdateLevel } from "./api/use-location";

type LevelNameFormProps = {
  locationId: string;
  levelId: string;
  currentName: string;
};

// Nazwa poziomu jest nagłówkiem strony rzutu (h1) — edycja przełącza go w formularz,
// bez zmiany struktury nagłówków (.claude/rules/web.md). Wzorem LocationNameForm.
export function LevelNameForm({ locationId, levelId, currentName }: LevelNameFormProps) {
  const updateLevel = useUpdateLevel(locationId);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    updateLevel.mutate(
      { levelId, input: { name: trimmedName } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{currentName}</h1>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => {
            setName(currentName);
            setIsEditing(true);
          }}
        >
          Zmień nazwę
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <Input
          aria-label={`Nazwa poziomu „${currentName}”`}
          autoFocus
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Button
          type="submit"
          className="h-11"
          disabled={updateLevel.isPending || name.trim().length === 0}
        >
          {updateLevel.isPending ? "Zapisywanie…" : "Zapisz"}
        </Button>
        <Button type="button" variant="ghost" className="h-11" onClick={() => setIsEditing(false)}>
          Anuluj
        </Button>
      </div>
      {updateLevel.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {updateLevel.error.message}
        </p>
      ) : null}
    </form>
  );
}
