import { markFont, rowSpace, rowHeight, beatWidth, marginX, marginY } from "@/scripts/beatmap/const";
import { DrawTextAction } from "@/scripts/beatmap/drawAction";
import type { Change } from "./types";

/**
 * 绘制bpm，scroll等相关标记
 * @param context
 * @param gridInfo
 * @param options
 */
export function getMarkActions(bar: number, barBeatCount: number, row: number, rowBeatCount: number, change?: Change) {
  const actions: DrawTextAction[] = [];

  if (barBeatCount === 0) {
    const action = new DrawTextAction({
      font: markFont,
      color: "black",
      text: `${bar}`,
      x: marginX + rowBeatCount * beatWidth + 5,
      y: marginY + (rowHeight + rowSpace) * row - 5,
    });
    actions.push(action);
  }

  // 和小节数字标记的间隔
  let margin = 20;
  if (bar >= 10) margin = 25;
  if (bar >= 100) margin = 30;

  const firstX = marginX + rowBeatCount * beatWidth + margin;
  const firstY = marginY + (rowHeight + rowSpace) * row - 5;

  let drawBpm = false;
  let bpmIsFloat = false;

  // bpm标注
  if (change?.bpm) {
    drawBpm = true;
    bpmIsFloat = Math.floor(change.bpm) < change.bpm;
    const action = new DrawTextAction({
      font: markFont,
      color: "black",
      text: `bpm${bpmIsFloat ? change.bpm.toFixed(2) : change.bpm}`,
      x: firstX,
      y: firstY,
    });
    actions.push(action);
  }

  const secondX = marginX + rowBeatCount * beatWidth + margin + (bpmIsFloat ? 65 : 55);
  const secondY = marginY + (rowHeight + rowSpace) * row - 5;

  // scroll标注
  if (change?.hs) {
    const isFloat = Math.floor(change.hs) < change.hs;
    actions.push(
      new DrawTextAction({
        font: markFont,
        color: "black",
        text: `hs ${isFloat ? change.hs.toFixed(2) : change.hs}`,
        x: drawBpm ? secondX : firstX,
        y: drawBpm ? secondY : firstY,
      })
    );
  }

  return actions;
}
