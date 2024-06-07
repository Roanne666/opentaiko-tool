import type { BeatmapBar } from "@server/beatmap";
import { beatPerRow } from "@/scripts/beatmap/const";

export async function wait(time: number) {
  await new Promise((resolve) => setTimeout(() => resolve(true), time));
}

export function getBeatmapRows(beatmap: BeatmapBar[]) {
  let currentBeatCount = 0;
  let currentColumn = -1;
  let currentRow = -1;

  let lastMeasure: [number, number] = [4, 4];

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  for (let i = 0; i < beatmap.length; i++) {
    const bar = beatmap[i];
    const { measure, notes } = bar;
    const barPerRow = Math.floor(beatPerRow / measure[0]);

    // 不是第一小节且节拍变化时，长条时优先不换行
    const measureChange = lastMeasure[0] !== measure[0];
    const beatOverflow = currentBeatCount + measure[0] > 16;
    if (currentColumn >= 0 && measureChange && (currentLong === "" || beatOverflow)) {
      currentColumn = -1;
      currentBeatCount = 0;
    }

    lastMeasure = measure;

    currentColumn += 1;

    // 超过一行小节数时换行
    if (currentColumn % barPerRow === 0) {
      currentColumn = 0;
      currentRow += 1;
      currentBeatCount = 0;
    }

    currentBeatCount += measure[0];

    // 绘制音符
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];

      if (note === 5) {
        currentLong = "small";
      } else if (note === 6) {
        currentLong = "big";
      } else if (note === 7) {
        currentLong = "balloon";
      } else if (note === 8) {
        currentLong = "";
      }
    }
  }

  return currentRow + 1;
}
