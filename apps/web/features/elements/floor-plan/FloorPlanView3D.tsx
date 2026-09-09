"use client";

import { useEffect, useRef } from "react";

import { getFloorPlanBoundingBox } from "./geometry";
import { createFloorPlanScene, resizeFloorPlanScene } from "./three/scene";
import type { FloorPlanTestData } from "./types";

type FloorPlanView3DProps = {
  data: FloorPlanTestData;
};

export function FloorPlanView3D({ data }: FloorPlanView3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = getFloorPlanBoundingBox(data);
    const { scene, camera, renderer, controls, disposables } = createFloorPlanScene(
      container,
      box,
      data,
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
  }, [data]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Rzut mieszkania, widok 3D"
      className="w-full flex-1"
    />
  );
}
