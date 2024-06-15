import type { DifficlutyType, Song } from "@server/song";
import { BEAT_WIDTH, MARGIN_X, MARGIN_Y, ROW_HEIGHT, ROW_SPACE } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "./drawAction";
import { getBeatmapRows } from "./utils";
import type { Beatmap } from "./types";
import { createBeatmap } from "./createBeatmap";

export class BeatmapViewer {
  public canvas: HTMLCanvasElement;
  public audio: HTMLAudioElement;

  public sourceImage = new Image();
  public imageUid = -1;

  constructor(canvas: HTMLCanvasElement, audio: HTMLAudioElement) {
    this.canvas = canvas;
    this.audio = audio;
  }

  public init(song: Song, difficulty: DifficlutyType) {
    const { beatmap, imageData } = createBeatmap(this.canvas, song, difficulty);

    this.sourceImage.src = imageData.data;
    this.imageUid = imageData.uid;
    this.sourceImage.onload = async () => {
      const context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

      const beatmapRows = getBeatmapRows(beatmap);

      this.nextFrame(() => {
        if (this.imageUid !== imageData.uid) return false;
        if (this.audio.paused) return true;
        if (this.audio.currentTime + song.offset <= 0) return true;

        const { currentX, row } = this.getCurrentPos(song, beatmap, beatmapRows);

        context.drawImage(this.sourceImage, 0, 0);
        new DrawStrokeAction({
          color: "red",
          lineWidth: 2,
          x1: currentX,
          y1: MARGIN_Y + row * (ROW_SPACE + ROW_HEIGHT) - 15,
          x2: currentX,
          y2: MARGIN_Y + row * (ROW_SPACE + ROW_HEIGHT) + 45,
        }).draw(context);

        return true;
      });
    };
  }

  private nextFrame(callback: () => boolean) {
    requestAnimationFrame(() => {
      if (callback()) this.nextFrame(callback);
    });
  }

  private getCurrentPos(song: Song, beatmap: Beatmap, beatmapRows: number[]): { currentX: number; row: number } {
    let currentX = MARGIN_X;

    let totalBeatCount = 0;

    let row = 0;
    let rowBeatCount = 0;

    // beat per second，每秒经过的节拍
    let bps = song.bpm / 60;

    // 与4/4拍相对的速度，例如4/16拍则为4倍速
    let speed = 1;

    // 当前的延迟
    let delay = 0;

    let time = this.audio.currentTime + song.offset - delay;
    while (time > 0) {
      const beat = beatmap.beats[totalBeatCount];
      for (let i = 0; i < beat.length; i++) {
        const subCount = i / beat.length;
        const change = beatmap.changes[totalBeatCount + subCount];
        if (change?.bpm) bps = change.bpm / 60;
        if (change?.measure) speed = change.measure[1] / 4;
        if (change?.delay) delay = change.delay;

        const subBeatTime = 1 / beat.length / bps / speed;
        if (time > subBeatTime) {
          time -= subBeatTime;
        } else {
          const restCount = time * bps * speed;
          const finalCount = subCount + restCount;
          currentX = MARGIN_X + (rowBeatCount + finalCount) * BEAT_WIDTH;
          time = 0;
          break;
        }

        if (i === beat.length - 1) {
          rowBeatCount += 1;
          if (rowBeatCount >= beatmapRows[row]) {
            rowBeatCount = 0;
            row += 1;
          }
          totalBeatCount += 1;
        }
      }
    }

    return { currentX, row };
  }
}
