import type { BeatmapPart } from "@server/beatmap";
import { beatPerRow } from "@/scripts/beatmap/const";

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
