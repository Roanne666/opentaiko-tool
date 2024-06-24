import { NOTE_BORDER } from "@/scripts/beatmap/const";
import { DrawRectAction, type DrawAction } from "@/scripts/utils/drawAction";
import { getNoteAction } from "@/scripts/beatmap/draw/note";

/**
 * 绘制长条（黄条，气球）
 * @param context
 * @param pos
 * @param longType 长条类型
 * @param drawType 绘制类型，start为左半圆，middle为矩形，end为右半圆
 * @param interval 间隔，用于补全长条
 * @param radiusType 半径类型，区分大小音符
 * @param balloonNum 气球数
 */
export function getLongActions(options: {
  x: number;
  y: number;
  interval: number;
  color: string;
  radius: number;
  drawType: "start" | "middle" | "end";
}) {
  const { x, y, interval, color, drawType, radius } = options;

  const actions: DrawAction[] = [];

  if (drawType === "start") {
    const noteAction = getNoteAction(x, y, color, radius, "left");
    actions.push(noteAction);
    const fillActions = getFillActions(x, y, color, interval, radius);
    actions.push(...fillActions);
  } else if (drawType === "middle") {
    const fillActions = getFillActions(x, y, color, interval, radius);
    actions.push(...fillActions);
  } else {
    const noteAction = getNoteAction(x, y, color, radius, "right");
    actions.push(noteAction);
  }

  actions.push(new DrawRectAction({ color, x: x - 1, y: y - radius * 0.7, width: 1, height: radius * 2 * 0.7 }));

  return actions;
}

// 把长条的中间间隔填满
function getFillActions(x: number, y: number, color: string, interval: number, radius: number) {
  // 上下黑边
  const blackBorderAction = new DrawRectAction({
    color: NOTE_BORDER,
    x: x,
    y: y - radius,
    width: interval,
    height: radius * 2,
  });

  // 上下白边
  const whiteBorderAction = new DrawRectAction({
    color: "white",
    x: x,
    y: y - radius * 0.9,
    width: interval,
    height: radius * 2 * 0.9,
  });

  // 音符颜色
  const noteColorAction = new DrawRectAction({
    color,
    x: x,
    y: y - radius * 0.7,
    width: interval,
    height: radius * 2 * 0.7,
  });

  return [blackBorderAction, whiteBorderAction, noteColorAction];
}
