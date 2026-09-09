import type { FloorPlanDocument, Room, Wall } from "@repo/contracts/floor-plan";
import { DEFAULT_WALL_HEIGHT_MM } from "@repo/contracts/floor-plan";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { BoundingBox } from "../geometry/geometry";

export const MM_TO_M = 1 / 1000;

export type Disposable = { dispose: () => void };

// Ściana chowana, gdy kamera stoi po jej zewnętrznej stronie względem najbliższego
// pokoju (updateNearCameraWallVisibility) — wzorem src/three/edge.ts z blueprint3d.
export type NearCameraWall = {
  mesh: THREE.Mesh;
  midpoint: THREE.Vector3;
  outwardNormal: THREE.Vector3;
};

export type Scene3D = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  disposables: Disposable[];
  nearCameraWalls: NearCameraWall[];
};

// oklch() z getComputedStyle nie parsuje się w Three.Color — rasteryzujemy przez canvas.
export function resolveCssColor(cssVariable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${cssVariable})`;
  document.body.appendChild(probe);
  const specified = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return specified;

  context.fillStyle = specified;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function createCamera(container: HTMLElement, box: BoundingBox): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  const centerX = ((box.minXMm + box.maxXMm) / 2) * MM_TO_M;
  const centerZ = ((box.minYMm + box.maxYMm) / 2) * MM_TO_M;
  const spanM = Math.max(box.maxXMm - box.minXMm, box.maxYMm - box.minYMm) * MM_TO_M;

  camera.position.set(centerX + spanM * 0.6, spanM * 0.8, centerZ + spanM);
  camera.lookAt(centerX, 0, centerZ);

  return camera;
}

function createControls(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  box: BoundingBox,
): OrbitControls {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(
    ((box.minXMm + box.maxXMm) / 2) * MM_TO_M,
    0,
    ((box.minYMm + box.maxYMm) / 2) * MM_TO_M,
  );
  controls.enableDamping = true;
  controls.update();

  return controls;
}

function addLights(scene: THREE.Scene, box: BoundingBox): void {
  const spanM = Math.max(box.maxXMm - box.minXMm, box.maxYMm - box.minYMm) * MM_TO_M;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(spanM, spanM * 2, spanM);
  scene.add(directionalLight);
}

function getWallMidpointM(wall: Wall): THREE.Vector3 {
  const sum = wall.points.reduce(
    (acc, point) => acc.add(new THREE.Vector3(point.xMm, 0, point.yMm)),
    new THREE.Vector3(),
  );
  return sum.divideScalar(wall.points.length).multiplyScalar(MM_TO_M);
}

// Krótszy z dwóch sąsiednich boków prostokąta ściany to jej grubość — już prostopadły
// do długości ściany, więc jest kandydatem na normalną (kierunek ustalany niżej).
function getWallThicknessDirection(wall: Wall): THREE.Vector3 {
  const [p0, p1, p2] = wall.points;
  const edgeA = new THREE.Vector3(p1.xMm - p0.xMm, 0, p1.yMm - p0.yMm);
  const edgeB = new THREE.Vector3(p2.xMm - p1.xMm, 0, p2.yMm - p1.yMm);
  const shorterEdge = edgeA.length() < edgeB.length() ? edgeA : edgeB;
  return shorterEdge.normalize();
}

function computeRoomCentroidsM(rooms: Room[]): THREE.Vector3[] {
  return rooms.map((room) => {
    const sum = room.vertices.reduce(
      (acc, vertex) => acc.add(new THREE.Vector3(vertex.xMm, 0, vertex.yMm)),
      new THREE.Vector3(),
    );
    return sum.divideScalar(room.vertices.length).multiplyScalar(MM_TO_M);
  });
}

function computeFallbackCentroidM(midpoints: THREE.Vector3[]): THREE.Vector3 {
  const sum = midpoints.reduce((acc, point) => acc.add(point), new THREE.Vector3());
  return midpoints.length > 0 ? sum.divideScalar(midpoints.length) : sum;
}

function findNearestCentroidM(point: THREE.Vector3, centroids: THREE.Vector3[]): THREE.Vector3 {
  return centroids.reduce((nearest, candidate) =>
    point.distanceTo(candidate) < point.distanceTo(nearest) ? candidate : nearest,
  );
}

// Ściana nie zna "swojego" pokoju (Wall nie ma odniesienia do Room) — najbliższy
// środek ciężkości pokoju zastępuje przynależność ściany do konkretnej bryły.
function getWallOutwardNormal(
  wall: Wall,
  midpointM: THREE.Vector3,
  referenceCentroidsM: THREE.Vector3[],
): THREE.Vector3 {
  const direction = getWallThicknessDirection(wall);
  const nearestCentroid = findNearestCentroidM(midpointM, referenceCentroidsM);
  const towardOutside = new THREE.Vector3().subVectors(midpointM, nearestCentroid);

  if (towardOutside.lengthSq() > 0 && direction.dot(towardOutside) < 0) {
    direction.negate();
  }
  return direction;
}

function buildWallMesh(wall: Wall, colorCss: string): { mesh: THREE.Mesh } & Disposable {
  const shape = new THREE.Shape(
    wall.points.map((point) => new THREE.Vector2(point.xMm * MM_TO_M, -point.yMm * MM_TO_M)),
  );
  const heightM = (wall.heightMm ?? DEFAULT_WALL_HEIGHT_MM) * MM_TO_M;
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: heightM, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorCss) });
  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

function buildFloorMesh(room: Room, colorCss: string): { mesh: THREE.Mesh } & Disposable {
  const shape = new THREE.Shape(
    room.vertices.map((vertex) => new THREE.Vector2(vertex.xMm * MM_TO_M, -vertex.yMm * MM_TO_M)),
  );
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorCss),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

function addFloorPlanMeshes(
  scene: THREE.Scene,
  document: FloorPlanDocument,
): { disposables: Disposable[]; nearCameraWalls: NearCameraWall[] } {
  const wallColor = resolveCssColor("--foreground");
  const floorColor = resolveCssColor("--muted");
  const disposables: Disposable[] = [];
  const nearCameraWalls: NearCameraWall[] = [];

  for (const room of document.rooms) {
    const floor = buildFloorMesh(room, floorColor);
    scene.add(floor.mesh);
    disposables.push(floor);
  }

  const roomCentroids = computeRoomCentroidsM(document.rooms);
  const wallMidpoints = document.walls.map((wall) => getWallMidpointM(wall));
  const referenceCentroids =
    roomCentroids.length > 0 ? roomCentroids : [computeFallbackCentroidM(wallMidpoints)];

  for (const wall of document.walls) {
    const wallMesh = buildWallMesh(wall, wallColor);
    scene.add(wallMesh.mesh);
    disposables.push(wallMesh);

    const midpoint = getWallMidpointM(wall);
    const outwardNormal = getWallOutwardNormal(wall, midpoint, referenceCentroids);
    nearCameraWalls.push({ mesh: wallMesh.mesh, midpoint, outwardNormal });
  }

  return { disposables, nearCameraWalls };
}

export function createFloorPlanScene(
  container: HTMLElement,
  box: BoundingBox,
  document: FloorPlanDocument,
): Scene3D {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(resolveCssColor("--background"));

  const camera = createCamera(container, box);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = createControls(camera, renderer, box);
  addLights(scene, box);
  const { disposables, nearCameraWalls } = addFloorPlanMeshes(scene, document);

  return { scene, camera, renderer, controls, disposables, nearCameraWalls };
}

const scratchDirectionToCamera = new THREE.Vector3();

// Wywoływane co klatkę (FloorPlanView3D) — jedna reużywana Vector3 zamiast alokacji
// na każdą ścianę, żeby pętla animacji nie generowała śmieci dla GC.
export function updateNearCameraWallVisibility(
  camera: THREE.Camera,
  walls: NearCameraWall[],
): void {
  for (const wall of walls) {
    scratchDirectionToCamera.subVectors(camera.position, wall.midpoint).normalize();
    wall.mesh.visible = wall.outwardNormal.dot(scratchDirectionToCamera) < 0;
  }
}

export function resizeFloorPlanScene(
  container: HTMLElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
): void {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
