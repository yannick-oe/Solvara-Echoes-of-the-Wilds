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
/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} dir - Dir value. @returns {void} - Nothing. */
  constructor(x, y, dir) {
    super(x, y, FIREBALL_W, FIREBALL_H);
    this._dir = dir >= 0 ? 1 : -1;
    this._originX = x;
    this._life = FIREBALL_LIFETIME;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.velX = FIREBALL_SPEED * this._dir;
  }

/** Handles update. @param {*} dt - Frame delta time. @param {*} tileMap - Current tile map. @returns {*} - Resulting value. */
  update(dt, tileMap) {
    if (!this.active) return;
    this._tickAnim(dt);
    this._life -= dt;
    if (this._life <= 0 || this._isOutOfRange()) return this._deactivate();
    this.x += this.velX * dt;
    if (this._hitsBlockingTile(tileMap)) this._deactivate();
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {*} - Resulting value. */
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

/** Handles deactivate. @returns {void} - Nothing. */
  deactivate() {
    this._deactivate();
  }

/** Handles tick Anim. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _tickAnim(dt) {
    this._frameTimer += dt;
    const frameDuration = 1 / FIREBALL_FPS;
    if (this._frameTimer < frameDuration) return;
    this._frameTimer -= frameDuration;
    this._frameIndex = (this._frameIndex + 1) % FIREBALL_FRAMES;
  }

/** Checks whether out Of Range. @returns {boolean} - Whether the check passes. */
  _isOutOfRange() {
    return Math.abs(this.x - this._originX) >= FIREBALL_MAX_RANGE;
  }

/** Handles hits Blocking Tile. @param {*} tileMap - Current tile map. @returns {boolean} - Whether the check passes. */
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

/** Handles deactivate. @returns {void} - Nothing. */
  _deactivate() {
    this.active = false;
  }
}
// #endregion