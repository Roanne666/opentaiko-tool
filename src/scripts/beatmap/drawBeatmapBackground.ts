import type { Song, DifficlutyType } from "@server/song";
import { beatmapBackgroundColor, songNameFont, difficultyFont, levelFont } from "./const";

export function drawBeatmapBackground(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const difficultyNames = {
    easy: "梅",
    normal: "竹",
    hard: "松",
    oni: "鬼",
    extreme: "里",
  };

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.save();

  // 图片底色
  context.fillStyle = beatmapBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 歌名
  context.fillStyle = "black";
  context.font = songNameFont;
  context.fillText(song.name, 10, 30);

  // 难度
  context.font = difficultyFont;
  context.fillText(difficultyNames[difficulty], 10, 55);

  // 星级
  context.font = levelFont;
  let levelText = "";
  const d = song.difficulties.find((d) => d.name === difficulty);
  if (d) {
    for (let i = 0; i < 10; i++) {
      levelText += i < d.level ? "★" : "☆";
    }
  }

  context.fillText(levelText, 35, 57);

  context.restore();
}
