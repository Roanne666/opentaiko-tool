import { type Vector2, smallNoteSize, BigNoteSize, noteBorder } from "./const";

export function drawNote(
  context: CanvasRenderingContext2D,
  position: Vector2,
  noteColor: string,
  sizeType: "small" | "big",
  drawType: "left" | "right" | "full"
) {
  const size = sizeType === "small" ? smallNoteSize : BigNoteSize;
  const angles: [number, number] = [0, 2 * Math.PI];
  if (drawType === "left") {
    angles[0] = Math.PI / 2;
    angles[1] = -Math.PI / 2;
  } else if (drawType === "right") {
    angles[0] = -Math.PI / 2;
    angles[1] = Math.PI / 2;
  }

  // 最外层黑边
  context.save();
  context.beginPath();

  context.fillStyle = noteBorder;
  context.arc(position.x, position.y, size + 2.5, ...angles);
  context.fill();

  context.closePath();
  context.restore();

  // 白边
  context.save();
  context.beginPath();

  context.fillStyle = "white";
  context.arc(position.x, position.y, size + 1.5, ...angles);
  context.stroke();
  context.fill();

  context.closePath();
  context.restore();

  // 音符
  context.save();
  context.beginPath();

  context.fillStyle = noteColor;
  context.arc(position.x, position.y, sizeType === "small" ? size : size - 0.5, ...angles);
  context.fill();

  context.closePath();
  context.restore();
}
