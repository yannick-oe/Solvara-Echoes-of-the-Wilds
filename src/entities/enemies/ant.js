// #region Imports
import { Enemy } from './enemy.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';
import { SFX_IDS } from '../../config/audioConfig.js';
// #endregion

// #region Constants
const DRAW_W  = 48;
const DRAW_H  = 48;
const DRAW_OX = (32 - DRAW_W) / 2;
const DRAW_OY = 32 - DRAW_H;
const FRAME_COUNT = 8;
const ANIM_FPS    = 10;
// #endregion

// #region Class Definition
export class AntEnemy extends Enemy {

/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @returns {void} - Nothing. */
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed       = 60;
    this.facingRight = true;
    this.deathSoundKey = SFX_IDS.ENEMY_KILL;
    this._frameIndex = 0;
    this._frameTimer = 0;
  }

/** Handles update. @param {*} dt - Frame delta time. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  update(dt, tileMap) {
    if (this.dead) return;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.velX = this.facingRight ? this.speed : -this.speed;
    this.x   += this.velX * dt;
    this._resolveWall(tileMap);
    this._checkEdge(tileMap);
    this.y += this.velY * dt;
    this._resolveFloor(tileMap);
    this._advanceAnimation(dt);
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {*} - Resulting value. */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`ANT_${this._frameIndex}`);
    if (!img) return;
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    if (!this.facingRight) return ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    this._drawFlipped(ctx, img, dx, dy);
  }

/** Resolves wall. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _resolveWall(tileMap) {
    const ts       = TILE_SIZE;
    const { topRow, botRow } = this._wallRows(ts);
    const checkCol = this._wallCheckCol(ts);
    for (let row = topRow; row <= botRow; row++) {
      if (!tileMap.isSolid(checkCol, row)) continue;
      this._bounceFromWall(checkCol, ts);
      return;
    }
  }

/** Checks edge. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _checkEdge(tileMap) {
    const ts         = TILE_SIZE;
    const groundRow  = Math.floor((this.y + this.h) / ts);
    const probeCol   = this.facingRight
      ? Math.floor((this.x + this.w) / ts)
      : Math.floor((this.x - 1)     / ts);
    if (!tileMap.isSolid(probeCol, groundRow)) {
      this.facingRight = !this.facingRight;
    }
  }

/** Resolves floor. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _resolveFloor(tileMap) {
    if (this.velY < 0) return;
    const ts       = TILE_SIZE;
    const leftCol  = Math.floor(this.x / ts);
    const rightCol = Math.floor((this.x + this.w - 1) / ts);
    const botRow   = Math.floor((this.y + this.h - 1) / ts);
    for (let col = leftCol; col <= rightCol; col++) {
      if (tileMap.isSolid(col, botRow)) {
        this.y    = botRow * ts - this.h;
        this.velY = 0;
        return;
      }
    }
  }

/** Handles advance Animation. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _advanceAnimation(dt) {
    this._frameTimer += dt;
    if (this._frameTimer < 1 / ANIM_FPS) return;
    this._frameTimer -= 1 / ANIM_FPS;
    this._frameIndex = (this._frameIndex + 1) % FRAME_COUNT;
  }

/** Draws flipped. @param {*} ctx - Ctx value. @param {*} img - Img value. @param {*} dx - Dx value. @param {*} dy - Dy value. @returns {void} - Nothing. */
  _drawFlipped(ctx, img, dx, dy) {
    ctx.save();
    ctx.translate(dx + DRAW_W, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
    ctx.restore();
  }

/** Handles wall Rows. @param {*} ts - Ts value. @returns {*} - Resulting value. */
  _wallRows(ts) {
    return {
      topRow: Math.floor(this.y / ts),
      botRow: Math.floor((this.y + this.h - 1) / ts),
    };
  }

/** Handles wall Check Col. @param {*} ts - Ts value. @returns {*} - Resulting value. */
  _wallCheckCol(ts) {
    if (this.facingRight) return Math.floor((this.x + this.w - 1) / ts);
    return Math.floor(this.x / ts);
  }

/** Handles bounce From Wall. @param {*} checkCol - Check Col value. @param {*} ts - Ts value. @returns {void} - Nothing. */
  _bounceFromWall(checkCol, ts) {
    this.x = this.facingRight ? checkCol * ts - this.w : (checkCol + 1) * ts;
    this.facingRight = !this.facingRight;
  }
}
// #endregion
