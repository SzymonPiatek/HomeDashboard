"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";
import { useEffect, useRef } from "react";

import { getFloorPlanBoundingBox } from "./geometry/geometry";
import {
  createFloorPlanScene,
  resizeFloorPlanScene,
  updateNearCameraWallVisibility,
} from "./three/scene";

export type WallVisibilityMode = "all" | "near-hidden" | "none";

type FloorPlanView3DProps = {
  document: FloorPlanDocument;
  wallVisibilityMode: WallVisibilityMode;
};

export function FloorPlanView3D({ document, wallVisibilityMode }: FloorPlanView3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Czytany z pętli animacji przez ref, żeby zmiana trybu nie przebudowywała sceny WebGL.
  const wallVisibilityModeRef = useRef(wallVisibilityMode);
  wallVisibilityModeRef.current = wallVisibilityMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = getFloorPlanBoundingBox(document);
    const { scene, camera, renderer, controls, disposables, nearCameraWalls } =
      createFloorPlanScene(container, box, document);
    container.appendChild(renderer.domElement);

    let frameId = 0;
    const animate = () => {
      controls.update();
      switch (wallVisibilityModeRef.current) {
        case "all":
          for (const wall of nearCameraWalls) wall.mesh.visible = true;
          break;
        case "near-hidden":
          updateNearCameraWallVisibility(camera, nearCameraWalls);
          break;
        case "none":
          for (const wall of nearCameraWalls) wall.mesh.visible = false;
          break;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => resizeFloorPlanScene(container, camera, renderer);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      for (const disposable of disposables) disposable.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [document]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Rzut poziomu, widok 3D"
      className="w-full flex-1"
    />
  );
}
