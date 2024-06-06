import type { BeatmapPart } from "@server/beatmap";
import { beatPerRow, type Vector2 } from "./const";

export function stroke(
  context: CanvasRenderingContext2D,
  startPos: Vector2,
  endPos: Vector2,
  color: string,
  lineWidth: number
) {
  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(startPos.x, startPos.y);
  context.lineTo(endPos.x, endPos.y);
  context.closePath();
  context.stroke();
  context.restore();
}

export function getBeatmapRows(beatmap: BeatmapPart[]) {
  let partPerRow = 0;
  let col = 0;
  let row = 0;

  for (const beatmapPart of beatmap) {
    if (partPerRow === 0) {
      partPerRow = Math.floor(beatPerRow / beatmapPart.measure[0]);
    } else if (partPerRow !== Math.floor(beatPerRow / beatmapPart.measure[0])) {
      partPerRow = Math.floor(beatPerRow / beatmapPart.measure[0]);
      row += 1;
    }

    for (const part of beatmapPart.notesArray) {
      col += 1;
      if (col % partPerRow === 0) {
        row += 1;
        col = 0;
      }
    }
  }
  return row;
}
