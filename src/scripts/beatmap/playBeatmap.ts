import type { DifficultyInfo } from "@server/song";
import { beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { ref } from "vue";
import { getBeatmapRows } from "./utils";

export const playing = ref(false);

// TODO: 自动播放功能
export async function playBeatmap(canvas: HTMLCanvasElement, difficultyInfo: DifficultyInfo) {
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

    let barIndex = 0;
    // beat per second，每秒经过的节拍
    let bps = beatmap[0].bpm / 60;

    // 与4/4拍相对的速度，例如4/16拍则为4倍速
    let speed = beatmap[0].measure[1] / 4;

    // 上一个时间（用于计算动画）
    let lastTime = 0;

    // 小节数据
    let barPassDistance = 0;

    // 行数据
    let rowPassDistance = 0;

    nextFrame((time: number) => {
      if (!playing.value) return false;

      if (lastTime === 0) {
        lastTime = time;
        return true;
      }

      // 如果当前节拍数大于当前行的节拍数，则换行
      if (rowPassDistance >= beatmapRows[row] * beatWidth) {
        row += 1;
        rowPassDistance -= beatmapRows[row] * beatWidth;
        currentX = marginX + rowPassDistance;
      }

      // 经过的节拍数超过当前小节节拍数时，进入下一小节
      if (barPassDistance >= beatmap[barIndex].measure[0] * beatWidth) {
        // 小节可能会因为bpm过快而直接跳过，所以不能直接重置为0
        barPassDistance -= beatmap[barIndex].measure[0] * beatWidth;

        barIndex += 1;
        if (barIndex >= beatmap.length) return false;
        const { bpm, measure } = beatmap[barIndex];
        bps = bpm / 60;
        speed = measure[1] / 4;
      }

      const interval = (time - lastTime) / 1000;
      lastTime = time;

      const distance = bps * interval * beatWidth * speed;
      barPassDistance += distance;
      rowPassDistance += distance;
      currentX += distance;

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
