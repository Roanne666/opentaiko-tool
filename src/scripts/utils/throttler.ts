import type { Ref } from "vue";

export class Throttler {
  public readonly delay: number;

  private isWaitUpdate = false;
  private isMoreUpdate = false;

  constructor(delay: number) {
    this.delay = delay;
  }

  public async update() {
    if (this.isWaitUpdate) {
      this.isMoreUpdate = true;
      return false;
    }
    this.isWaitUpdate = true;
    await new Promise((resolve) => setTimeout(() => resolve(true), this.delay * 1000));
    this.isWaitUpdate = false;
    if (this.isMoreUpdate) {
      this.isMoreUpdate = false;
      await this.update();
    }
    return true;
  }
}
