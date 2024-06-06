import { noteBorder } from "../const";

export abstract class DrawAction {
  public abstract draw(context: CanvasRenderingContext2D): void;
}

export class DrawRectAction extends DrawAction {
  public draw() {}
}

export class DrawTextAction extends DrawAction {
  public readonly font: string;
  public readonly fillStyle: string;
  public readonly text: string;
  public readonly x: number;
  public readonly y: number;

  constructor(options: { font: string; fillStyle: string; text: string; x: number; y: number }) {
    super();
    this.font = options.font;
    this.fillStyle = options.fillStyle;
    this.text = options.text;
    this.x = options.x;
    this.y = options.y;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.font = this.font;
    context.fillStyle = this.fillStyle;
    context.fillText(this.text, this.x, this.y);
    context.restore();
  }
}

export class DrawNoteAction extends DrawAction {
  public readonly noteColor: string;
  public readonly x: number;
  public readonly y: number;
  public readonly radius: number;
  public readonly angles: [number, number];

  constructor(options: { noteColor: string; x: number; y: number; radius: number; angles: [number, number] }) {
    super();
    this.noteColor = options.noteColor;
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
    this.angles = options.angles;
  }

  public draw(context: CanvasRenderingContext2D) {
    // 最外层黑边
    context.save();
    context.beginPath();

    context.fillStyle = noteBorder;
    context.arc(this.x, this.y, this.radius + 2.5, ...this.angles);
    context.fill();

    context.closePath();

    // 白边
    context.beginPath();

    context.fillStyle = "white";
    context.arc(this.x, this.y, this.radius + 1.5, ...this.angles);
    context.stroke();
    context.fill();

    context.closePath();

    // 音符
    context.beginPath();

    context.fillStyle = this.noteColor;
    context.arc(this.x, this.y, this.radius, ...this.angles);
    context.fill();

    context.closePath();
    context.restore();
  }
}
