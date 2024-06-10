import type { Beatmap } from "@server/beatmap";
import type { DifficultyInfo, Song } from "@server/song";
import { beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { ref } from "vue";
import { getBeatmapRows } from "./utils";
import { audioElement } from "@/stores/song";

export const playing = ref(false);

// TODO: 自动播放功能
export async function playBeatmap(canvas: HTMLCanvasElement, song: Song, difficultyInfo: DifficultyInfo) {
  const { beatmap } = difficultyInfo;

  const sourceData = canvas.toDataURL("image/jpg");
  const sourceImage = new Image();
  sourceImage.src = sourceData;

  sourceImage.onload = async () => {
    playing.value = true;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const beatmapRows = getBeatmapRows(beatmap);

    nextFrame(() => {
      if (audioElement.paused) {
        playing.value = false;
        return false;
      }
      if (!playing.value) return false;
      if (audioElement.currentTime + song.offset <= 0) return true;

      const { currentX, row } = getCurrentPos(beatmap, beatmapRows, song.bpm, audioElement.currentTime + song.offset);

      context.drawImage(sourceImage, 0, 0);
      new DrawStrokeAction({
        color: "red",
        lineWidth: 2,
        x1: currentX,
        y1: marginY + row * (rowSpace + rowHeight) - 15,
        x2: currentX,
        y2: marginY + row * (rowSpace + rowHeight) + 45,
      }).draw(context);

      return true;
    });
  };
}

function nextFrame(callback: () => boolean) {
  requestAnimationFrame(() => {
    if (callback()) nextFrame(callback);
  });
}

function getCurrentPos(beatmap: Beatmap, beatmapRows: number[], songBpm: number, time: number): { currentX: number; row: number } {
  let currentX = marginX;

  let totalBeatCount = 0;

  let row = 0;
  let rowBeatCount = 0;

  // beat per second，每秒经过的节拍
  let bps = songBpm / 60;

  // 与4/4拍相对的速度，例如4/16拍则为4倍速
  let speed = 1;

  while (time > 0) {
    const change = beatmap.changes[totalBeatCount];
    if (change?.bpm) bps = change.bpm / 60;
    if (change?.measure) speed = change.measure[1] / 4;

    const beatTime = 1 / bps / speed;
    if (time > beatTime) {
      time -= beatTime;
      rowBeatCount += 1;
      if (rowBeatCount >= beatmapRows[row]) {
        rowBeatCount = 0;
        row += 1;
      }
    } else {
      rowBeatCount += bps * time * speed;
      currentX = marginX + rowBeatCount * beatWidth;
      break;
    }
  }

  return { currentX, row };
}
