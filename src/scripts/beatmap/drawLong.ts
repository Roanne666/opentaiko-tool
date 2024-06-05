import {
  BigNoteSize,
  balloonColor,
  markFont,
  noteBorder,
  partSize,
  smallNoteSize,
  yellowColor,
  type Vector2,
} from "./const";
import { drawNote } from "./drawNote";
import { stroke } from "./utils";

export function drawLong(
  context: CanvasRenderingContext2D,
  position: Vector2,
  type: "balloon" | "yellow",
  drawType: "start" | "middle" | "end",
  interval: number,
  radiusType: "small" | "big",
  balloonNum?: number
) {
  const size = radiusType === "small" ? smallNoteSize : BigNoteSize;
  const noteColor = type === "balloon" ? balloonColor : yellowColor;

  if (drawType === "start") {
    drawNote(context, position, noteColor, radiusType, "left");
    fillIntreval(context, position, noteColor, interval, size);
  } else if (drawType === "middle") {
    fillIntreval(context, position, noteColor, interval, size);
  } else {
    drawNote(context, position, noteColor, radiusType, "right");
  }

  if (type === "balloon" && balloonNum) {
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
  context.fillRect(position.x, position.y - radius, interval, radius * 2);

  context.lineWidth = 1;

  // 最外层黑边
  stroke(
    context,
    { x: position.x, y: position.y - radius - 2 },
    { x: position.x + interval, y: position.y - radius - 2 },
    noteBorder,
    1
  );
  stroke(
    context,
    { x: position.x, y: position.y + radius + 2 },
    { x: position.x + interval, y: position.y + radius + 2 },
    noteBorder,
    1
  );

  // 白边
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
