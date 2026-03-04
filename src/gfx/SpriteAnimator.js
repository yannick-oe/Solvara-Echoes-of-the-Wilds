export class SpriteAnimator {
  /**
  * Creates an animator for frame indices.
  * @param {number[]} frameIndices The frame order sequence.
  * @param {number} fps Animation speed in FPS.
   */
  constructor(frameIndices, fps) {
    this.frameIndices = frameIndices;
    this.fps = fps;
    this.current = 0;
    this.accu = 0;
  }

  /**
    * Updates the current animation frame.
    * @param {number} dt Delta time in seconds.
   */
  update(dt) {
    const frameTime = 1 / this.fps;
    this.accu += dt;

    while (this.accu >= frameTime) {
      this.accu -= frameTime;
      this.current = (this.current + 1) % this.frameIndices.length;
    }
  }

  /**
    * Returns the currently active frame index.
   */
  getFrameIndex() {
    return this.frameIndices[this.current];
  }

  /**
    * Resets the animation to the first frame.
   */
  reset() {
    this.current = 0;
    this.accu = 0;
  }
}