// #region Imports
import { Enemy } from './enemy.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';
import { SFX_IDS } from '../../config/audioConfig.js';
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

/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @returns {void} - Nothing. */
  constructor(x, y) {
    super(x, y, FROG_W, FROG_H);
    this.deathSoundKey = SFX_IDS.ENEMY_KILL;
    this._state      = 'idle';
    this._idleTimer  = IDLE_DURATION;
    this._onGround   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.facingRight = Math.random() < 0.5;
  }

/** Handles update. @param {*} dt - Frame delta time. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  update(dt, tileMap) {
    if (this.dead) return;
    this._applyGravity(dt);
    this._updateIdleState(dt);
    this._updateJumpX(dt, tileMap);
    this._onGround = false;
    this.y += this.velY * dt;
    this._resolveFloor(tileMap);
    this._finishJumpOnLanding();
  }

/** Applies gravity. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _applyGravity(dt) {
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
  }

/** Updates idle State. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _updateIdleState(dt) {
    if (this._state !== 'idle') return;
    this.velX = 0;
    this._idleTimer -= dt;
    if (this._idleTimer <= 0) this._beginJump();
    this._advanceIdleFrame(dt);
  }

/** Handles advance Idle Frame. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _advanceIdleFrame(dt) {
    this._frameTimer += dt;
    const frameDur = 1 / IDLE_FPS;
    if (this._frameTimer < frameDur) return;
    this._frameTimer -= frameDur;
    this._frameIndex = (this._frameIndex + 1) % IDLE_FRAMES;
  }

/** Updates jump X. @param {*} dt - Frame delta time. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _updateJumpX(dt, tileMap) {
    if (this._state !== 'jumping') return;
    this.x += this.velX * dt;
    this._resolveWall(tileMap);
  }

/** Handles finish Jump On Landing. @returns {void} - Nothing. */
  _finishJumpOnLanding() {
    if (!(this._state === 'jumping' && this._onGround)) return;
    this._state = 'idle';
    this._idleTimer = IDLE_DURATION;
    this.velX = 0;
    this._frameIndex = 0;
    this._frameTimer = 0;
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {*} - Resulting value. */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = this._currentSprite(imageCache);
    if (!img) return;
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    if (!this.facingRight) return ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    this._drawFlipped(ctx, img, dx, dy);
  }

/** Handles current Sprite. @param {*} imageCache - Image Cache value. @returns {*} - Resulting value. */
  _currentSprite(imageCache) {
    if (this._state === 'idle') return imageCache.get(`FROG_IDLE_${this._frameIndex}`);
    const fi = this.velY < 0 ? 0 : 1;
    return imageCache.get(`FROG_JUMP_${fi}`);
  }

/** Draws flipped. @param {*} ctx - Ctx value. @param {*} img - Img value. @param {*} dx - Dx value. @param {*} dy - Dy value. @returns {void} - Nothing. */
  _drawFlipped(ctx, img, dx, dy) {
    ctx.save();
    ctx.translate(dx + DRAW_W, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
    ctx.restore();
  }

/** Handles begin Jump. @returns {void} - Nothing. */
  _beginJump() {
    this._state = 'jumping';
    this.velY   = JUMP_VEL_Y;
    const dir        = Math.random() < 0.5 ? 1 : -1;
    this.velX        = dir * JUMP_SPEED_X;
    this.facingRight = dir > 0;
    this._frameIndex = 0;
    this._frameTimer = 0;
  }


/** Resolves floor. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _resolveFloor(tileMap) {
    if (this.velY < 0) return;
    const { ts, leftCol, rightCol, botRow } = this._floorProbe();
    for (let col = leftCol; col <= rightCol; col++) {
      if (!tileMap.isSolid(col, botRow)) continue;
      this._landOnFloor(botRow, ts);
      return;
    }
  }

/** Resolves wall. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _resolveWall(tileMap) {
    if (this.velX === 0) return;
    const { ts, topRow, botRow, checkCol } = this._wallProbe();
    for (let row = topRow; row <= botRow; row++) {
      if (!tileMap.isSolid(checkCol, row)) continue;
      this._stopAtWall(checkCol, ts);
      break;
    }
  }

/** Handles floor Probe. @returns {*} - Resulting value. */
  _floorProbe() {
    return {
      ts: TILE_SIZE,
      leftCol: Math.floor(this.x / TILE_SIZE),
      rightCol: Math.floor((this.x + this.w - 1) / TILE_SIZE),
      botRow: Math.floor((this.y + this.h - 1) / TILE_SIZE),
    };
  }

/** Handles land On Floor. @param {*} botRow - Bot Row value. @param {*} ts - Ts value. @returns {void} - Nothing. */
  _landOnFloor(botRow, ts) {
    this.y = botRow * ts - this.h;
    this.velY = 0;
    this._onGround = true;
  }

/** Handles wall Probe. @returns {*} - Resulting value. */
  _wallProbe() {
    return {
      ts: TILE_SIZE,
      topRow: Math.floor(this.y / TILE_SIZE),
      botRow: Math.floor((this.y + this.h - 1) / TILE_SIZE),
      checkCol: this.velX > 0 ? Math.floor((this.x + this.w - 1) / TILE_SIZE) : Math.floor(this.x / TILE_SIZE),
    };
  }

/** Stops at Wall. @param {*} checkCol - Check Col value. @param {*} ts - Ts value. @returns {void} - Nothing. */
  _stopAtWall(checkCol, ts) {
    this.x = this.velX > 0 ? checkCol * ts - this.w : (checkCol + 1) * ts;
    this.velX = 0;
  }
}
// #endregion
