import { audioManager } from '../core/audioManager.js';
import { SFX_VOLUME } from '../config/audioConfig.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED, JUMP_FORCE, PLAYER_SPEED } from '../core/constants.js';
import { resolveX, resolveY } from './playerPhysics.js';
import { spawnDust } from './playerDust.js';

export const playerMotionMethods = {
  _handleFreeMovement(dt, input, tileMap, lookUp, _overlapLadder) {
    this._applyGroundInput(input, tileMap, lookUp);
    this._applyGravityAndResolveX(dt, tileMap);
    const wasGrounded = this.onGround;
    this.onGround = false;
    this._prevFeetY = this.y + this.h;
    this._resolveYAndLadderTopSnap(dt, tileMap);
    this._runGroundFeedback(tileMap, wasGrounded);
  },

  _applyGravityAndResolveX(dt, tileMap) {
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.x += this.velX * dt;
    resolveX(this, tileMap);
  },

  _resolveYAndLadderTopSnap(dt, tileMap) {
    this.y += this.velY * dt;
    resolveY(this, tileMap);
    this._applyLadderTopSnap(tileMap);
  },

  _applyLadderTopSnap(tileMap) {
    if (!(this._atLadderTop && !this.onGround)) return;
    const col = Math.floor((this.x + this.w / 2) / TILE_SIZE);
    const row = Math.floor((this.y + this.h) / TILE_SIZE);
    if (!tileMap.isLadder(col, row)) return this._clearLadderTop();
    this.y = row * TILE_SIZE - this.h;
    this.velY = 0;
    this.onGround = true;
  },

  _clearLadderTop() {
    this._atLadderTop = false;
  },

  _runGroundFeedback(tileMap, wasGrounded) {
    this._handleLandingFeedback(tileMap, wasGrounded);
    this._handleFootstepFeedback(tileMap);
  },

  _applyGroundInput(input, tileMap, lookUp) {
    if (this._hurtTimer > 0) return;
    this._applyHorizontalInput(input);
    if (this.onGround && (input.down || lookUp)) this.velX = 0;
    this._tryDropThroughOneWay(input, tileMap);
    this._tryJump();
  },

  _applyHorizontalInput(input) {
    if (input.left) return this._setHorizontal(-PLAYER_SPEED, false);
    if (input.right) return this._setHorizontal(PLAYER_SPEED, true);
    this.velX = 0;
  },

  _setHorizontal(vx, facingRight) {
    this.velX = vx;
    this.facingRight = facingRight;
  },

  _tryDropThroughOneWay(input, tileMap) {
    if (!this.onGround || !input.down || this._jumpBuffer <= 0 || this._dropThroughTimer > 0) return;
    if (!this._isStandingOnOneWay(tileMap)) return;
    this._dropThroughTimer = 0.18;
    this._jumpBuffer = 0;
    this.onGround = false;
    this._coyoteTimer = 0;
  },

  _isStandingOnOneWay(tileMap) {
    const row = Math.floor((this.y + this.h) / TILE_SIZE);
    const left = Math.floor(this.x / TILE_SIZE);
    const right = Math.floor((this.x + this.w - 1) / TILE_SIZE);
    for (let col = left; col <= right; col++) if (tileMap.isOneWay(col, row)) return true;
    return false;
  },

  _tryJump() {
    const canJump = this.onGround || this._coyoteTimer > 0;
    if (this._jumpBuffer <= 0 || !canJump) return;
    this.velY = JUMP_FORCE;
    this.onGround = false;
    this._coyoteTimer = 0;
    this._jumpBuffer = 0;
    this._atLadderTop = false;
    audioManager.playSfx('assets/audio/sfx/jumpSound.mp3', { volume: SFX_VOLUME.jump });
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
  },

  _handleLandingFeedback(tileMap, wasGrounded) {
    if (wasGrounded || !this.onGround) return;
    const landSfx = tileMap.getLandingSound?.(this.x + this.w / 2, this.y + this.h);
    if (landSfx) audioManager.playSfx(landSfx, { volume: SFX_VOLUME.landing });
    this._squashTimer = 0.10;
    this._squashScale = 0.92;
    this._stepTimer = 0.20;
    this._wallLockSide = 0;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
  },

  _handleFootstepFeedback(tileMap) {
    const canStep = this.onGround && this._hurtTimer <= 0 && Math.abs(this.velX) > 20 && this._stepTimer <= 0;
    if (!canStep) return;
    const stepSfx = tileMap.getFootstepSound?.(this.x + this.w / 2, this.y + this.h);
    if (stepSfx) audioManager.playSfx(stepSfx, { volume: SFX_VOLUME.footstep });
    this._stepTimer = 0.30;
  },
};
