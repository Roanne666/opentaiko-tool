import type { DifficultyInfo } from "@server/song";
import { beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { ref } from "vue";
import { getBeatmapRows } from "./utils";
import type { Measure } from "@server/beatmap";

export const playing = ref(false);

// TODO: 自动播放功能
export async function playBeatmap(canvas: HTMLCanvasElement, songBpm: number, difficultyInfo: DifficultyInfo) {
  const { beatmap } = difficultyInfo;

  const sourceData = canvas.toDataURL("image/jpg");
  const sourceImage = new Image();
  sourceImage.src = sourceData;

  sourceImage.onload = async () => {
    playing.value = true;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const beatmapRows = getBeatmapRows(beatmap);

    let currentX = marginX;
    let row = 0;

    let totalBeatCount = 0;

    // beat per second，每秒经过的节拍
    let bps = songBpm / 60;

    // 与4/4拍相对的速度，例如4/16拍则为4倍速
    let speed = 1;

    // 上一个时间（用于计算动画）
    let lastTime = 0;

    // 节拍距离
    let beatPassDistance = 0;

    // 行距离
    let rowPassDistance = 0;

    nextFrame((time: number) => {
      if (!playing.value) return false;

      if (lastTime === 0) {
        lastTime = time;
        return true;
      }

      const change = beatmap.changes[totalBeatCount];
      if (change?.bpm) bps = change.bpm / 60;
      if (change?.measure) speed = change.measure[1] / 4;

      const interval = (time - lastTime) / 1000;
      lastTime = time;

      const distance = bps * interval * beatWidth * speed;
      beatPassDistance += distance;
      rowPassDistance += distance;
      currentX += distance;

      // 当前行经过的距离大于当前行的总节拍宽度，则换行
      if (rowPassDistance >= beatmapRows[row] * beatWidth) {
        rowPassDistance -= beatmapRows[row] * beatWidth;
        currentX = marginX + rowPassDistance;
        row += 1;
      }

      // 当前经过的距离超过当前节拍距离时，进入下一节拍
      if (beatPassDistance >= beatWidth) {
        // 小节可能会因为bpm过快而直接跳过，所以不能直接重置为0
        beatPassDistance -= beatWidth;
        totalBeatCount += 1;
        if (totalBeatCount >= beatmap.beats.length) return false;
      }

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

function nextFrame(callback: (time: number) => boolean) {
  requestAnimationFrame((time: number) => {
    if (callback(time)) nextFrame(callback);
  });
}
