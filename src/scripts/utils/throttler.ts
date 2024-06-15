import type { Ref } from "vue";

export class Throttler {
  public readonly delayRef: Ref<number>;

  private isDelay = false;
  private isUpdate = false;

  constructor(delayRef: Ref<number>) {
    this.delayRef = delayRef;
  }

  public async update() {
    if (this.isDelay) {
      this.isUpdate = true;
      return false;
    }
    this.isDelay = true;
    await new Promise((resolve) => setTimeout(() => resolve(true), this.delayRef.value * 1000));
    this.isDelay = false;
    if (this.isUpdate) {
      this.isUpdate = false;
      await this.update();
    }
    return true;
  }
}
