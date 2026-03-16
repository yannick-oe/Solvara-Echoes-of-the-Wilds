// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
// #endregion

// #region Class Definition
export class Parallax {
  /**
   * Creates a new instance.
   * @param {Array} layers Input parameter.
   */
  constructor(layers) {
    this._layers = layers;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} camX Input parameter.
   */
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
// #endregion