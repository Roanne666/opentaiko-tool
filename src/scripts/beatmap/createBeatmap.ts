import type { Song, DifficlutyType } from "@server/song";
import { drawBackground } from "./background";
import { marginX, beatWidth, beatPerRow, marginY, rowHeight, rowSpace, balloonColor, yellowColor, bigNoteSize, smallNoteSize, donColor, kaColor, markFont } from "./const";
import { DrawAction, DrawTextAction } from "./drawAction";
import { getLongActions } from "./long";
import { getMarkActions } from "./mark";
import { getNoteAction } from "./note";
import { drawRow } from "./row";
import { getBeatmapRows } from "./utils";
import type { Measure } from "@server/beatmap";
import { getBeatActions, type BeatPos } from "./beat";

export function createBeatmap(canvas: HTMLCanvasElement, song: Song, difficulty: DifficlutyType) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty);
  if (!difficultyInfo) return;

  const { beatmap, balloon } = difficultyInfo;
  const beatmapRows = getBeatmapRows(beatmap);

  // 调整canvas大小并绘制背景
  canvas.width = 2 * marginX + beatWidth * beatPerRow;
  canvas.height = marginY + (beatmapRows.length + 1) * (rowHeight + rowSpace) - rowSpace + 25;
  drawBackground(canvas, song.name, difficultyInfo);

  // 初始化数据
  const beatActions: DrawAction[] = [];
  const markActions: DrawAction[] = [];
  const noteActions: DrawAction[] = [];

  let totalBeatCount = -1;
  let currentRow = 0;
  let rowBeatCount = -1;
  let currentBar = 0;
  let barBeatCount = -1;

  // 气球索引
  let balloonIndex = 0;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  let newRow = true;

  let bpm = song.bpm;
  let hs = 1;
  let measure: Measure = [4, 4];
  let gogotime = false;
  let barline = true;
  let delay = 0;

  for (let i = 0; i < beatmap.beats.length; i++) {
    barBeatCount += 1;
    if (barBeatCount === measure[0]) {
      barBeatCount = 0;
      currentBar += 1;
    }

    let beatPos: BeatPos = "start";

    if (barBeatCount > 0 && barBeatCount < measure[0] - 1) {
      beatPos = "middle";
    } else if (barBeatCount === measure[0] - 1) {
      beatPos = "end";
    }

    rowBeatCount += 1;
    // 超过节拍数时换行
    if (rowBeatCount === beatmapRows[currentRow]) {
      rowBeatCount = 0;
      currentRow += 1;
      newRow = true;
    }

    totalBeatCount += 1;
    const change = beatmap.changes[totalBeatCount];

    if (change?.bpm !== undefined) bpm = change.bpm;
    if (change?.hs !== undefined) hs = change.hs;
    if (change?.barline !== undefined) barline = change.barline;
    if (change?.gogotime !== undefined) gogotime = change.gogotime;
    if (change?.delay !== undefined) delay = change.delay;
    if (change?.measure !== undefined) measure = change.measure;

    // 绘制新行
    if (newRow) {
      drawRow(context, currentRow, canvas.width);
      newRow = false;
    }

    // 绘制节拍
    beatActions.push(...getBeatActions(currentRow, rowBeatCount, beatPos, { gogotime }));

    // 根据bpm和scroll变化绘制标记
    if (i === 0) {
      if (hs === 1) {
        markActions.push(...getMarkActions(currentBar + 1, 0, currentRow, rowBeatCount, { bpm }));
      } else {
        markActions.push(...getMarkActions(currentBar + 1, 0, currentRow, rowBeatCount, { bpm, hs }));
      }
    } else {
      markActions.push(...getMarkActions(currentBar + 1, barBeatCount, currentRow, rowBeatCount, change));
    }

    const notes = beatmap.beats[i];

    // tja当前行没有写notes时（特殊情况）
    if (notes.length === 0 && currentLong !== "") {
      const x = marginX + totalBeatCount * beatWidth;
      const y = marginY + currentRow * (rowHeight + rowSpace) + rowHeight / 2;

      let color = currentLong === "balloon" ? balloonColor : yellowColor;
      let radius = currentLong === "big" ? bigNoteSize : smallNoteSize;
      const longActions = getLongActions({ x, y, color, radius, drawType: "middle", interval: beatWidth });
      noteActions.push(...longActions);
    }

    // 音符间隔
    const noteInterval = beatWidth / notes.length;

    // 绘制音符
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];
      const noteX = marginX + rowBeatCount * beatWidth + j * noteInterval;
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
            interval: noteInterval,
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
          interval: noteInterval,
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
          interval: noteInterval,
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
          interval: noteInterval,
        });
        noteActions.push(...longActions);

        balloonIndex += 1;
      } else if (note === 8) {
        if (currentLong !== "") {
          let color = currentLong === "balloon" ? balloonColor : yellowColor;
          let radius = currentLong === "big" ? bigNoteSize : smallNoteSize;
          const longActions = getLongActions({ x: noteX, y: noteY, color, radius, drawType: "end", interval: noteInterval });
          noteActions.push(...longActions);
        }
        currentLong = "";
      }
    }
  }

  // 绘制储存的所有动作
  beatActions.forEach((a) => a.draw(context));
  noteActions.forEach((a) => a.draw(context));
  markActions.forEach((a) => a.draw(context));
}
