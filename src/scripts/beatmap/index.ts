import type { DifficlutyType, Song } from "@server/song";
import { donColor, kaColor, rowHeight, rowSpace, beatWidth, startPos, type Vector2, beatPerRow } from "./const";
import { getLongActions } from "./drawLong";
import { drawNote } from "./drawNote";
import { drawPart as drawBar } from "./drawBar";
import { drawRow } from "./drawRow";
import { drawBackground } from "./drawBackground";
import { getMarkActions } from "./drawMark";
import { getBeatmapRows } from "./utils";
import type { DrawAction, DrawNoteAction, DrawTextAction } from "./drawSystem/drawAction";

export function createBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty);
  if (!difficultyInfo) return;

  // 调整canvas大小并绘制背景
  const beatmapRows = getBeatmapRows(difficultyInfo.beatmap);
  canvas.width = 2 * startPos.x + beatWidth * beatPerRow;
  canvas.height = startPos.y + beatmapRows * (rowHeight + rowSpace) - rowSpace + 25;
  drawBackground(canvas, song, difficulty);

  // 初始化数据
  const rowActions: DrawAction[] = [];
  const barActions: DrawAction[] = [];
  const markActions: DrawAction[] = [];
  const noteActions: DrawAction[] = [];

  let barCount = -1;
  let currentCol = -1;
  let currentRow = -1;
  let lastBpm = song.bpm;
  let lastScroll = 1;
  let lastMeasure: [number, number] = [4, 4];

  // 当前气球索引
  let currentBalloonCount = 0;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  let newRow = true;

  for (let i = 0; i < difficultyInfo.beatmap.length; i++) {
    const part = difficultyInfo.beatmap[i];
    const { measure, gogoTime, scroll, bpm } = part;
    const barPerRow = Math.floor(beatPerRow / measure[0]);
    const barWidth = measure[0] * beatWidth;

    // 不是第一小节且节拍变化时
    if (barCount >= 0 && lastMeasure[0] !== measure[0]) {
      currentCol = -1;
      newRow = true;
    }

    lastMeasure = measure;

    for (let j = 0; j < part.notesArray.length; j++) {
      const notes = part.notesArray[j];
      const interval = Math.ceil(barWidth / notes.length);
      barCount += 1;
      currentCol += 1;

      // 超过一行小节数时换行
      if (currentCol % barPerRow === 0) {
        currentCol = 0;
        currentRow += 1;
        newRow = true;
      }

      // 新行时绘制
      if (newRow) {
        drawRow(context, currentRow, canvas.width);
        newRow = false;
      }

      const grid: Vector2 = { x: currentCol, y: currentRow };

      drawBar(context, barCount, measure, grid, gogoTime);

      // 根据bpm和scroll变化绘制标记
      if (barCount === 0) {
        if (lastScroll === scroll) {
          markActions.push(...getMarkActions(barWidth, grid, { bpm }));
        } else {
          markActions.push(...getMarkActions(barWidth, grid, { bpm, scroll }));
        }
      } else {
        if (lastBpm !== bpm && lastScroll !== scroll) {
          markActions.push(...getMarkActions(barWidth, grid, { bpm, scroll }));
        } else if (lastBpm !== bpm) {
          markActions.push(...getMarkActions(barWidth, grid, { bpm }));
        } else if (lastScroll !== scroll) {
          markActions.push(...getMarkActions(barWidth, grid, { scroll }));
        }
      }

      lastBpm = bpm;
      lastScroll = scroll;

      // tja当前行没有写notes时（特殊情况）
      if (notes.length === 0 && currentLong !== "") {
        const pos: Vector2 = {
          x: startPos.x + grid.x * barWidth,
          y: startPos.y + grid.y * (rowHeight + rowSpace) + rowHeight / 2,
        };
        if (currentLong === "small") getLongActions(context, pos, "yellow", "middle", barWidth, "small");
        if (currentLong === "big") getLongActions(context, pos, "yellow", "middle", barWidth, "big");
        if (currentLong === "balloon") getLongActions(context, pos, "balloon", "middle", barWidth, "small");
      }

      // 绘制音符
      for (let k = 0; k < notes.length; k++) {
        const notePos: Vector2 = {
          x: startPos.x + grid.x * barWidth + k * interval,
          y: startPos.y + grid.y * (rowHeight + rowSpace) + rowHeight / 2,
        };

        const note = notes[k];

        if (note === 0) {
          if (currentLong === "small") getLongActions(context, notePos, "yellow", "middle", interval, "small");
          if (currentLong === "big") getLongActions(context, notePos, "yellow", "middle", interval, "big");
          if (currentLong === "balloon") getLongActions(context, notePos, "balloon", "middle", interval, "small");
        } else if (note === 1) {
          noteActions.push(drawNote(notePos, donColor, "small", "full"));
        } else if (note === 2) {
          noteActions.push(drawNote(notePos, kaColor, "small", "full"));
        } else if (note === 3) {
          noteActions.push(drawNote(notePos, donColor, "big", "full"));
        } else if (note === 4) {
          noteActions.push(drawNote(notePos, kaColor, "big", "full"));
        } else if (note === 5) {
          currentLong = "small";
          noteActions.push(...getLongActions(context, notePos, "yellow", "start", interval, currentLong));
        } else if (note === 6) {
          currentLong = "big";
          noteActions.push(...getLongActions(context, notePos, "yellow", "start", interval, currentLong));
        } else if (note === 7) {
          currentLong = "balloon";
          noteActions.push(
            ...getLongActions(
              context,
              notePos,
              "balloon",
              "start",
              interval,
              "small",
              difficultyInfo.balloon[currentBalloonCount]
            )
          );
          currentBalloonCount += 1;
        } else if (note === 8) {
          if (currentLong === "balloon") {
            noteActions.push(...getLongActions(context, notePos, "balloon", "end", interval, "small"));
          } else if (currentLong === "small" || currentLong === "big") {
            noteActions.push(...getLongActions(context, notePos, "yellow", "end", interval, currentLong));
          }
          currentLong = "";
        }
      }
    }
  }

  markActions.forEach((a) => a.draw(context));
  noteActions.forEach((a) => a.draw(context));
}
