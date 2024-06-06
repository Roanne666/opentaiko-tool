import { type Vector2, smallNoteSize, BigNoteSize, noteBorder } from "./const";
import { DrawNoteAction } from "./drawSystem/drawAction";

export function drawNote(
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

  return new DrawNoteAction({
    noteColor,
    radius: size,
    x: position.x,
    y: position.y,
    angles,
  });
}
