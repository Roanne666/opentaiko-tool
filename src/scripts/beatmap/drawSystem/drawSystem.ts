import type { DrawAction } from "./drawAction";

export class DrawSystem {
  public readonly context: CanvasRenderingContext2D;

  public rowActions: DrawAction[] = [];
  public barActions: DrawAction[] = [];
  public noteActions: DrawAction[] = [];
  public markActions: DrawAction[] = [];

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  public drawAll() {
    this.rowActions.forEach((a) => a.draw(this.context));
    this.barActions.forEach((a) => a.draw(this.context));
    this.markActions.forEach((a) => a.draw(this.context));
    this.noteActions.forEach((a) => a.draw(this.context));
  }
}
