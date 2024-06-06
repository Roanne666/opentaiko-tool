import type { BeatmapPart } from "@server/beatmap";
import type { Song } from "@server/song";
import { beatWidth, startPos, type Vector2 } from "./const";

// TODO: 自动播放功能
export async function drawPlay(context: CanvasRenderingContext2D, song: Song, beatmap: BeatmapPart[]) {
  await new Promise((resolve) => setTimeout(() => resolve(true), song.offset * 1000));

  let currentPos: Vector2 = { x: startPos.x, y: startPos.y };
  let currentPartCount = 0;

  requestAnimationFrame((time: number) => {
    context.save();
    context.lineWidth = 2;
    context.strokeStyle = "red";
    context.beginPath();

    context.moveTo(currentPos.x, currentPos.y);
    context.lineTo(currentPos.x, currentPos.y + beatWidth);

    context.closePath();
    context.stroke();
    context.restore();
  });
}
