import type { Song, DifficlutyType } from "@server/song";
import { BEAT_PER_ROW, BEAT_WIDTH, PART_BG_COLOR, ROW_HEIGHT } from "@/scripts/beatmap/const";
import { DrawNoteAction, DrawStrokeAction } from "@/scripts/utils";
import {
  BG_HEIGHT,
  CIRCLE_COLORS,
  CIRCLE_MARGIN,
  CIRCLE_RADIUS,
  CIRLCE_LINE_WIDTH,
  LEFT_MARGIN_WIDTH,
  MIDDLE_MARGIN_HEIGHT,
  NOTE_ROW_HEIGHT,
  ROW_BG_COLOR,
  ROW_WIDTH,
  TEXT_BG_COLOR,
  TEXT_ROW_HEIGHT,
  TOP_MARGIN_HEIGHT,
} from "./const";

// TODO: 游戏内容比例

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

    // 提前绘制画面，并等待两秒给玩家准备时间
    this.drawRight();
    await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
    if (this.isPlay) {
      this.audio.play();

      this.nextFrame(() => {
        if (this.audio.paused && this.audio.currentTime > 0) return false;
        if (this.audio.currentTime + song.offset <= 0) return true;

        this.drawRight();

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

  /**
   * 绘制右侧画面（游戏主体）
   */
  private drawRight() {
    this.context.save();

    const CENTER_OFFSET = this.canvas.height / 2 - BG_HEIGHT;

    // 黑色边框
    this.context.fillStyle = "black";
    this.context.fillRect(0, CENTER_OFFSET, ROW_WIDTH, BG_HEIGHT);

    // 灰色底
    this.context.fillStyle = ROW_BG_COLOR;
    this.context.fillRect(LEFT_MARGIN_WIDTH, CENTER_OFFSET + TOP_MARGIN_HEIGHT, ROW_WIDTH, NOTE_ROW_HEIGHT);

    // 内打击圈
    this.context.fillStyle = CIRCLE_COLORS.INNER;
    this.context.beginPath();
    this.context.arc(
      LEFT_MARGIN_WIDTH + CIRCLE_MARGIN.INNER[0] + CIRCLE_RADIUS.INNER,
      CENTER_OFFSET + TOP_MARGIN_HEIGHT + CIRCLE_MARGIN.INNER[1] + CIRCLE_RADIUS.INNER,
      CIRCLE_RADIUS.INNER,
      0,
      2 * Math.PI
    );
    this.context.fill();
    this.context.closePath();

    //  中打击圈
    this.context.strokeStyle = CIRCLE_COLORS.MIDDLE;
    this.context.lineWidth = CIRLCE_LINE_WIDTH;
    this.context.beginPath();
    this.context.arc(
      LEFT_MARGIN_WIDTH + CIRCLE_MARGIN.MIDDLE[0] + CIRCLE_RADIUS.MIDDLE,
      CENTER_OFFSET + TOP_MARGIN_HEIGHT + CIRCLE_MARGIN.MIDDLE[1] + CIRCLE_RADIUS.MIDDLE,
      CIRCLE_RADIUS.MIDDLE - CIRLCE_LINE_WIDTH,
      0,
      2 * Math.PI
    );
    this.context.stroke();
    this.context.closePath();

    // 外打击圈
    this.context.strokeStyle = CIRCLE_COLORS.OUTER;
    this.context.lineWidth = CIRLCE_LINE_WIDTH;
    this.context.beginPath();
    this.context.arc(
      LEFT_MARGIN_WIDTH + CIRCLE_MARGIN.OUTER[0] + CIRCLE_RADIUS.OUTER,
      CENTER_OFFSET + TOP_MARGIN_HEIGHT + CIRCLE_MARGIN.OUTER[1] + CIRCLE_RADIUS.OUTER,
      CIRCLE_RADIUS.OUTER - CIRLCE_LINE_WIDTH,
      0,
      2 * Math.PI
    );
    this.context.stroke();
    this.context.closePath();

    // 咚卡文字背景
    this.context.fillStyle = TEXT_BG_COLOR;
    this.context.fillRect(
      LEFT_MARGIN_WIDTH,
      CENTER_OFFSET + TOP_MARGIN_HEIGHT + NOTE_ROW_HEIGHT + MIDDLE_MARGIN_HEIGHT,
      ROW_WIDTH,
      TEXT_ROW_HEIGHT
    );

    this.context.restore();
  }

  /**
   * 绘制左侧画面（角色信息和分数）
   */
  private drawLeft() {}

  /**
   * 绘制上侧画面（曲名和魂量）
   */
  private drawTop() {}

  /**
   * 绘制下侧（小人动画）
   */
  private drawDown() {}
}
