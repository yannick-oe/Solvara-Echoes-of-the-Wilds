// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Constants
const DRAW_W = 32;
const DRAW_H = 32;
// #endregion

// #region Class Definition
export class Switch extends Entity {

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {object} linkedDoor Input parameter.
   */
  constructor(x, y, linkedDoor = null) {
    super(x, y, 24, 24);
    this.activated  = false;
    this.linkedDoor = linkedDoor;
    }

  /**
   * Handles activate.
   */
  activate() {
    if (!this.activated) {
      this.activated = true;
      this.linkedDoor?.unlock();
      return true;
    }
    return false;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    const imgKey = this.activated ? 'PROP_CRANK_DOWN' : 'PROP_CRANK_UP';
    const img    = imageCache.get(imgKey);
    const ox     = (this.w - DRAW_W) / 2;
    const oy     = (this.h - DRAW_H) / 2;
    if (img) {
      ctx.drawImage(img, this.x + ox, this.y + oy, DRAW_W, DRAW_H);
    } else {
      ctx.fillStyle = this.activated ? '#4a8' : '#fa0';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
// #endregion