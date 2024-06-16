import { PART_BG_COLOR, ROW_HEIGHT, ROW_SPACE, MARGIN_Y } from "@/scripts/beatmap/const";

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
  context.fillRect(0, MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE) - 2, canvasWidth, ROW_HEIGHT + 4);

  // 灰色底
  context.fillStyle = PART_BG_COLOR;
  context.fillRect(0, MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE), canvasWidth, ROW_HEIGHT);

  // 白色内边
  context.fillStyle = "white";
  context.fillRect(0, MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE), canvasWidth, 4);
  context.fillRect(0, MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT - 4, canvasWidth, 4);
  context.restore();
}
