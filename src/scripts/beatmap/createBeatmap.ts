import type { Song, DifficlutyType, DifficultyInfo } from "@server/song";
import { drawBackground } from "./background";
import {
  MARGIN_X,
  BEAT_WIDTH,
  BEAT_PER_ROW,
  MARGIN_Y,
  ROW_HEIGHT,
  ROW_SPACE,
  BALLOON_COLOR,
  YELLOW_COLOR,
  BIG_NOTE_RADIUS,
  SMALL_NOTE_RADIUS,
  DON_COLOR,
  KA_COLOR,
  MARK_FONT,
} from "./const";
import { DrawAction, DrawTextAction } from "./drawAction";
import { getLongActions } from "./long";
import { getMarkActions } from "./mark";
import { getNoteAction } from "./note";
import { drawRow } from "./row";
import { getBeatmapRows } from "./utils";
import { getBeatActions, type BeatPos } from "./beat";
import { parseBeatmap } from "./parser";
import type { Beatmap, ImageData, Measure } from "./types";

export function createBeatmap(
  canvas: HTMLCanvasElement,
  song: Song,
  difficulty: DifficlutyType,
  ignoreHs = false
): { beatmap: Beatmap; imageData: ImageData } {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty) as DifficultyInfo;

  const beatmap = parseBeatmap(difficultyInfo.beatmapData);
  const { balloon } = difficultyInfo;
  const beatmapRows = getBeatmapRows(beatmap);

  // 调整canvas大小并绘制背景
  canvas.width = 2 * MARGIN_X + BEAT_WIDTH * BEAT_PER_ROW;

  canvas.height = MARGIN_Y + (beatmapRows.length + 1) * (ROW_HEIGHT + ROW_SPACE) - ROW_SPACE + 25;
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
    if (change) {
      if (change.measure !== undefined) measure = change.measure;
      if (change.bpm !== undefined) bpm = change.bpm;
      if (change.hs !== undefined) hs = change.hs;
      if (change.delay !== undefined) delay = change.delay;
      if (change.barline !== undefined) barline = change.barline;
      if (change.gogotime !== undefined) gogotime = change.gogotime;
    }

    // 绘制新行
    if (newRow) {
      drawRow(context, currentRow, canvas.width);
      newRow = false;
    }

    // 绘制节拍
    beatActions.push(...getBeatActions(currentRow, rowBeatCount, beatPos, { gogotime }));

    const notes = beatmap.beats[i];

    // tja当前行没有写notes时（特殊情况）
    if (notes.length === 0 && currentLong !== "") {
      const x = MARGIN_X + totalBeatCount * BEAT_WIDTH;
      const y = MARGIN_Y + currentRow * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT / 2;

      let color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
      let radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
      const longActions = getLongActions({ x, y, color, radius, drawType: "middle", interval: BEAT_WIDTH });
      noteActions.push(...longActions);
    }

    // 音符间隔
    const noteInterval = BEAT_WIDTH / notes.length;

    // 绘制音符
    for (let j = 0; j < notes.length; j++) {
      const subBeatCount = j / notes.length;
      const currentBeatCount = totalBeatCount + subBeatCount;
      const subChange = beatmap.changes[currentBeatCount];
      if (subChange) {
        if (subChange.measure !== undefined) measure = subChange.measure;
        if (subChange.bpm !== undefined) bpm = subChange.bpm;
        if (subChange.hs !== undefined) hs = subChange.hs;
        if (subChange.delay !== undefined) delay = subChange.delay;
        if (subChange.barline !== undefined) barline = subChange.barline;
        if (subChange.gogotime !== undefined) gogotime = subChange.gogotime;

        // 根据bpm和scroll变化绘制标记
        if (ignoreHs) {
          if (i === 0) {
            markActions.push(...getMarkActions(currentBar + 1, 0, currentRow, rowBeatCount + subBeatCount, { bpm }));
          } else {
            subChange.hs = undefined;
            markActions.push(
              ...getMarkActions(currentBar + 1, barBeatCount, currentRow, rowBeatCount + subBeatCount, subChange)
            );
          }
        } else {
          if (i === 0) {
            if (hs === 1) {
              markActions.push(...getMarkActions(currentBar + 1, 0, currentRow, rowBeatCount + subBeatCount, { bpm }));
            } else {
              markActions.push(
                ...getMarkActions(currentBar + 1, 0, currentRow, rowBeatCount + subBeatCount, { bpm, hs })
              );
            }
          } else {
            markActions.push(
              ...getMarkActions(currentBar + 1, barBeatCount, currentRow, rowBeatCount + subBeatCount, subChange)
            );
          }
        }
      }

      const note = notes[j];
      const noteX = MARGIN_X + rowBeatCount * BEAT_WIDTH + j * noteInterval;
      const noteY = MARGIN_Y + currentRow * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT / 2;

      if (note === 0) {
        if (currentLong !== "") {
          let color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
          let radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
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
        noteActions.push(getNoteAction(noteX, noteY, DON_COLOR, SMALL_NOTE_RADIUS, "full"));
      } else if (note === 2) {
        noteActions.push(getNoteAction(noteX, noteY, KA_COLOR, SMALL_NOTE_RADIUS, "full"));
      } else if (note === 3) {
        noteActions.push(getNoteAction(noteX, noteY, DON_COLOR, BIG_NOTE_RADIUS, "full"));
      } else if (note === 4) {
        noteActions.push(getNoteAction(noteX, noteY, KA_COLOR, BIG_NOTE_RADIUS, "full"));
      } else if (note === 5) {
        currentLong = "small";
        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: YELLOW_COLOR,
          radius: SMALL_NOTE_RADIUS,
          drawType: "start",
          interval: noteInterval,
        });
        noteActions.push(...longActions);
      } else if (note === 6) {
        currentLong = "big";
        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: YELLOW_COLOR,
          radius: BIG_NOTE_RADIUS,
          drawType: "start",
          interval: noteInterval,
        });
        noteActions.push(...longActions);
      } else if (note === 7) {
        currentLong = "balloon";

        // 气球数字标记
        const balloonNum = balloon[balloonIndex];
        const textAction = new DrawTextAction({
          font: MARK_FONT,
          color: "black",
          text: `${balloonNum}`,
          x: noteX - 4,
          y: noteY + 4,
        });
        markActions.push(textAction);

        const longActions = getLongActions({
          x: noteX,
          y: noteY,
          color: BALLOON_COLOR,
          radius: SMALL_NOTE_RADIUS,
          drawType: "start",
          interval: noteInterval,
        });
        noteActions.push(...longActions);

        balloonIndex += 1;
      } else if (note === 8) {
        if (currentLong !== "") {
          let color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
          let radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color,
            radius,
            drawType: "end",
            interval: noteInterval,
          });
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

  return { beatmap, imageData: { uid: Math.floor(Math.random() * 100000), data: canvas.toDataURL("image/jpg") } };
}
