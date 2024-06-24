import { NOTE_BORDER } from "@/scripts/beatmap/const";

export abstract class DrawAction {
  public abstract draw(context: CanvasRenderingContext2D): void;
}

export class DrawRectAction extends DrawAction {
  public readonly color: string;
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;

  constructor(options: { color: string; x: number; y: number; width: number; height: number }) {
    super();
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.restore();
  }
}

export class DrawStrokeAction extends DrawAction {
  public readonly color: string;
  public readonly x1: number;
  public readonly y1: number;
  public readonly x2: number;
  public readonly y2: number;
  public readonly lineWidth: number;

  constructor(options: { color: string; x1: number; y1: number; x2: number; y2: number; lineWidth: number }) {
    super();
    this.color = options.color;
    this.x1 = options.x1;
    this.y1 = options.y1;
    this.x2 = options.x2;
    this.y2 = options.y2;
    this.lineWidth = options.lineWidth;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.closePath();
    context.stroke();
    context.restore();
  }
}

export class DrawTextAction extends DrawAction {
  public readonly font: string;
  public readonly color: string;
  public readonly text: string;
  public readonly x: number;
  public readonly y: number;

  constructor(options: { font: string; color: string; text: string; x: number; y: number }) {
    super();
    this.font = options.font;
    this.color = options.color;
    this.text = options.text;
    this.x = options.x;
    this.y = options.y;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.font = this.font;
    context.fillStyle = this.color;
    context.fillText(this.text, this.x, this.y);
    context.restore();
  }
}

export class DrawNoteAction extends DrawAction {
  public readonly color: string;
  public readonly x: number;
  public readonly y: number;
  public readonly radius: number;
  public readonly angles: [number, number];

  constructor(options: { color: string; x: number; y: number; radius: number; angles: [number, number] }) {
    super();
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
    this.angles = options.angles;
  }

  public draw(context: CanvasRenderingContext2D) {
    const { x, y, color, radius, angles } = this;

    // 最外层黑边
    context.save();
    context.beginPath();
    context.fillStyle = NOTE_BORDER;
    context.arc(x, y, radius, ...angles);
    context.fill();
    context.closePath();

    // 白边
    context.beginPath();
    context.fillStyle = "white";
    context.arc(x, y, radius * 0.9, ...angles);
    context.stroke();
    context.fill();
    context.closePath();

    // 音符
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, radius * 0.75, ...angles);
    context.fill();
    context.closePath();
    context.restore();
  }
}
