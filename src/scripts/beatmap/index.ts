import type { DifficlutyType, Song } from "@server/song";
import {
  donColor,
  kaColor,
  rowHeight,
  rowSpace,
  beatWidth,
  beatPerRow,
  markFont,
  yellowColor,
  smallNoteSize,
  bigNoteSize,
  balloonColor,
  marginX,
  marginY,
} from "@/scripts/beatmap/const";
import { getLongActions } from "@/scripts/beatmap/long";
import { getNoteAction } from "@/scripts/beatmap/note";
import { getBarActions } from "@/scripts/beatmap/bar";
import { drawRow } from "@/scripts/beatmap/row";
import { drawBackground } from "@/scripts/beatmap/background";
import { getMarkActions } from "@/scripts/beatmap/mark";
import { getBeatmapRows } from "@/scripts/beatmap/utils";
import { DrawTextAction, type DrawAction } from "@/scripts/beatmap/drawAction";

export function createBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty);
  if (!difficultyInfo) return;

  const { beatmap, balloon } = difficultyInfo;

  // 调整canvas大小并绘制背景
  const beatmapRows = getBeatmapRows(beatmap);
  canvas.width = 2 * marginX + beatWidth * beatPerRow;
  canvas.height = marginY + beatmapRows * (rowHeight + rowSpace) - rowSpace + 25;
  drawBackground(canvas, song.name, difficultyInfo);

  // 初始化数据
  const rowActions: DrawAction[] = [];
  const barActions: DrawAction[] = [];
  const markActions: DrawAction[] = [];
  const noteActions: DrawAction[] = [];

  let currentBeatCount = 0;
  let currentColumn = -1;
  let currentRow = -1;

  let lastBpm = song.bpm;
  let lastScroll = 1;
  let lastMeasure: [number, number] = [4, 4];

  // 气球索引
  let balloonIndex = 0;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  let newRow = true;

  for (let i = 0; i < beatmap.length; i++) {
    const bar = beatmap[i];
    const { measure, gogoTime, scroll, bpm, notes } = bar;
    const barPerRow = Math.floor(beatPerRow / measure[0]);
    const barWidth = measure[0] * beatWidth;

    // 不是第一小节且节拍变化时，长条时优先不换行
    const measureChange = lastMeasure[0] !== measure[0];
    const beatOverflow = currentBeatCount + measure[0] > 16;
    if (currentColumn >= 0 && measureChange && (currentLong === "" || beatOverflow)) {
      currentColumn = -1;
      currentBeatCount = 0;
      newRow = true;
    }

    lastMeasure = measure;

    const interval = Math.ceil(barWidth / notes.length);
    currentColumn += 1;

    // 超过一行小节数时换行
    if (currentColumn % barPerRow === 0) {
      currentColumn = 0;
      currentRow += 1;
      currentBeatCount = 0;
      newRow = true;
    }

    // 绘制新行
    if (newRow) {
      drawRow(context, currentRow, canvas.width);
      newRow = false;
    }

    // 绘制小节
    barActions.push(...getBarActions(i, measure, currentBeatCount, currentRow, gogoTime));

    // 根据bpm和scroll变化绘制标记
    if (i === 0) {
      if (lastScroll === scroll) {
        markActions.push(...getMarkActions(currentBeatCount, currentRow, currentColumn, { bpm }));
      } else {
        markActions.push(...getMarkActions(currentBeatCount, currentRow, currentColumn, { bpm, scroll }));
      }
    } else {
      if (lastBpm !== bpm && lastScroll !== scroll) {
        markActions.push(...getMarkActions(currentBeatCount, currentRow, currentColumn, { bpm, scroll }));
      } else if (lastBpm !== bpm) {
        markActions.push(...getMarkActions(currentBeatCount, currentRow, currentColumn, { bpm }));
      } else if (lastScroll !== scroll) {
        markActions.push(...getMarkActions(currentBeatCount, currentRow, currentColumn, { scroll }));
      }
    }

    lastBpm = bpm;
    lastScroll = scroll;

    // tja当前行没有写notes时（特殊情况）
    if (notes.length === 0 && currentLong !== "") {
      const x = marginX + currentBeatCount * beatWidth;
      const y = marginY + currentRow * (rowHeight + rowSpace) + rowHeight / 2;

      let color = currentLong === "balloon" ? balloonColor : yellowColor;
      let radius = currentLong === "big" ? bigNoteSize : smallNoteSize;
      const longActions = getLongActions({ x, y, color, radius, drawType: "middle", interval: barWidth });
      noteActions.push(...longActions);
    }

    // 绘制音符
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];
      const noteX = marginX + currentBeatCount * beatWidth + j * interval;
      const noteY = marginY + currentRow * (rowHeight + rowSpace) + rowHeight / 2;

      if (note === 0) {
        if (currentLong !== "") {
          let color = currentLong === "balloon" ? balloonColor : yellowColor;
          let radius = currentLong === "big" ? bigNoteSize : smallNoteSize;
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color,
            radius,
            drawType: "middle",
            interval,
          });
          noteActions.push(...longActions);
        }
      } else if (note === 1) {
        noteActions.push(getNoteAction(noteX, noteY, donColor, smallNoteSize, "full"));
      } else if (note === 2) {
        noteActions.push(getNoteAction(noteX, noteY, kaColor, smallNoteSize, "full"));
      } else if (note === 3) {
        noteActions.push(getNoteAction(noteX, noteY, donColor, bigNoteSize, "full"));
      } else if (note === 4) {
        noteActions.push(getNoteAction(noteX, noteY, kaColor, bigNoteSize, "full"));
      } else if (note === 5) {
        currentLong = "small";
        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: yellowColor,
          radius: smallNoteSize,
          drawType: "start",
          interval,
        });
        noteActions.push(...longActions);
      } else if (note === 6) {
        currentLong = "big";
        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: yellowColor,
          radius: bigNoteSize,
          drawType: "start",
          interval,
        });
        noteActions.push(...longActions);
      } else if (note === 7) {
        currentLong = "balloon";

        // 气球数字标记
        const balloonNum = balloon[balloonIndex];
        const textAction = new DrawTextAction({
          font: markFont,
          color: "black",
          text: `${balloonNum}`,
          x: noteX - 4,
          y: noteY + 4,
        });
        markActions.push(textAction);

        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: balloonColor,
          radius: smallNoteSize,
          drawType: "start",
          interval,
        });
        noteActions.push(...longActions);

        balloonIndex += 1;
      } else if (note === 8) {
        if (currentLong !== "") {
          let color = currentLong === "balloon" ? balloonColor : yellowColor;
          let radius = currentLong === "big" ? bigNoteSize : smallNoteSize;
          const longActions = getLongActions({ x: noteX, y: noteY, color, radius, drawType: "end", interval });
          noteActions.push(...longActions);
        }
        currentLong = "";
      }
    }

    currentBeatCount += measure[0];
  }

  // 绘制储存的所有动作
  rowActions.forEach((a) => a.draw(context));
  barActions.forEach((a) => a.draw(context));
  noteActions.forEach((a) => a.draw(context));
  markActions.forEach((a) => a.draw(context));
}
