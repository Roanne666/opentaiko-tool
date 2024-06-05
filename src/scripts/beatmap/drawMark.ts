import { markFont, partRowSpace, partSize, startPos, type Vector2 } from "./const";

export function drawMark(
  context: CanvasRenderingContext2D,
  gridInfo: Vector2,
  options?: {
    bpm?: number;
    scroll?: number;
  }
) {
  const beginPos: Vector2 = {
    x: startPos.x + partSize.x * gridInfo.x,
    y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y - 15,
  };

  let interval = 20;
  if (gridInfo.y * 4 + gridInfo.x + 1 >= 10) interval = 25;
  if (gridInfo.y * 4 + gridInfo.x + 1 >= 100) interval = 30;

  let drawBpm = false;

  context.save();
  context.font = markFont;
  context.fillStyle = "black";

  // bpm标注
  if (options?.bpm) {
    drawBpm = true;
    context.fillText(`bpm${options.bpm}`, beginPos.x + interval, beginPos.y + 10);
  }

  // scroll标注
  if (options?.scroll) {
    const beginX = drawBpm ? beginPos.x + 55 + interval : beginPos.x + interval;
    context.fillText(`scroll ${options.scroll}`, beginX, beginPos.y + 10);
  }

  context.restore();
}
