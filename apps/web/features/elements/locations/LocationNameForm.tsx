"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUpdateLocation } from "./api/use-location";

type LocationNameFormProps = {
  locationId: string;
  currentName: string;
};

// Nazwa lokalizacji jest nagłówkiem strony (h1) — edycja przełącza go w formularz,
// bez zmiany struktury nagłówków (.claude/rules/web.md).
export function LocationNameForm({ locationId, currentName }: LocationNameFormProps) {
  const updateLocation = useUpdateLocation(locationId);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    updateLocation.mutate({ name: trimmedName }, { onSuccess: () => setIsEditing(false) });
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
        <div className="flex flex-col gap-1">
          <label htmlFor="location-name" className="text-sm font-medium">
            Nazwa lokalizacji
          </label>
          <Input
            id="location-name"
            autoFocus
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="h-11"
          disabled={updateLocation.isPending || name.trim().length === 0}
        >
          {updateLocation.isPending ? "Zapisywanie…" : "Zapisz"}
        </Button>
        <Button type="button" variant="ghost" className="h-11" onClick={() => setIsEditing(false)}>
          Anuluj
        </Button>
      </div>
      {updateLocation.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {updateLocation.error.message}
        </p>
      ) : null}
    </form>
  );
}
