export class Parallax {
  /**
   * @param {{ key: string, speedX: number, speedY?: number }[]} layers
   */
  constructor(layers) {
    this._layers = layers;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {import('../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, camX, imageCache) {
    for (const layer of this._layers) {
      const img = imageCache.get(layer.key);
      if (!img) continue;

      const offsetX = -(camX * layer.speedX) % img.width;

      // Nahtloser Wrap: Bild wird ggf. zweimal gezeichnet
      ctx.drawImage(img, offsetX, 0);
      if (offsetX < 0) {
        ctx.drawImage(img, offsetX + img.width, 0);
      }
    }
  }
}
