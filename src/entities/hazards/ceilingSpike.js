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
/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} triggers - Triggers value. @param {*} triggerRangeX - Trigger Range X value. @returns {void} - Nothing. */
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

/** Handles update. @param {*} dt - Frame delta time. @param {*} player - Player value. @param {*} groundY - Ground Y value. @returns {void} - Nothing. */
  update(dt, player, groundY) {
    if (this._state === 'idle') this._tryTriggerFall(player);
    if (this._state === 'falling') this._advanceFall(dt, groundY);
  }

/** Gets is Lethal. @returns {boolean} - Current value. */
  get isLethal() {
    return this._state === 'falling';
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get('PROP_SPIKES_TOP');
    if (!img) return;
    ctx.drawImage(img, this._drawX, this._drawY, DRAW_W, DRAW_H);
  }

/** Handles try Trigger Fall. @param {*} player - Player value. @returns {void} - Nothing. */
  _tryTriggerFall(player) {
    if (!this._playerIsInTriggerRange(player)) return;
    this._state = 'falling';
  }

/** Plays er Is In Trigger Range. @param {*} player - Player value. @returns {*} - Resulting value. */
  _playerIsInTriggerRange(player) {
    const playerCenterX = player.x + player.w / 2;
    return Math.abs(playerCenterX - this._centerX) < this._triggerRange && player.y > this._drawY;
  }

/** Handles advance Fall. @param {*} dt - Frame delta time. @param {*} groundY - Ground Y value. @returns {void} - Nothing. */
  _advanceFall(dt, groundY) {
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    const dy = this.velY * dt;
    this._drawY += dy;
    this.y += dy;
    if (this._drawY + DRAW_H >= groundY) this.active = false;
  }
}
// #endregion