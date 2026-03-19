// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
// #endregion

// #region Class Definition
export class Parallax {
/** Creates a new instance. @param {*} layers - Layers value. @returns {void} - Nothing. */
  constructor(layers) {
    this._layers = layers;
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} camX - Cam X value. @returns {void} - Nothing. */
  draw(ctx, camX) {
    for (const layer of this._layers) this._drawLayer(ctx, camX, layer);
  }

/** Draws layer. @param {*} ctx - Ctx value. @param {*} camX - Cam X value. @param {*} layer - Layer value. @returns {void} - Nothing. */
  _drawLayer(ctx, camX, layer) {
    const metrics = this._layerMetrics(camX, layer);
    if (!metrics) return;
    const { img, drawH, drawW, drawY, startX } = metrics;
    for (let x = startX; x < CANVAS_WIDTH; x += drawW) {
      ctx.drawImage(img, Math.floor(x), drawY, drawW, drawH);
    }
  }

/** Handles layer Metrics. @param {*} camX - Cam X value. @param {*} layer - Layer value. @returns {*} - Resulting value. */
  _layerMetrics(camX, layer) {
    const { img, speed, drawH: layerH, alignBottom } = layer;
    if (!img) return null;
    const drawH = layerH ?? CANVAS_HEIGHT;
    const drawW = Math.round(img.naturalWidth * (drawH / img.naturalHeight));
    const drawY = alignBottom ? CANVAS_HEIGHT - drawH : 0;
    const rawOff = (-camX * speed) % drawW;
    const startX = Math.floor(((rawOff % drawW) + drawW) % drawW) - drawW;
    return { img, drawH, drawW, drawY, startX };
  }
}
// #endregion