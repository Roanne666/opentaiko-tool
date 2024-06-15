import { MARGIN_X, BEAT_WIDTH, MARGIN_Y, ROW_HEIGHT, ROW_SPACE, GOGOTIME_BG_COLOR, DARK_LINE_COLOR, LIGHT_LINE_COLOR } from "./const";
import { DrawRectAction, DrawStrokeAction, type DrawAction } from "./drawAction";
import type { Change } from "./types";

export type BeatPos = "start" | "middle" | "end";

export function getBeatActions(row: number, rowBeatCount: number, beatPos: BeatPos, change: Change) {
  const beginX = MARGIN_X + rowBeatCount * BEAT_WIDTH;
  const beginY = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row - 15;
  const endX = MARGIN_X + rowBeatCount * BEAT_WIDTH;
  const endY = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row + ROW_HEIGHT;

  const actions: DrawAction[] = [];

  // gogotime背景色
  if (change.gogotime) {
    // 当前行第一拍时补齐左侧，最后一拍时补齐右侧
    if (rowBeatCount === 0) {
      const gogoTimeAction = new DrawRectAction({ color: GOGOTIME_BG_COLOR, x: beginX - MARGIN_X, y: beginY - 2, width: BEAT_WIDTH + MARGIN_X, height: 15 });
      actions.push(gogoTimeAction);
    } else if (rowBeatCount === 15) {
      const gogoTimeAction = new DrawRectAction({ color: GOGOTIME_BG_COLOR, x: beginX, y: beginY - 2, width: BEAT_WIDTH + MARGIN_X, height: 15 });
      actions.push(gogoTimeAction);
    } else {
      const gogoTimeAction = new DrawRectAction({ color: GOGOTIME_BG_COLOR, x: beginX, y: beginY - 2, width: BEAT_WIDTH, height: 15 });
      actions.push(gogoTimeAction);
    }
  }

  // 拍子中间线
  const beatSubLine = new DrawStrokeAction({
    lineWidth: 2,
    color: DARK_LINE_COLOR,
    x1: beginX + BEAT_WIDTH / 2,
    y1: beginY + 20,
    x2: endX + BEAT_WIDTH / 2,
    y2: endY - 5,
  });

  // 拍子结束线
  const beatEndLineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: LIGHT_LINE_COLOR,
    x1: beginX + BEAT_WIDTH,
    y1: beginY + 20,
    x2: endX + BEAT_WIDTH,
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
      x1: beginX + BEAT_WIDTH,
      y1: beginY,
      x2: endX + BEAT_WIDTH,
      y2: endY,
    });
    actions.push(barEndLineAction);
  }

  return actions;
}
