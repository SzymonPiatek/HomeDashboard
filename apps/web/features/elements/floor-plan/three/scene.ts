import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { BoundingBox } from "../geometry";
import { DEFAULT_WALL_HEIGHT_MM } from "../types";
import type { FloorPlanTestData, Room, Wall } from "../types";

export const MM_TO_M = 1 / 1000;

export type Disposable = { dispose: () => void };

export type Scene3D = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  disposables: Disposable[];
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

function buildWallMesh(wall: Wall, colorCss: string): { mesh: THREE.Mesh } & Disposable {
  const shape = new THREE.Shape(
    wall.points.map((point) => new THREE.Vector2(point.xMm * MM_TO_M, -point.yMm * MM_TO_M)),
  );
  const heightM = DEFAULT_WALL_HEIGHT_MM * MM_TO_M;
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
