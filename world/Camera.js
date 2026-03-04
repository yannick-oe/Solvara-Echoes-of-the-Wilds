export class Camera {
  /**
  * Creates a camera with viewport size.
  * @param {number} viewW Width of the visible area.
  * @param {number} viewH Height of the visible area.
   */
  constructor(viewW, viewH) {
    this.x = 0;
    this.y = 0;
    this.width = viewW;
    this.height = viewH;
  }

  /**
    * Centers the camera on a target within level boundaries.
    * @param {{x:number,hitW:number}} target Target object to follow.
    * @param {number} levelPixelW Level width in pixels.
   */
  follow(target, levelPixelW) {
    this.x = target.x + target.hitW / 2 - this.width / 2;
    if (this.x < 0) this.x = 0;
    const maxX = levelPixelW - this.width;
    if (this.x > maxX) this.x = maxX;
    this.y = 0;
  }
}
