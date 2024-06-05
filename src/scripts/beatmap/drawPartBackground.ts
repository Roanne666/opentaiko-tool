import { partBackgroundColor } from "./const";

export function drawPartBackground(
  context: CanvasRenderingContext2D,
  startY: number,
  row: number,
  partHeight: number,
  canvasWidth: number,
  space: number
) {
  context.save();
  // 黑色边
  context.fillStyle = "black";
  context.fillRect(0, startY + row * (partHeight + space) - 2, canvasWidth, partHeight + 4);

  // 灰色底
  context.fillStyle = partBackgroundColor;
  context.fillRect(0, startY + row * (partHeight + space), canvasWidth, partHeight);

  // 白色内边
  context.fillStyle = "white";
  context.fillRect(0, startY + row * (partHeight + space), canvasWidth, 4);
  context.fillRect(0, startY + row * (partHeight + space) + partHeight - 4, canvasWidth, 4);
  context.restore();
}
