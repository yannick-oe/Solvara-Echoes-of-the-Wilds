export class ParallaxLayer {
  /**
  * Creates a parallax background layer.
  * @param {HTMLImageElement} img Background image.
  * @param {number} scrollFactor Scroll factor relative to the camera.
  * @param {number} scale Image scale factor.
  * @param {number} bottomOffset Offset from the bottom edge.
   */
  constructor(img, scrollFactor, scale, bottomOffset) {
    this.img = img;
    this.scrollFactor = scrollFactor;
    this.scale = scale;
    this.bottomOffset = bottomOffset;
  }

  /**
    * Draws the layer seamlessly across the visible width.
    * @param {CanvasRenderingContext2D} ctx Rendering context.
    * @param {number} canvasW Visible width in pixels.
    * @param {number} canvasH Visible height in pixels.
    * @param {number} cameraX Camera position on the x-axis.
   */
  draw(ctx, canvasW, canvasH, cameraX) {
    const w = Math.ceil(this.img.width * this.scale);
    const h = Math.ceil(this.img.height * this.scale);
    const y = Math.round(canvasH - h - this.bottomOffset);
    const scrollX = cameraX * this.scrollFactor;
    const offset = ((scrollX % w) + w) % w;
    let x = -Math.round(offset);
    while (x < canvasW) {
      ctx.drawImage(this.img, Math.round(x), y, w, h);
      x += w;
    }
  }
}