// #region Imports
import { Enemy } from './enemy.js';
// #endregion

// #region Constants
const EAGLE_W = 48;
const EAGLE_H = 32;
const DRAW_W  = 86;
const DRAW_H  = 56;
const DRAW_OX = (EAGLE_W - DRAW_W) / 2;
const DRAW_OY = (EAGLE_H - DRAW_H) / 2;
const FRAME_COUNT = 4;
const ANIM_FPS    = 10;
const PATROL_SPEED = 80;
// #endregion

// #region Class Definition
export class EagleEnemy extends Enemy {

/** Creates a new instance. @param {*} x - X value. @param {*} minY - Min Y value. @param {*} maxY - Max Y value. @returns {void} - Nothing. */
  constructor(x, minY, maxY) {
    super(x, minY, EAGLE_W, EAGLE_H);
    this._minY = minY;
    this._maxY = maxY;
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';
    this.velY        = PATROL_SPEED;
    this.velX        = 0;
    this._frameIndex = 0;
    this._frameTimer = 0;
  }

/** Handles update. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  update(dt) {
    if (this.dead) return;
    this.y += this.velY * dt;
    this._clampPatrolBounds();
    this._advanceAnimation(dt);
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`EAGLE_${this._frameIndex}`);
    if (!img) return;
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
  }

/** Handles clamp Patrol Bounds. @returns {*} - Resulting value. */
  _clampPatrolBounds() {
    if (this.velY > 0 && this.y >= this._maxY) return this._setPatrolY(this._maxY, -PATROL_SPEED);
    if (this.velY < 0 && this.y <= this._minY) this._setPatrolY(this._minY, PATROL_SPEED);
  }

/** Sets patrol Y. @param {*} y - Y value. @param {*} velY - Vel Y value. @returns {void} - Nothing. */
  _setPatrolY(y, velY) {
    this.y = y;
    this.velY = velY;
  }

/** Handles advance Animation. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _advanceAnimation(dt) {
    this._frameTimer += dt;
    if (this._frameTimer < 1 / ANIM_FPS) return;
    this._frameTimer -= 1 / ANIM_FPS;
    this._frameIndex = (this._frameIndex + 1) % FRAME_COUNT;
  }
}
// #endregion
