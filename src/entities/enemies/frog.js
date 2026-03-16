// #region Imports
import { Enemy } from './enemy.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';
// #endregion

// #region Constants
const FROG_W = 32;
const FROG_H = 32;
const DRAW_W  = 52;
const DRAW_H  = 52;
const DRAW_OX = (FROG_W - DRAW_W) / 2;
const DRAW_OY = FROG_H - DRAW_H;
const IDLE_FRAMES = 4;
const IDLE_FPS    = 6;
const IDLE_DURATION  = 1.8;
const JUMP_VEL_Y     = -650;
const JUMP_SPEED_X   = 140;
// #endregion

// #region Class Definition
export class FrogEnemy extends Enemy {

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  constructor(x, y) {
    super(x, y, FROG_W, FROG_H);
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';
    this._state      = 'idle';
    this._idleTimer  = IDLE_DURATION;
    this._onGround   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.facingRight = Math.random() < 0.5;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  update(dt, tileMap) {
    if (this.dead) return;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    if (this._state === 'idle') {
      this.velX = 0;
      this._idleTimer -= dt;
      if (this._idleTimer <= 0) {
        this._beginJump();
      }
      this._frameTimer += dt;
      if (this._frameTimer >= 1 / IDLE_FPS) {
        this._frameTimer -= 1 / IDLE_FPS;
        this._frameIndex  = (this._frameIndex + 1) % IDLE_FRAMES;
      }
    }
    if (this._state === 'jumping') {
      this.x += this.velX * dt;
      this._resolveWall(tileMap);
    }
    this._onGround = false;
    this.y += this.velY * dt;
    this._resolveFloor(tileMap);
    if (this._state === 'jumping' && this._onGround) {
      this._state      = 'idle';
      this._idleTimer  = IDLE_DURATION;
      this.velX        = 0;
      this._frameIndex = 0;
      this._frameTimer = 0;
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
    let img;
    if (this._state === 'idle') {
      img = imageCache.get(`FROG_IDLE_${this._frameIndex}`);
    } else {
      const fi = this.velY < 0 ? 0 : 1;
      img = imageCache.get(`FROG_JUMP_${fi}`);
    }
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
   * Handles begin jump.
   */
  _beginJump() {
    this._state = 'jumping';
    this.velY   = JUMP_VEL_Y;
    const dir        = Math.random() < 0.5 ? 1 : -1;
    this.velX        = dir * JUMP_SPEED_X;
    this.facingRight = dir > 0;
    this._frameIndex = 0;
    this._frameTimer = 0;
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
        this.y         = botRow * ts - this.h;
        this.velY      = 0;
        this._onGround = true;
        return;
      }
    }
  }

  /**
   * Handles resolve wall.
   * @param {object} tileMap Input parameter.
   */
  _resolveWall(tileMap) {
    if (this.velX === 0) return;
    const ts       = TILE_SIZE;
    const topRow   = Math.floor(this.y / ts);
    const botRow   = Math.floor((this.y + this.h - 1) / ts);
    const checkCol = this.velX > 0
      ? Math.floor((this.x + this.w - 1) / ts)
      : Math.floor(this.x / ts);
    for (let row = topRow; row <= botRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        this.x    = this.velX > 0
          ? checkCol * ts - this.w
          : (checkCol + 1) * ts;
        this.velX = 0;
        break;
      }
    }
  }
}
// #endregion