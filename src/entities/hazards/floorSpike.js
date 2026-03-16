// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Constants
const DRAW_W  = 45;
const DRAW_H  = 30;
const HIT_OX  = 6;
const HIT_OY  = 0;
const HIT_W   = 33;
const HIT_H   = 16;
// #endregion

// #region Class Definition
export class FloorSpike extends Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  constructor(x, y) {
    super(x + HIT_OX, y + HIT_OY, HIT_W, HIT_H);
    this._drawX = x;
    this._drawY = y;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    const img = imageCache.get('PROP_SPIKES');
    if (!img) return;
    ctx.drawImage(img, this._drawX, this._drawY, DRAW_W, DRAW_H);
  }
}
// #endregion