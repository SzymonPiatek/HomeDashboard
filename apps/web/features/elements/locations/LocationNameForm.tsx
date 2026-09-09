"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import { Check, Pencil, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUpdateLocation } from "./api/use-location";

type LocationNameFormProps = {
  locationId: string;
  currentName: string;
};

// Nazwa lokalizacji jest nagłówkiem strony (h1) — edycja podmienia go w miejscu
// na input tej samej wielkości, żeby układ strony się nie przesuwał.
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
          size="icon"
          className="size-11"
          aria-label="Zmień nazwę"
          onClick={() => {
            setName(currentName);
            setIsEditing(true);
          }}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Nazwa lokalizacji"
          autoFocus
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          required
          className="h-auto border-0 bg-transparent p-0 text-2xl font-semibold shadow-none"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="Zapisz"
          disabled={updateLocation.isPending || name.trim().length === 0}
        >
          <Check aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="Anuluj"
          onClick={() => setIsEditing(false)}
        >
          <X aria-hidden="true" />
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
