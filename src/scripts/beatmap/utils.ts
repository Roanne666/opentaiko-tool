import type { Vector2 } from "./const";

export function stroke(
  context: CanvasRenderingContext2D,
  startPos: Vector2,
  endPos: Vector2,
  color: string,
  lineWidth: number
) {
  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(startPos.x, startPos.y);
  context.lineTo(endPos.x, endPos.y);
  context.closePath();
  context.stroke();
  context.restore();
}
