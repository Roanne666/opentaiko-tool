import type { DifficlutyType, DifficultyInfo, Song } from "@server/song";
import { beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { ref } from "vue";

export const playing = ref(false);

// TODO: 自动播放功能
export async function playBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const { beatmap } = song.difficulties.find((d) => d.name === difficulty) as DifficultyInfo;

  const sourceData = canvas.toDataURL("image/jpg");
  const sourceImage = new Image();
  sourceImage.src = sourceData;

  sourceImage.onload = async () => {
    playing.value = true;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // 当前行拍子结束点（用于换行）
    let nextBeatCount = beatmap[0].measure[0];

    let currentX = marginX;
    let row = 0;

    let barIndex = 0;
    // beat per second，每秒经过的拍子
    let bps = song.bpm / 60;

    // 与4/4拍相对的速度，例如1/16拍则为4倍速
    let speed = beatmap[0].measure[1] / 4;

    // 毫秒
    let lastTime = 0;

    let throughSeconds = 0;

    nextFrame((time: number) => {
      if (!playing.value) return false;

      if (lastTime === 0) {
        lastTime = time;
        return true;
      }

      if (currentX >= marginX + nextBeatCount * beatWidth) {
        barIndex += 1;
        if (barIndex >= beatmap.length) return false;
        const { bpm, measure } = beatmap[barIndex];
        bps = bpm / 60;
        speed = measure[1] / 4;
        nextBeatCount += measure[0];

        if (nextBeatCount > 16) {
          row += 1;
          currentX = marginX;
          nextBeatCount = measure[0];
        }
      }

      const interval = (time - lastTime) / 1000;
      lastTime = time;
      throughSeconds += interval;

      currentX += bps * interval * beatWidth * speed;

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
