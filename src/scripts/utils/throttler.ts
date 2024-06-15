import type { Ref } from "vue";

export class Throttler {
  public readonly delayRef: Ref<number>;

  private isWaitUpdate = false;
  private isMoreUpdate = false;

  constructor(delayRef: Ref<number>) {
    this.delayRef = delayRef;
  }

  public async update() {
    if (this.isWaitUpdate) {
      this.isMoreUpdate = true;
      return false;
    }
    this.isWaitUpdate = true;
    await new Promise((resolve) => setTimeout(() => resolve(true), this.delayRef.value * 1000));
    this.isWaitUpdate = false;
    if (this.isMoreUpdate) {
      this.isMoreUpdate = false;
      await this.update();
    }
    return true;
  }
}
