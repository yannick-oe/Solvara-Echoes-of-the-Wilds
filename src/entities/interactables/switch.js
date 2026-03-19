// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Constants
const DRAW_W = 32;
const DRAW_H = 32;
// #endregion

// #region Class Definition
export class Switch extends Entity {

/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} linkedDoor - Linked Door value. @returns {void} - Nothing. */
  constructor(x, y, linkedDoor = null) {
    super(x, y, 24, 24);
    this.activated  = false;
    this.linkedDoor = linkedDoor;
    }

/** Handles activate. @returns {boolean} - Whether the check passes. */
  activate() {
    if (!this.activated) {
      this.activated = true;
      this.linkedDoor?.unlock();
      return true;
    }
    return false;
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
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