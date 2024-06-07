import type { DifficultyInfo } from "@server/song";
import { beatmapBgColor, songNameFont, difficultyFont, levelFont } from "@/scripts/beatmap/const";

const difficultyNames = {
  easy: "梅",
  normal: "竹",
  hard: "松",
  oni: "鬼",
  extreme: "里",
};

/**
 * 绘制图片背景
 * @param canvas
 * @param song
 * @param difficulty
 */
export function drawBackground(canvas: HTMLCanvasElement, songName: string, difficultyInfo: DifficultyInfo) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const { name, level } = difficultyInfo;

  context.save();

  // 图片底色
  context.fillStyle = beatmapBgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 歌名
  context.fillStyle = "black";
  context.font = songNameFont;
  context.fillText(songName, 10, 30);

  // 难度
  context.font = difficultyFont;
  context.fillText(difficultyNames[name], 10, 55);

  // 星级
  context.font = levelFont;
  let levelText = "";
  for (let i = 0; i < 10; i++) {
    levelText += i < level ? "★" : "☆";
  }

  context.fillText(levelText, 35, 57);

  context.restore();
}
