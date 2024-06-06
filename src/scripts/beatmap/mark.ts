import { markFont, rowSpace, rowHeight, beatWidth, marginX, marginY } from "@/scripts/beatmap/const";
import { DrawTextAction } from "@/scripts/beatmap/drawAction";

/**
 * 绘制bpm，scroll等相关标记
 * @param context
 * @param gridInfo
 * @param options
 */
export function getMarkActions(
  beatCount: number,
  row: number,
  column: number,
  options?: {
    bpm?: number;
    scroll?: number;
  }
) {
  const actions: DrawTextAction[] = [];

  // 和小节数字标记的间隔
  let margin = 20;
  if (row * 4 + column + 1 >= 10) margin = 25;
  if (row * 4 + column + 1 >= 100) margin = 30;

  const firstX = marginX + beatCount * beatWidth + margin;
  const firstY = marginY + (rowHeight + rowSpace) * row - 5;

  let drawBpm = false;
  let bpmIsFloat = false;

  // bpm标注
  if (options?.bpm) {
    drawBpm = true;
    bpmIsFloat = Math.floor(options.bpm) < options.bpm;
    const action = new DrawTextAction({
      font: markFont,
      color: "black",
      text: `bpm${bpmIsFloat ? options.bpm.toFixed(2) : options.bpm}`,
      x: firstX,
      y: firstY,
    });
    actions.push(action);
  }

  const secondX = marginX + beatCount * beatWidth + margin + (bpmIsFloat ? 65 : 55);
  const secondY = marginY + (rowHeight + rowSpace) * row - 5;

  // scroll标注
  if (options?.scroll) {
    const isFloat = Math.floor(options.scroll) < options.scroll;
    actions.push(
      new DrawTextAction({
        font: markFont,
        color: "black",
        text: `scroll ${isFloat ? options.scroll.toFixed(2) : options.scroll}`,
        x: drawBpm ? secondX : firstX,
        y: drawBpm ? secondY : firstY,
      })
    );
  }

  return actions;
}
