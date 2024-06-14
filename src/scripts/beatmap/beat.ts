import { marginX, beatWidth, marginY, rowHeight, rowSpace, gogotimeBgColor, drakLineColor, lightLineColor } from "./const";
import { DrawRectAction, DrawStrokeAction, type DrawAction } from "./drawAction";
import type { Change } from "./types";

export type BeatPos = "start" | "middle" | "end";

export function getBeatActions(row: number, rowBeatCount: number, beatPos: BeatPos, change: Change) {
  const beginX = marginX + rowBeatCount * beatWidth;
  const beginY = marginY + (rowHeight + rowSpace) * row - 15;
  const endX = marginX + rowBeatCount * beatWidth;
  const endY = marginY + (rowHeight + rowSpace) * row + rowHeight;

  const actions: DrawAction[] = [];

  // gogotime背景色
  if (change.gogotime) {
    // 当前行第一拍时补齐左侧，最后一拍时补齐右侧
    if (rowBeatCount === 0) {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX - marginX, y: beginY - 2, width: beatWidth + marginX, height: 15 });
      actions.push(gogoTimeAction);
    } else if (rowBeatCount === 15) {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX, y: beginY - 2, width: beatWidth + marginX, height: 15 });
      actions.push(gogoTimeAction);
    } else {
      const gogoTimeAction = new DrawRectAction({ color: gogotimeBgColor, x: beginX, y: beginY - 2, width: beatWidth, height: 15 });
      actions.push(gogoTimeAction);
    }
  }

  // 拍子中间线
  const beatSubLine = new DrawStrokeAction({
    lineWidth: 2,
    color: drakLineColor,
    x1: beginX + beatWidth / 2,
    y1: beginY + 20,
    x2: endX + beatWidth / 2,
    y2: endY - 5,
  });

  // 拍子结束线
  const beatEndLineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: lightLineColor,
    x1: beginX + beatWidth,
    y1: beginY + 20,
    x2: endX + beatWidth,
    y2: endY - 5,
  });

  // 节拍竖线，如果是小节起始拍，则画小节起始线，最后一拍时画小节结束线
  if (beatPos === "start") {
    // 小节起始线
    const barStartLineAction = new DrawStrokeAction({
      lineWidth: 2,
      color: "white",
      x1: beginX,
      y1: beginY,
      x2: endX,
      y2: endY,
    });
    actions.push(barStartLineAction);
    actions.push(beatSubLine);
    actions.push(beatEndLineAction);
  } else if (beatPos === "middle") {
    actions.push(beatSubLine);
    actions.push(beatEndLineAction);
  } else {
    actions.push(beatSubLine);

    // 小节结束线
    const barEndLineAction = new DrawStrokeAction({
      lineWidth: 2,
      color: "white",
      x1: beginX + beatWidth,
      y1: beginY,
      x2: endX + beatWidth,
      y2: endY,
    });
    actions.push(barEndLineAction);
  }

  return actions;
}
