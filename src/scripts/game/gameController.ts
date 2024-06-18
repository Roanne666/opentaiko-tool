import type { Song, DifficlutyType, DifficultyInfo } from "@server/song";
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
import type { Beatmap } from "../types";
import { DrawNoteAction, DrawTextAction, parseBeatmap } from "@/scripts/utils";
import { DON_COLOR, FONT_FAMILY, KA_COLOR, SMALL_NOTE_RADIUS } from "../beatmap/const";

type Note = {};

export class GameController {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;
  public readonly audio: HTMLAudioElement;

  private isPlay = false;
  private listener: ((this: Document, ev: KeyboardEvent) => any) | undefined;

  private notes: Note[] = [];

  constructor(canvas: HTMLCanvasElement, audio: HTMLAudioElement) {
    this.canvas = canvas;
    this.canvas.width = ROW_WIDTH;
    this.audio = audio;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public async play(song: Song, difficulty: DifficlutyType) {
    const { dir, wave } = song;
    this.audio.src = dir + "\\" + wave;

    const difficultyInfo = song.difficulties.find((d) => d.name === difficulty) as DifficultyInfo;
    const beatmap = parseBeatmap(difficultyInfo.beatmapData);
    this.listener = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "f") {
      } else if (e.key === "j" || e.key === "k") {
      }
    };
    document.addEventListener("keypress", this.listener);
    this.isPlay = true;

    // 提前绘制画面，并等待两秒给玩家准备时间
    this.drawRight();
    await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
    if (this.isPlay) {
      this.audio.play();

      let lastTime = 0;
      this.nextFrame((time: number) => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (lastTime === 0) lastTime = time;
        const fps = Math.round(1 / ((time - lastTime) / 1000));
        lastTime = time;
        new DrawTextAction({ font: "16px" + FONT_FAMILY, color: "red", text: `fps: ${fps}`, x: 10, y: 100 }).draw(
          this.context
        );
        this.drawRight();

        if (this.audio.paused && this.audio.currentTime > 0) return false;
        if (this.audio.currentTime + song.offset <= 0) return true;

        this.drawNotes(song, beatmap);

        return true;
      });
    }
  }

  public stop() {
    if (this.listener) document.removeEventListener("keypress", this.listener);
    this.isPlay = false;
  }

  private nextFrame(callback: (time: number) => boolean) {
    requestAnimationFrame((time: number) => {
      if (callback(time)) this.nextFrame(callback);
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

  /**
   * 绘制音符
   */
  private drawNotes(song: Song, beatmap: Beatmap) {
    const CENTER_OFFSET = this.canvas.height / 2 - BG_HEIGHT;
    const START_X = LEFT_MARGIN_WIDTH + CIRCLE_MARGIN.INNER[0] + CIRCLE_RADIUS.INNER;
    const START_Y = CENTER_OFFSET + TOP_MARGIN_HEIGHT;
    const BEAT_WIDTH = ROW_WIDTH / 4;

    let beatCount = 0;

    // beat per second，每秒经过的节拍
    let bps = song.bpm / 60;

    // 与4/4拍相对的速度，例如4/16拍则为4倍速
    let speed = 1;

    // 当前的延迟
    let delay = 0;

    let time = this.audio.currentTime + song.offset - delay;

    while (time > -1) {
      const beat = beatmap.beats[beatCount];
      for (let i = 0; i < beat.length; i++) {
        const subCount = i / beat.length;
        const change = beatmap.changes[beatCount + subCount];
        if (change?.bpm) bps = change.bpm / 60;
        if (change?.measure) speed = change.measure[1] / 4;
        if (change?.delay) delay = change.delay;

        const noteTime = 1 / beat.length / bps / speed;
        time -= noteTime;
        if (i === beat.length - 1) beatCount += 1;
        if (time > 1) continue;

        const note = beat[i];
        const restCount = -time * bps * speed;
        const NOTE_X = START_X + restCount * BEAT_WIDTH;

        // TODO: 气球和黄条
        if (note === 0) {
        } else if (note === 1) {
          new DrawNoteAction({
            color: DON_COLOR,
            x: NOTE_X,
            y: START_Y + CIRCLE_MARGIN.INNER[1] + CIRCLE_RADIUS.INNER,
            radius: CIRCLE_RADIUS.INNER,
            angles: [0, 2 * Math.PI],
          }).draw(this.context);
        } else if (note === 2) {
          new DrawNoteAction({
            color: KA_COLOR,
            x: NOTE_X,
            y: START_Y + CIRCLE_MARGIN.INNER[1] + CIRCLE_RADIUS.INNER,
            radius: CIRCLE_RADIUS.INNER,
            angles: [0, 2 * Math.PI],
          }).draw(this.context);
        } else if (note === 3) {
          new DrawNoteAction({
            color: DON_COLOR,
            x: NOTE_X,
            y: START_Y + CIRCLE_MARGIN.OUTER[1] + CIRCLE_RADIUS.OUTER,
            radius: CIRCLE_RADIUS.OUTER,
            angles: [0, 2 * Math.PI],
          }).draw(this.context);
        } else if (note === 4) {
          new DrawNoteAction({
            color: KA_COLOR,
            x: NOTE_X,
            y: START_Y + CIRCLE_MARGIN.OUTER[1] + CIRCLE_RADIUS.OUTER,
            radius: CIRCLE_RADIUS.OUTER,
            angles: [0, 2 * Math.PI],
          }).draw(this.context);
        }
      }
    }
  }
}
