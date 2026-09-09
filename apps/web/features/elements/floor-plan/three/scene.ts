import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { BoundingBox } from "../geometry";
import type { FloorPlanTestData, Room, Wall } from "../types";

// mm to jedyna jednostka danych (ADR-0002); metry żyją wyłącznie w scenie Three.js,
// żeby liczby kamery/kontrolek miały rozsądną skalę.
export const MM_TO_M = 1 / 1000;

export type Disposable = { dispose: () => void };

export type Scene3D = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  disposables: Disposable[];
};

// Tokeny motywu są zapisane jako oklch() (packages/config/tailwind/theme.css), a
// przeglądarka od pewnego czasu zwraca z getComputedStyle tę samą notację zamiast
// normalizować do rgb() — a Three.js Color.setStyle() parsuje tylko rgb()/hsl()/hex,
// więc oklch() cicho zawodzi (ostrzeżenie w konsoli, kolor zostaje domyślną bielą).
// Rasteryzacja przez canvas 2D wymusza sRGB niezależnie od notacji wejściowej.
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

// Ściana = bryła wyciągnięta z segmentu 2D: długość × thicknessMm × heightMm (ADR-0002),
// dowód, że 2D i 3D czytają te same dane.
function buildWallMesh(wall: Wall, colorCss: string): { mesh: THREE.Mesh } & Disposable {
  const startX = wall.startXMm * MM_TO_M;
  const startZ = wall.startYMm * MM_TO_M;
  const endX = wall.endXMm * MM_TO_M;
  const endZ = wall.endYMm * MM_TO_M;
  const lengthM = Math.hypot(endX - startX, endZ - startZ);
  const thicknessM = wall.thicknessMm * MM_TO_M;
  const heightM = wall.heightMm * MM_TO_M;

  const geometry = new THREE.BoxGeometry(lengthM, heightM, thicknessM);
  const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorCss) });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set((startX + endX) / 2, heightM / 2, (startZ + endZ) / 2);
  mesh.rotation.y = -Math.atan2(endZ - startZ, endX - startX);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

// Podłoga = triangulacja wielokąta pokoju (THREE.Shape), tak jak w blueprint3d,
// z tym samym mapowaniem mm → m co ściany.
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

function addFloorPlanMeshes(scene: THREE.Scene, data: FloorPlanTestData): Disposable[] {
  const wallColor = resolveCssColor("--foreground");
  const floorColor = resolveCssColor("--muted");
  const disposables: Disposable[] = [];

  for (const room of data.rooms) {
    const floor = buildFloorMesh(room, floorColor);
    scene.add(floor.mesh);
    disposables.push(floor);
  }
  for (const wall of data.walls) {
    const wallMesh = buildWallMesh(wall, wallColor);
    scene.add(wallMesh.mesh);
    disposables.push(wallMesh);
  }

  return disposables;
}

export function createFloorPlanScene(
  container: HTMLElement,
  box: BoundingBox,
  data: FloorPlanTestData,
): Scene3D {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(resolveCssColor("--background"));

  const camera = createCamera(container, box);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = createControls(camera, renderer, box);
  addLights(scene, box);
  const disposables = addFloorPlanMeshes(scene, data);

  return { scene, camera, renderer, controls, disposables };
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
