import type { DifficlutyType, Song } from "@server/song";
import { donColor, kaColor, partRowSpace, partSize, startPos, type Vector2 } from "./const";
import { drawLong } from "./drawLong";
import { drawNote } from "./drawNote";
import { drawLine } from "./drawLine";
import { drawPartBackground } from "./drawPartBackground";
import { drawBeatmapBackground } from "./drawBeatmapBackground";
import { drawMark } from "./drawMark";

export function createBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty);
  if (!difficultyInfo) return;

  // 调整canvas大小并绘制背景
  const beatmapColumns = Math.ceil(
    difficultyInfo.beatmap.reduce((pn, beatmapPart) => pn + beatmapPart.notesArray.length, 0) / 4
  );
  canvas.height = startPos.y + beatmapColumns * (partSize.y + partRowSpace) - partRowSpace + 25;
  drawBeatmapBackground(canvas, song, difficulty);

  // 初始化数据
  let measurePartCount = -1;
  let currentRow = -1;

  let currentBpm = song.bpm;
  let currentScroll = 1;

  // 当前气球索引
  let currentBalloonCount = 0;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  for (let i = 0; i < difficultyInfo.beatmap.length; i++) {
    const part = difficultyInfo.beatmap[i];

    for (let j = 0; j < part.notesArray.length; j++) {
      const notes = part.notesArray[j];
      const interval = Math.ceil(partSize.x / notes.length);
      measurePartCount += 1;
      const grid: Vector2 = { x: measurePartCount % 4, y: Math.floor(measurePartCount / 4) };

      if (grid.y > currentRow) {
        currentRow += 1;
        drawPartBackground(context, startPos.y, currentRow, partSize.y, canvas.width, partRowSpace);
      }

      drawLine(context, grid);
      if (measurePartCount === 0) {
        if (currentScroll === part.scroll) {
          drawMark(context, grid, { bpm: part.bpm });
        } else {
          drawMark(context, grid, { bpm: part.bpm, scroll: part.scroll });
        }
      } else {
        if (currentBpm !== part.bpm && currentScroll !== part.scroll) {
          drawMark(context, grid, { bpm: part.bpm, scroll: part.scroll });
        } else if (currentBpm !== part.bpm) {
          drawMark(context, grid, { bpm: part.bpm });
        } else if (currentScroll !== part.scroll) {
          drawMark(context, grid, { scroll: part.scroll });
        }
      }

      currentBpm = part.bpm;
      currentScroll = part.scroll;

      // tja当前行没有写notes时（特殊情况）
      if (notes.length === 0 && currentLong !== "") {
        const pos: Vector2 = {
          x: startPos.x + grid.x * partSize.x,
          y: startPos.y + grid.y * (partSize.y + partRowSpace) + partSize.y / 2,
        };
        if (currentLong === "small") drawLong(context, pos, "yellow", "middle", partSize.x, "small");
        if (currentLong === "big") drawLong(context, pos, "yellow", "middle", partSize.x, "big");
        if (currentLong === "balloon") drawLong(context, pos, "balloon", "middle", partSize.x, "small");
      }

      for (let k = 0; k < notes.length; k++) {
        const notePos: Vector2 = {
          x: startPos.x + grid.x * partSize.x + k * interval,
          y: startPos.y + grid.y * (partSize.y + partRowSpace) + partSize.y / 2,
        };

        switch (notes[k]) {
          case 0:
            if (currentLong === "small") drawLong(context, notePos, "yellow", "middle", interval, "small");
            if (currentLong === "big") drawLong(context, notePos, "yellow", "middle", interval, "big");
            if (currentLong === "balloon") drawLong(context, notePos, "balloon", "middle", interval, "small");
            break;
          case 1:
            drawNote(context, notePos, donColor, "small", "full");
            break;
          case 2:
            drawNote(context, notePos, kaColor, "small", "full");
            break;
          case 3:
            drawNote(context, notePos, donColor, "big", "full");
            break;
          case 4:
            drawNote(context, notePos, kaColor, "big", "full");
            break;
          case 5:
            currentLong = "small";
            drawLong(context, notePos, "yellow", "start", interval, currentLong);
            break;
          case 6:
            currentLong = "big";
            drawLong(context, notePos, "yellow", "start", interval, currentLong);
            break;
          case 7:
            currentLong = "balloon";
            drawLong(
              context,
              notePos,
              "balloon",
              "start",
              interval,
              "small",
              difficultyInfo.balloon[currentBalloonCount]
            );
            currentBalloonCount += 1;
            break;
          case 8:
            if (currentLong === "balloon") {
              drawLong(context, notePos, "balloon", "end", interval, "small");
            } else if (currentLong === "small" || currentLong === "big") {
              drawLong(context, notePos, "yellow", "end", interval, currentLong);
            }
            currentLong = "";
            break;
        }
      }
    }
  }
}
