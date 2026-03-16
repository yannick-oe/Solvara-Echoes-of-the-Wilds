// #region Imports
import { Enemy } from './enemy.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';
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

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed       = 60;
    this.facingRight = true;
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';
    this._frameIndex = 0;
    this._frameTimer = 0;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  update(dt, tileMap) {
    if (this.dead) return;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.velX = this.facingRight ? this.speed : -this.speed;
    this.x   += this.velX * dt;
    this._resolveWall(tileMap);
    this._checkEdge(tileMap);
    this.y += this.velY * dt;
    this._resolveFloor(tileMap);
    this._frameTimer += dt;
    if (this._frameTimer >= 1 / ANIM_FPS) {
      this._frameTimer -= 1 / ANIM_FPS;
      this._frameIndex  = (this._frameIndex + 1) % FRAME_COUNT;
    }
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`ANT_${this._frameIndex}`);
    if (!img) return;
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    if (!this.facingRight) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }

  /**
   * Handles resolve wall.
   * @param {object} tileMap Input parameter.
   */
  _resolveWall(tileMap) {
    const ts       = TILE_SIZE;
    const topRow   = Math.floor(this.y / ts);
    const botRow   = Math.floor((this.y + this.h - 1) / ts);
    const checkCol = this.facingRight
      ? Math.floor((this.x + this.w - 1) / ts)
      : Math.floor(this.x / ts);
    for (let row = topRow; row <= botRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        this.x           = this.facingRight
          ? checkCol * ts - this.w
          : (checkCol + 1) * ts;
        this.facingRight = !this.facingRight;
        return;
      }
    }
  }

  /**
   * Handles check edge.
   * @param {object} tileMap Input parameter.
   */
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

  /**
   * Handles resolve floor.
   * @param {object} tileMap Input parameter.
   */
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
}
// #endregion