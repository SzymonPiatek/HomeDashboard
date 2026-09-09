"use client";

import { ROOM_NAME_MAX_LENGTH } from "@repo/contracts/floor-plan";
import { X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RoomNameFormProps = {
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

export function RoomNameForm({ onConfirm, onCancel }: RoomNameFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onConfirm(trimmedName);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[500px] flex-wrap items-end gap-2 rounded-lg border bg-card p-3 shadow-sm"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="new-room-name" className="text-sm font-medium">
          Nazwa pokoju
        </label>
        <Input
          id="new-room-name"
          value={name}
          maxLength={ROOM_NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          placeholder="np. Salon"
          autoFocus
          required
        />
      </div>
      <Button type="submit" className="h-11" disabled={name.trim().length === 0}>
        Dodaj
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label="Anuluj"
        tooltip="Anuluj"
        onClick={onCancel}
      >
        <X aria-hidden="true" />
      </Button>
    </form>
  );
}
