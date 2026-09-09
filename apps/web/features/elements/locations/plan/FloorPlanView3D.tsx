"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";
import { useEffect, useRef } from "react";

import { getFloorPlanBoundingBox } from "./geometry/geometry";
import { createFloorPlanScene, resizeFloorPlanScene } from "./three/scene";

type FloorPlanView3DProps = {
  document: FloorPlanDocument;
};

export function FloorPlanView3D({ document }: FloorPlanView3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = getFloorPlanBoundingBox(document);
    const { scene, camera, renderer, controls, disposables } = createFloorPlanScene(
      container,
      box,
      document,
    );
    container.appendChild(renderer.domElement);

    let frameId = 0;
    const animate = () => {
      controls.update();
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
