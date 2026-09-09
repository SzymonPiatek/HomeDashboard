export type Point = {
  xMm: number;
  yMm: number;
};

// Wysokość ściany jest dziś stała dla całego rzutu, nie polem ściany — spike
// nie modeluje jeszcze różnych wysokości. Do zmiany, gdy to się okaże potrzebne.
export const DEFAULT_WALL_HEIGHT_MM = 2500;

// Ściana jako gotowy blok o czterech rogach, nie oś + grubość linii: każdy punkt
// to realny narożnik prostokąta ściany, prosto z danych, bez wyliczania. Dwie
// ściany, które mają się stykać, dostają wspólne współrzędne narożników wprost
// tutaj — nie ma osobnego pola grubości ani formuły domykającej narożnik.
export type Wall = {
  id: string;
  points: [Point, Point, Point, Point];
};

export type Room = {
  id: string;
  name: string;
  vertices: Point[];
};

export type FloorPlanTestData = {
  walls: Wall[];
  rooms: Room[];
};
