// #region Imports
import { Entity } from '../entity.js';
import { TILE_SIZE } from '../../core/constants.js';
import {
  FIREBALL_SPEED,
  FIREBALL_MAX_RANGE,
  FIREBALL_LIFETIME,
  FIREBALL_W,
  FIREBALL_H,
} from '../../config/characterConfig.js';
// #endregion

// #region Constants
const FIREBALL_FPS = 14;
const FIREBALL_FRAMES = 5;
// #endregion

// #region Class Definition
export class FireballProjectile extends Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} dir Input parameter.
   */
  constructor(x, y, dir) {
    super(x, y, FIREBALL_W, FIREBALL_H);
    this._dir = dir >= 0 ? 1 : -1;
    this._originX = x;
    this._life = FIREBALL_LIFETIME;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.velX = FIREBALL_SPEED * this._dir;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  update(dt, tileMap) {
    if (!this.active) return;
    this._tickAnim(dt);
    this._life -= dt;
    if (this._life <= 0 || this._isOutOfRange()) return this._deactivate();
    this.x += this.velX * dt;
    if (this._hitsBlockingTile(tileMap)) this._deactivate();
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`IMP_FIREBALL_${this._frameIndex}`);
    if (!img) return;
    if (this._dir > 0) return ctx.drawImage(img, this.x, this.y, this.w, this.h);
    ctx.save();
    ctx.translate(this.x + this.w, this.y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, this.w, this.h);
    ctx.restore();
  }

  /**
   * Deactivates projectile.
   */
  deactivate() {
    this._deactivate();
  }

  /**
   * Advances fireball animation frame.
   * @param {number} dt Input parameter.
   */
  _tickAnim(dt) {
    this._frameTimer += dt;
    const frameDuration = 1 / FIREBALL_FPS;
    if (this._frameTimer < frameDuration) return;
    this._frameTimer -= frameDuration;
    this._frameIndex = (this._frameIndex + 1) % FIREBALL_FRAMES;
  }

  /**
   * Returns true if projectile traveled past max range.
   */
  _isOutOfRange() {
    return Math.abs(this.x - this._originX) >= FIREBALL_MAX_RANGE;
  }

  /**
   * Returns true if projectile hits solid blocking tile.
   * @param {object} tileMap Input parameter.
   */
  _hitsBlockingTile(tileMap) {
    const ts = TILE_SIZE;
    const left = Math.floor(this.x / ts);
    const right = Math.floor((this.x + this.w - 1) / ts);
    const top = Math.floor(this.y / ts);
    const bottom = Math.floor((this.y + this.h - 1) / ts);
    for (let row = top; row <= bottom; row++) {
      if (tileMap.isSolid(left, row) || tileMap.isSolid(right, row)) return true;
    }
    return false;
  }

  /**
   * Internal deactivate helper.
   */
  _deactivate() {
    this.active = false;
  }
}
// #endregion