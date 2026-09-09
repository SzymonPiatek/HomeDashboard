"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useCreateLevel } from "../api/use-location";

type AddLevelFormProps = {
  locationId: string;
  className?: string;
};

export function AddLevelForm({ locationId, className }: AddLevelFormProps) {
  const createLevel = useCreateLevel(locationId);
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createLevel.mutate({ name: trimmedName }, { onSuccess: () => setName("") });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="new-level-name" className="text-sm font-medium">
            Nazwa poziomu
          </label>
          <Input
            id="new-level-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Parter"
            autoFocus
            required
          />
        </div>
        <Button
          type="submit"
          className="h-11"
          disabled={createLevel.isPending || name.trim().length === 0}
        >
          {createLevel.isPending ? "Dodawanie…" : "Dodaj"}
        </Button>
      </div>
      {createLevel.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {createLevel.error.message}
        </p>
      ) : null}
    </form>
  );
}
