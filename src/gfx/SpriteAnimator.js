export class SpriteAnimator {
  constructor(frameIndices, fps) {
    this.frameIndices = frameIndices;
    this.fps = fps;
    this.current = 0;
    this.accu = 0;
  }

  update(dt) {
    const frameTime = 1 / this.fps;
    this.accu += dt;

    while (this.accu >= frameTime) {
      this.accu -= frameTime;
      this.current = (this.current + 1) % this.frameIndices.length;
    }
  }

  getFrameIndex() {
    return this.frameIndices[this.current];
  }

  reset() {
    this.current = 0;
    this.accu = 0;
  }
}