import type { Song, DifficlutyType } from "@server/song";
import { BEAT_PER_ROW, BEAT_WIDTH, PART_BG_COLOR, ROW_HEIGHT } from "@/scripts/beatmap/const";
import { DrawStrokeAction } from "@/scripts/utils";

// TODO: 游戏内容比例

const CENTER_OFFSET = 200;
const NOTE_ROW_HEIGHT = ROW_HEIGHT + 60;
const TEXT_ROW_HEIGHT = NOTE_ROW_HEIGHT / 3;
const ROW_WIDTH = BEAT_WIDTH * BEAT_PER_ROW;
const MARGIN = ROW_WIDTH / 12;
const ROW_BG_COLOR = "rgb(41,39,39)";
const TEXT_BG_COLOR = "rgb(131,132,131)";

const CIRCLE_COLORS = {
  INNER: "rgb(81,81,81)",
  MIDDLE: "rgb(122,122,122)",
  OUTER: "rgb(99,99,99)",
};

export class GameController {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;
  public readonly audio: HTMLAudioElement;

  private isPlay = false;

  constructor(canvas: HTMLCanvasElement, audio: HTMLAudioElement) {
    this.canvas = canvas;
    this.canvas.width = ROW_WIDTH;
    this.audio = audio;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public async play(song: Song, difficulty: DifficlutyType) {
    this.isPlay = true;

    // 提前绘制背景，并等待两秒给玩家准备时间
    this.drawBackground();
    await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
    if (this.isPlay) {
      this.audio.play();

      this.nextFrame(() => {
        if (this.audio.paused && this.audio.currentTime > 0) return false;
        if (this.audio.currentTime + song.offset <= 0) return true;

        this.drawBackground();

        return true;
      });
    }
  }

  public stop() {
    this.isPlay = false;
  }

  private nextFrame(callback: () => boolean) {
    requestAnimationFrame(() => {
      if (callback()) this.nextFrame(callback);
    });
  }

  private drawBackground() {
    this.context.save();

    // 灰色底
    this.context.fillStyle = ROW_BG_COLOR;
    this.context.fillRect(0, this.canvas.height / 2 - CENTER_OFFSET, ROW_WIDTH, NOTE_ROW_HEIGHT + MARGIN * 2);

    // 打击框
    this.context.fillStyle = CIRCLE_COLORS.OUTER;
    this.context.fillRect(0, this.canvas.height / 2 - CENTER_OFFSET, MARGIN + ROW_WIDTH, NOTE_ROW_HEIGHT);

    // 咚卡文字背景
    this.context.fillStyle = TEXT_BG_COLOR;
    this.context.fillRect(
      0,
      this.canvas.height / 2 - CENTER_OFFSET + NOTE_ROW_HEIGHT,
      ROW_WIDTH,
      TEXT_ROW_HEIGHT + MARGIN * 2
    );
  }
}
