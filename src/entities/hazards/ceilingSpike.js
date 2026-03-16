// #region Imports
import { Entity } from '../entity.js';
import { GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';
// #endregion

// #region Constants
const DRAW_W = 45;
const DRAW_H = 27;
const HIT_OX = 6;
const HIT_OY = 0;
const HIT_W  = 33;
const HIT_H  = 27;
// #endregion

// #region Class Definition
export class CeilingSpike extends Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {object} triggers Input parameter.
   * @param {object} triggerRangeX Input parameter.
   */
  constructor(x, y, triggers = false, triggerRangeX = 88) {
    super(x + HIT_OX, y + HIT_OY, HIT_W, HIT_H);
    this._drawX        = x;
    this._drawY        = y;
    this._triggers     = triggers;
    this._triggerRange = triggerRangeX;
    this._centerX      = x + DRAW_W / 2;
    this._state = triggers ? 'idle' : 'static';
    this.velY   = 0;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   * @param {object} player Input parameter.
   * @param {number} groundY Input parameter.
   */
  update(dt, player, groundY) {
    if (this._state === 'idle') {
      const playerCenterX = player.x + player.w / 2;
      if (
        Math.abs(playerCenterX - this._centerX) < this._triggerRange &&
        player.y > this._drawY
      ) {
        this._state = 'falling';
      }
    }
    if (this._state === 'falling') {
      this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
      const dy   = this.velY * dt;
      this._drawY += dy;
      this.y      += dy;
      if (this._drawY + DRAW_H >= groundY) {
        this.active = false;
      }
    }
  }

  /**
   * Gets is lethal.
   */
  get isLethal() {
    return this._state === 'falling';
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get('PROP_SPIKES_TOP');
    if (!img) return;
    ctx.drawImage(img, this._drawX, this._drawY, DRAW_W, DRAW_H);
  }
}
// #endregion