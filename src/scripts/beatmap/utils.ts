import type { BeatmapBar } from "@server/beatmap";

export async function wait(time: number) {
  await new Promise((resolve) => setTimeout(() => resolve(true), time));
}

/**
 * 解析获取每一行的节拍数
 * @param beatmap
 * @returns
 */
export function getBeatmapRows(beatmap: BeatmapBar[]) {
  let rows: number[] = [];

  // 当前行的小节数
  let rowBeatCount = 0;

  let lastMeasure: [number, number] = beatmap[0].measure;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  for (let i = 0; i < beatmap.length; i++) {
    const bar = beatmap[i];
    const { measure, notes } = bar;

    rowBeatCount += measure[0];

    const beatOverflow = rowBeatCount > 16;
    const measureChange = lastMeasure[0] !== measure[0];

    // 超过一行小节数时或者节拍变化时换行
    if (beatOverflow) {
      rows.push(rowBeatCount - measure[0]);
      rowBeatCount = measure[0];
    } else if (measureChange) {
      // 没有超过小节数，仅节拍变化时，长条优先不换行
      if (currentLong === "") {
        rows.push(rowBeatCount - measure[0]);
        rowBeatCount = measure[0];
      }
    }

    lastMeasure = measure;

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

  return rows;
}

export function calBarPos() {}
