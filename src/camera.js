/*
  camera.js
  ---------
  Simple horizontal follow camera.
  Keeps the player near screen center while clamping inside level bounds.
*/

export class Camera {
  /**
   * @param {number} width View width in pixels.
   * @param {number} height View height in pixels.
   */
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }

  /**
   * Follows target on X axis and clamps camera to level width.
   * @param {{x:number,width:number}} target Object to follow.
   * @param {number} levelPixelWidth Full level width in pixels.
   */
  follow(target, levelPixelWidth) {
    this.x = target.x + target.width / 2 - this.width / 2;

    if (this.x < 0) {
      this.x = 0;
    }

    const maxX = Math.max(0, levelPixelWidth - this.width);
    if (this.x > maxX) {
      this.x = maxX;
    }

    this.x = Math.round(this.x);

    this.y = 0;
  }
}