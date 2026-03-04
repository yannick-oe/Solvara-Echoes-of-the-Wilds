export class SpriteSheet {
  /**
  * Creates a sprite sheet with fixed frame size.
  * @param {HTMLImageElement} img The source image.
  * @param {number} frameW Width of one frame.
  * @param {number} frameH Height of one frame.
   */
  constructor(img, frameW, frameH) {
    this.img = img;
    this.frameW = frameW;
    this.frameH = frameH;
    this.cols = Math.floor(img.width / frameW);
  }

  /**
    * Returns the source rectangle for a frame.
    * @param {number} index The frame index.
   */
  frame(index) {
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);

    return {
      sx: col * this.frameW,
      sy: row * this.frameH,
      sw: this.frameW,
      sh: this.frameH,
    };
  }
}