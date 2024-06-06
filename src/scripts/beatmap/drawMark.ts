import { markFont, rowSpace, rowHeight, startPos, type Vector2 } from "./const";
import { DrawTextAction } from "./drawSystem/drawAction";

/**
 * 绘制bpm，scroll等相关标记
 * @param context
 * @param gridInfo
 * @param options
 */
export function getMarkActions(
  barWidth: number,
  gridInfo: Vector2,
  options?: {
    bpm?: number;
    scroll?: number;
  }
) {
  const actions: DrawTextAction[] = [];

  // 和小节数字标记的间隔
  let margin = 20;
  if (gridInfo.y * 4 + gridInfo.x + 1 >= 10) margin = 25;
  if (gridInfo.y * 4 + gridInfo.x + 1 >= 100) margin = 30;

  const firstPos: Vector2 = {
    x: startPos.x + barWidth * gridInfo.x + margin,
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y - 5,
  };

  const secondPos: Vector2 = {
    x: startPos.x + barWidth * gridInfo.x + margin + 55,
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y - 5,
  };

  let drawBpm = false;

  // bpm标注
  if (options?.bpm) {
    drawBpm = true;
    actions.push(
      new DrawTextAction({
        font: markFont,
        fillStyle: "black",
        text: `bpm${options.bpm}`,
        x: firstPos.x,
        y: firstPos.y,
      })
    );
  }

  // scroll标注
  if (options?.scroll) {
    const pos = drawBpm ? secondPos : firstPos;
    actions.push(
      new DrawTextAction({
        font: markFont,
        fillStyle: "black",
        text: `scroll ${options.scroll}`,
        x: pos.x,
        y: pos.y,
      })
    );
  }

  return actions;
}
