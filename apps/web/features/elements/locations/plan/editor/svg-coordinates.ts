import type { Point } from "@repo/contracts/floor-plan";

import { snapPointToGrid } from "../geometry/edit-geometry";

export function toSvgPoint(svg: SVGSVGElement, event: { clientX: number; clientY: number }): Point {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { xMm: 0, yMm: 0 };
  const transformed = point.matrixTransform(ctm.inverse());
  return snapPointToGrid({ xMm: Math.round(transformed.x), yMm: Math.round(transformed.y) });
}
