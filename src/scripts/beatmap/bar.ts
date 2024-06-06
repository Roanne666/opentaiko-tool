import { markFont, lightLineColor, drakLineColor, beatWidth, rowSpace, gogotimeBgColor, rowHeight, beatPerRow, marginX, marginY } from "@/scripts/beatmap/const";
import { DrawRectAction, DrawStrokeAction, DrawTextAction, type DrawAction } from "./drawAction";

/**
 * 绘制小节相关内容
 * @param barCount
 * @param measure
 * @param beatCount
 * @param gridInfo
 * @param gogotime
 * @returns
 */
export function getBarActions(barCount: number, measure: [number, number], beatCount: number, row: number, gogotime = false) {
  const subParts = measure[0] * 2;
  const partWidth = beatWidth * measure[0];

  const beginX = marginX + beatCount * beatWidth;
  const beginY = marginY + (rowHeight + rowSpace) * row - 15;
  const endX = marginX + beatCount * beatWidth;
  const endY = marginY + (rowHeight + rowSpace) * row + rowHeight;

  const actions: DrawAction[] = [];

  // gogotime背景色
  if (gogotime) {
    // 第一小节时补齐左侧，最后小节时补齐右侧
    if (beatCount === 0) {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX - marginX, y: beginY - 2, width: partWidth + marginX, height: 15 });
      actions.push(gogoTimeAction);
    } else if (beatCount + measure[0] === 16) {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX, y: beginY - 2, width: partWidth + marginX, height: 15 });
      actions.push(gogoTimeAction);
    } else {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX, y: beginY - 2, width: partWidth, height: 15 });
      actions.push(gogoTimeAction);
    }
  }

  // 小节数字标注
  const numberMarkAction = new DrawTextAction({ font: markFont, color: "black", text: `${barCount + 1}`, x: beginX + 5, y: beginY + 10 });
  actions.push(numberMarkAction);

  // 节拍竖线
  const lineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: "white",
    x1: beginX,
    y1: beginY,
    x2: endX,
    y2: endY,
  });
  actions.push(lineAction);

  // 细分竖线
  for (let i = 1; i < subParts; i++) {
    const subLineColor = i % 2 === 0 ? lightLineColor : drakLineColor;
    const subBeginX = marginX + beatCount * beatWidth + (partWidth / subParts) * i;
    const subBeginY = marginY + (rowHeight + rowSpace) * row + 4;
    const subEndX = marginX + beatCount * beatWidth + (partWidth / subParts) * i;
    const subEndY = marginY + rowHeight + (rowHeight + rowSpace) * row - 4;

    const subLineAction = new DrawStrokeAction({ lineWidth: 2, color: subLineColor, x1: subBeginX, y1: subBeginY, x2: subEndX, y2: subEndY });
    actions.push(subLineAction);
  }

  // 结束线
  const finalBeginX = marginX + beatCount * beatWidth + partWidth;
  const finalBeginY = marginY + (rowHeight + rowSpace) * row - 15;
  const finalEndX = marginX + beatCount * beatWidth + partWidth;
  const finalEndY = marginY + (rowHeight + rowSpace) * row + rowHeight;

  const endLineAction = new DrawStrokeAction({ lineWidth: 2, color: "white", x1: finalBeginX, y1: finalBeginY, x2: finalEndX, y2: finalEndY });
  actions.push(endLineAction);

  return actions;
}
