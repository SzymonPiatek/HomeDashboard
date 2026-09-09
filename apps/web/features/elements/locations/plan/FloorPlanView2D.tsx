"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";

import { EditorCanvas } from "./editor/EditorCanvas";
import { EditorToolbar } from "./editor/EditorToolbar";
import { RoomNameForm } from "./editor/RoomNameForm";
import { useFloorPlanEditor } from "./editor/use-floor-plan-editor";
import { StaticFloorPlanView } from "./StaticFloorPlanView";

type FloorPlanView2DProps = {
  locationId: string;
  levelId: string;
  document: FloorPlanDocument;
  isEditMode: boolean;
};

export function FloorPlanView2D({
  locationId,
  levelId,
  document,
  isEditMode,
}: FloorPlanView2DProps) {
  if (!isEditMode) return <StaticFloorPlanView document={document} />;

  return <FloorPlanEditor locationId={locationId} levelId={levelId} document={document} />;
}

function FloorPlanEditor({
  locationId,
  levelId,
  document,
}: Omit<FloorPlanView2DProps, "isEditMode">) {
  const editor = useFloorPlanEditor(locationId, levelId, document);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <EditorToolbar
        tool={editor.tool}
        onToolChange={editor.handleToolChange}
        hasSelection={editor.selection !== null}
        onDeleteSelection={editor.handleDeleteSelection}
        canUndo={editor.canUndo}
        onUndo={editor.handleUndo}
        canRedo={editor.canRedo}
        onRedo={editor.handleRedo}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        onSave={editor.handleSave}
        onDiscard={editor.handleDiscardChanges}
      />
      {editor.saveError ? (
        <p role="alert" className="text-sm text-destructive">
          {editor.saveError}
        </p>
      ) : null}
      {editor.pendingRoomVertices ? (
        <RoomNameForm
          onConfirm={editor.handleRoomNameConfirm}
          onCancel={editor.handleRoomNameCancel}
        />
      ) : null}
      <EditorCanvas
        document={editor.draft}
        tool={editor.tool}
        selection={editor.selection}
        wallDraftStart={editor.wallDraftStart}
        roomDraftVertices={editor.roomDraftVertices}
        cursorPoint={editor.cursorPoint}
        onPointerDown={editor.handleCanvasPointerDown}
        onPointerMove={editor.handleCanvasPointerMove}
        onPointerUp={editor.handleCanvasPointerUp}
        shapeHandlers={{
          onPointerDown: editor.handleShapePointerDown,
          onKeyDown: editor.handleShapeKeyDown,
          onFocus: editor.handleShapeFocus,
        }}
      />
    </div>
  );
}
