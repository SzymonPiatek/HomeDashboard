"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useCreateLocation } from "../api/use-locations";

type AddLocationFormProps = {
  className?: string;
};

export function AddLocationForm({ className }: AddLocationFormProps) {
  const createLocation = useCreateLocation();
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createLocation.mutate({ name: trimmedName }, { onSuccess: () => setName("") });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="new-location-name" className="text-sm font-medium">
            Nazwa lokalizacji
          </label>
          <Input
            id="new-location-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Mieszkanie"
            autoFocus
            required
          />
        </div>
        <Button
          type="submit"
          className="h-11"
          disabled={createLocation.isPending || name.trim().length === 0}
        >
          {createLocation.isPending ? "Dodawanie…" : "Dodaj"}
        </Button>
      </div>
      {createLocation.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {createLocation.error.message}
        </p>
      ) : null}
    </form>
  );
}
