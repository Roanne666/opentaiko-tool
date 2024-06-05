import { BigNoteSize, balloonColor, markFont, noteBorder, smallNoteSize, yellowColor, type Vector2 } from "./const";
import { drawNote } from "./drawNote";
import { stroke } from "./utils";

/**
 * 绘制长条（黄条，气球）
 * @param context
 * @param position
 * @param longType 长条类型
 * @param drawType 绘制类型，start为左半圆，middle为矩形，end为右半圆
 * @param interval 间隔，用于补全长条
 * @param radiusType 半径类型，区分大小音符
 * @param balloonNum 气球数
 */
export function drawLong(
  context: CanvasRenderingContext2D,
  position: Vector2,
  longType: "balloon" | "yellow",
  drawType: "start" | "middle" | "end",
  interval: number,
  radiusType: "small" | "big",
  balloonNum?: number
) {
  const size = radiusType === "small" ? smallNoteSize : BigNoteSize;
  const noteColor = longType === "balloon" ? balloonColor : yellowColor;

  if (drawType === "start") {
    drawNote(context, position, noteColor, radiusType, "left");
    fillIntreval(context, position, noteColor, interval, size);
  } else if (drawType === "middle") {
    fillIntreval(context, position, noteColor, interval, size);
  } else {
    drawNote(context, position, noteColor, radiusType, "right");
  }

  if (longType === "balloon" && balloonNum) {
    context.save();
    context.font = markFont;
    context.fillText(`${balloonNum}`, position.x - 4, position.y + 4);
    context.restore();
  }
}

// 把长条的中间间隔填满
function fillIntreval(
  context: CanvasRenderingContext2D,
  position: Vector2,
  color: string,
  interval: number,
  radius: number
) {
  context.save();

  context.fillStyle = color;
  context.fillRect(position.x - 1, position.y - radius, interval + 2, radius * 2);

  context.lineWidth = 1;

  // 上下黑边
  stroke(
    context,
    { x: position.x - 1, y: position.y - radius - 2 },
    { x: position.x + interval + 2, y: position.y - radius - 2 },
    noteBorder,
    1
  );
  stroke(
    context,
    { x: position.x - 1, y: position.y + radius + 2 },
    { x: position.x + interval + 2, y: position.y + radius + 2 },
    noteBorder,
    1
  );

  // 上下白边
  stroke(
    context,
    { x: position.x, y: position.y - radius - 0.5 },
    { x: position.x + interval, y: position.y - radius - 0.5 },
    "white",
    1
  );
  stroke(
    context,
    { x: position.x, y: position.y + radius + 0.5 },
    { x: position.x + interval, y: position.y + radius + 0.5 },
    "white",
    1
  );

  context.restore();
}
