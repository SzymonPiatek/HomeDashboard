export type EditorTool = "select" | "wall" | "room";

export type EditorSelection = { type: "wall" | "room"; id: string } | null;
