import type { Beatmap } from "@server/beatmap";
import type { DifficultyInfo, Song } from "@server/song";
import { beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { getBeatmapRows } from "./utils";
import { ref } from "vue";

const lastSong = ref<Song>();

export async function previewBeatmap(canvas: HTMLCanvasElement, audio: HTMLAudioElement, song: Song, difficultyInfo: DifficultyInfo) {
  lastSong.value = song;
  const { beatmap } = difficultyInfo;

  const sourceData = canvas.toDataURL("image/jpg");
  const sourceImage = new Image();
  sourceImage.src = sourceData;

  sourceImage.onload = async () => {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const beatmapRows = getBeatmapRows(beatmap);

    nextFrame(() => {
      if (lastSong.value && lastSong.value.name !== song.name) return false;
      if (audio.paused) return true;
      if (audio.currentTime + song.offset <= 0) return true;

      const { currentX, row } = getCurrentPos(beatmap, beatmapRows, song.bpm, audio.currentTime + song.offset);

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
    const beat = beatmap.beats[totalBeatCount];
    for (let i = 0; i < beat.length; i++) {
      const subCount = i / beat.length;
      const change = beatmap.changes[totalBeatCount + subCount];
      if (change?.bpm) bps = change.bpm / 60;
      if (change?.measure) speed = change.measure[1] / 4;

      const subBeatTime = 1 / beat.length / bps / speed;
      if (time > subBeatTime) {
        time -= subBeatTime;
      } else {
        const restCount = time * bps * speed;
        const finalCount = subCount + restCount;
        currentX = marginX + (rowBeatCount + finalCount) * beatWidth;
        time = 0;
        break;
      }

      if (i === beat.length - 1) {
        rowBeatCount += 1;
        if (rowBeatCount >= beatmapRows[row]) {
          rowBeatCount = 0;
          row += 1;
        }
        totalBeatCount += 1;
      }
    }
  }

  return { currentX, row };
}
