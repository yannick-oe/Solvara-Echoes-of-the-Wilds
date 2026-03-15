import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';

export class Parallax {

  constructor(layers) {
    this._layers = layers;
  }

  draw(ctx, camX) {
    for (const layer of this._layers) {
      const { img, speed, drawH: layerH, alignBottom } = layer;
      if (!img) continue;

      const drawH = layerH ?? CANVAS_HEIGHT;
      const scale = drawH / img.naturalHeight;
      const drawW = Math.round(img.naturalWidth * scale);
      const drawY = alignBottom ? (CANVAS_HEIGHT - drawH) : 0;

      const rawOff = (-camX * speed) % drawW;
      const startX = Math.floor(((rawOff % drawW) + drawW) % drawW) - drawW;

      for (let x = startX; x < CANVAS_WIDTH; x += drawW) {
        ctx.drawImage(img, Math.floor(x), drawY, drawW, drawH);
      }
    }
  }
}
