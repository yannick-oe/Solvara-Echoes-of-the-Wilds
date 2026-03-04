export class SpriteSheet {
  constructor(img, frameW, frameH) {
    this.img = img;
    this.frameW = frameW;
    this.frameH = frameH;
    this.cols = Math.floor(img.width / frameW);
  }

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