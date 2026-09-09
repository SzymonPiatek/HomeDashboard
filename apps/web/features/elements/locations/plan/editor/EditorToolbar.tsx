"use client";

import { MousePointer2, Redo2, Save, Trash2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { EditorTool } from "./types";

type EditorToolbarProps = {
  tool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  hasSelection: boolean;
  onDeleteSelection: () => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
};

// Na razie jedyne narzędzie — "Dodaj ścianę"/"Dodaj pokój" dołączą tu, gdy będą gotowe.
const TOOL_BUTTONS: { tool: EditorTool; label: string; icon: typeof MousePointer2 }[] = [
  { tool: "select", label: "Zaznacz", icon: MousePointer2 },
];

export function EditorToolbar({
  tool,
  onToolChange,
  hasSelection,
  onDeleteSelection,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  isDirty,
  isSaving,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TOOL_BUTTONS.map((item) => (
        <Button
          key={item.tool}
          type="button"
          variant="ghost"
          size="icon"
          aria-pressed={tool === item.tool}
          aria-label={item.label}
          tooltip={item.label}
          className={cn("size-11", tool === item.tool && "bg-accent text-accent-foreground")}
          onClick={() => onToolChange(item.tool)}
        >
          <item.icon aria-hidden="true" />
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label="Usuń zaznaczone"
        tooltip="Usuń zaznaczone"
        disabled={!hasSelection}
        onClick={onDeleteSelection}
      >
        <Trash2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label="Cofnij"
        tooltip="Cofnij"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label="Ponów"
        tooltip="Ponów"
        disabled={!canRedo}
        onClick={onRedo}
      >
        <Redo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="ml-auto h-11 gap-2"
        disabled={!isDirty || isSaving}
        onClick={onSave}
      >
        <Save aria-hidden="true" className="size-4" />
        {isSaving ? "Zapisywanie…" : "Zapisz rzut"}
      </Button>
    </div>
  );
}
