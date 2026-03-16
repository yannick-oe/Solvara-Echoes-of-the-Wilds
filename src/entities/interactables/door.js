// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Constants
const DRAW_W = 48;
const DRAW_H = 96;
// #endregion

// #region Class Definition
export class Door extends Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  constructor(x, y) {
    super(x, y, 32, 96);
    this.isOpen = false;
  }

  /**
   * Handles unlock.
   */
  unlock() {
    this.isOpen = true;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    const imgKey = this.isOpen ? 'PROP_DOOR_OPENED' : 'PROP_DOOR';
    const img    = imageCache.get(imgKey);
    const ox     = (this.w - DRAW_W) / 2;
    if (img) {
      ctx.drawImage(img, this.x + ox, this.y, DRAW_W, DRAW_H);
    } else {
      ctx.fillStyle = this.isOpen ? '#5a3a1a55' : '#5a3a1a';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
// #endregion