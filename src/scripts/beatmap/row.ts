import { partBgColor, rowHeight, rowSpace, marginY } from "@/scripts/beatmap/const";

/**
 * 绘制行
 * @param context
 * @param row
 * @param canvasWidth
 */
export function drawRow(context: CanvasRenderingContext2D, row: number, canvasWidth: number) {
  context.save();
  // 黑色边
  context.fillStyle = "black";
  context.fillRect(0, marginY + row * (rowHeight + rowSpace) - 2, canvasWidth, rowHeight + 4);

  // 灰色底
  context.fillStyle = partBgColor;
  context.fillRect(0, marginY + row * (rowHeight + rowSpace), canvasWidth, rowHeight);

  // 白色内边
  context.fillStyle = "white";
  context.fillRect(0, marginY + row * (rowHeight + rowSpace), canvasWidth, 4);
  context.fillRect(0, marginY + row * (rowHeight + rowSpace) + rowHeight - 4, canvasWidth, 4);
  context.restore();
}