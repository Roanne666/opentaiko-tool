import type { BeatmapBar } from "@server/beatmap";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/song";
import { beatPerRow, beatWidth, marginX, marginY, rowHeight, rowSpace } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { currentSong } from "@/stores/song";

// TODO: 自动播放功能
export async function playBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  currentSong.value = song;

  const { beatmap } = song.difficulties.find((d) => d.name === difficulty) as DifficultyInfo;

  const sourceData = canvas.toDataURL("image/jpg");
  const sourceImage = new Image();
  sourceImage.src = sourceData;

  sourceImage.onload = async () => {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    await new Promise((resolve) => setTimeout(() => resolve(true), song.offset * 1000));

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
      if (currentSong.value?.name !== song.name) return false;

      if (lastTime === 0) {
        lastTime = time;
        return true;
      }

      if (currentX >= marginX + beatPerRow * beatWidth) {
        row += 1;
        currentX = marginX;
      }

      let bar = beatmap[barIndex];

      const interval = (time - lastTime) / 1000;
      lastTime = time;
      throughSeconds += interval;

      currentX += bps * beatWidth * speed * interval;

      context.drawImage(sourceImage, 0, 0);
      new DrawStrokeAction({
        color: "red",
        lineWidth: 2,
        x1: currentX,
        y1: marginY + row * (rowSpace + rowHeight) - 15,
        x2: currentX,
        y2: marginY + row * (rowSpace + rowHeight) + 45,
      }).draw(context);

      if (throughSeconds * bps * speed >= bar.measure[0]) {
        barIndex += 1;
        if (barIndex >= beatmap.length) return false;
        bar = beatmap[barIndex];
        bps = bar.bpm / 60;
        speed = bar.measure[1] / 4;
        throughSeconds -= bar.measure[0] / bps / speed;
      }

      return true;
    });
  };
}

function nextFrame(callback: (time: number) => boolean) {
  requestAnimationFrame((time: number) => {
    if (callback(time)) nextFrame(callback);
  });
}
