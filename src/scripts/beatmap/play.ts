import type { BeatmapPart } from "@server/beatmap";
import type { Song } from "@server/song";
import { marginX, marginY, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";

// TODO: 自动播放功能
export async function drawPlay(context: CanvasRenderingContext2D, song: Song, beatmap: BeatmapPart[]) {
  await new Promise((resolve) => setTimeout(() => resolve(true), song.offset * 1000));

  let currentX = marginX;
  let currentY = marginY;

  requestAnimationFrame((time: number) => {
    new DrawStrokeAction({
      color: "red",
      lineWidth: 2,
      x1: currentX,
      y1: currentY - 15,
      x2: currentX,
      y2: currentY + rowSpace + 15,
    }).draw(context);
  });
}
