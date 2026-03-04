export class Camera {
  constructor(viewW, viewH) {
    this.x = 0;
    this.y = 0;
    this.width = viewW;
    this.height = viewH;
  }

  follow(target, levelPixelW) {
    this.x = target.x + target.hitW / 2 - this.width / 2;
    if (this.x < 0) this.x = 0;
    const maxX = levelPixelW - this.width;
    if (this.x > maxX) this.x = maxX;
    this.y = 0;
  }
}
