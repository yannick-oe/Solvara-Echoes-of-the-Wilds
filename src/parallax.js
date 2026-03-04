/*
  parallax.js
  -----------
  Draws one endlessly repeating background layer.
  Lower scrollFactor = farther layer (moves slower).
*/

export class ParallaxLayer {
  /**
   * @param {HTMLImageElement} image Background image.
   * @param {number} scrollFactor How fast this layer follows camera.
   * @param {number} scale Render scale.
   * @param {number} bottomOffset Vertical offset from canvas bottom.
   */
  constructor(image, scrollFactor, scale, bottomOffset) {
    this.image = image;
    this.scrollFactor = scrollFactor;
    this.scale = scale;
    this.bottomOffset = bottomOffset;
  }

  /**
   * Draws the layer tiled across visible screen width.
   * @param {CanvasRenderingContext2D} ctx Render context.
   * @param {number} canvasWidth Current canvas width.
   * @param {number} canvasHeight Current canvas height.
   * @param {number} cameraX Camera x position.
   */
  draw(ctx, canvasWidth, canvasHeight, cameraX) {
    const imageWidth = Math.ceil(this.image.width * this.scale);
    const imageHeight = Math.ceil(this.image.height * this.scale);
    const y = Math.round(canvasHeight - imageHeight - this.bottomOffset);

    const scrollX = cameraX * this.scrollFactor;
    const offset = ((scrollX % imageWidth) + imageWidth) % imageWidth;

    let x = -Math.round(offset);
    while (x < canvasWidth) {
      ctx.drawImage(this.image, Math.round(x), y, imageWidth, imageHeight);
      x += imageWidth;
    }
  }
}