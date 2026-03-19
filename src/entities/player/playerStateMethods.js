import {
  INVUL_DURATION, HURT_DURATION,
  KNOCKBACK_X, KNOCKBACK_Y,
  COYOTE_TIME, JUMP_BUFFER,
} from '../../config/playerConfig.js';
import { GRAVITY, MAX_FALL_SPEED, JUMP_FORCE, TILE_SIZE } from '../../core/constants.js';
import { getCharacterProfile, normalizeCharacterId } from '../../config/characterConfig.js';
import { updateAnim } from './playerAnimation.js';
import { makeDustPool, spawnDust, updateDust } from './playerDust.js';
import {
  enterLadder, exitLadder, handleLadder,
  detectWallGrab, handleWallGrab,
  exitRoll, handleRoll,
} from './playerMovement.js';

export const playerStateMethods = {
  _initCharacterState(options) {
    const characterId = normalizeCharacterId(options.characterId);
    this.characterId = characterId;
    this._profile = getCharacterProfile(characterId);
    this._animDefs = this._profile.anim;
    this._spawnProjectile = options.onSpawnProjectile ?? (() => {});
  },

  _initCoreMotionState(y) {
    this.facingRight = true;
    this.onGround = false;
    this.state = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this._invulTimer = 0;
    this._hurtTimer = 0;
    this.dying = false;
    this._prevFeetY = y + this.h;
  },

  _initTraversalState() {
    this._wallGrabSide = 0;
    this._wallLockSide = 0;
    this._onLadder = false;
    this._climbMoving = false;
    this._atLadderTop = false;
    this._ladderExitCooldown = 0;
    this._coyoteTimer = 0;
    this._jumpBuffer = 0;
    this._wallPushOffTimer = 0;
  },

  _initRollAndFeedbackState() {
    this._rollChargeTimer = 0;
    this._rolling = false;
    this._rollDir = 0;
    this._rollSpeed = 0;
    this._dropThroughTimer = 0;
    this._squashTimer = 0;
    this._squashScale = 1.0;
    this._stepTimer = 0;
    this._dustPool = makeDustPool();
  },

  _initCombatState() {
    this._attackCooldown = 0;
    this._attackAnimTimer = 0;
    this._shotAnimState = 'shot';
  },

  _updateCoyoteTimer(dt) {
    if (this.onGround) this._coyoteTimer = COYOTE_TIME;
    else this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
  },

  _tryDetectWallGrab(tileMap, input) {
    if (this._hurtTimer <= 0) detectWallGrab(this, tileMap, input);
  },

  _resolveEffectiveLookUp(input, overlapLadder) {
    return input.lookUp || (!overlapLadder && !this._atLadderTop && !!input.mobileUpActive);
  },

  _runMovementPhase(dt, input, tileMap, lookUp, overlapLadder) {
    if (this._wallGrabSide !== 0) return handleWallGrab(this, dt, input, tileMap);
    this._handleFreeMovement(dt, input, tileMap, lookUp, overlapLadder);
  },

  _updateDying(dt) {
    if (!this.dying) return false;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.y += this.velY * dt;
    this.x += this.velX * dt;
    this.velX *= Math.max(0, 1 - 4 * dt);
    updateDust(this._dustPool, dt);
    return true;
  },

  _tickJumpBuffer(dt, input) {
    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);
  },

  _prepareLadderState(input, tileMap) {
    const overlap = this._hurtTimer <= 0 && tileMap.isOnLadder(this.x, this.y, this.w, this.h);
    this._validateAtLadderTop(tileMap);
    if (!this._onLadder && overlap && this._ladderExitCooldown <= 0 && (input.up || input.down)) {
      this._atLadderTop = false;
      enterLadder(this);
    }
    this._applyLadderExitRules(input, overlap);
    return overlap;
  },

  _applyLadderExitRules(input, overlapLadder) {
    if (!this._onLadder) return;
    if (!overlapLadder) return this._exitLadderAtTopEdge();
    if (!input.jumpPressed) return;
    exitLadder(this);
    this.velY = JUMP_FORCE;
    this._jumpBuffer = 0;
  },

  _exitLadderAtTopEdge() {
    if (this.velY > 0) return exitLadder(this);
    this.velY = 0;
    this._atLadderTop = true;
    this._ladderExitCooldown = 0.2;
    exitLadder(this);
  },

  _handleLadderPhase(dt, input, tileMap) {
    if (!this._onLadder) return false;
    handleLadder(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  },

  _handleRollPhase(dt, input, tileMap) {
    if (!this._rolling) return false;
    handleRoll(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  },

  takeDamage(enemyCenterX) {
    if (this._invulTimer > 0 || this.dying) return false;
    const dir = (this.x + this.w / 2) < enemyCenterX ? -1 : 1;
    this.velX = dir * KNOCKBACK_X;
    this.velY = KNOCKBACK_Y;
    this._hurtTimer = HURT_DURATION;
    this._invulTimer = INVUL_DURATION;
    this._wallGrabSide = 0;
    this._atLadderTop = false;
    exitLadder(this);
    exitRoll(this);
    return true;
  },

  startDying() {
    this.dying = true;
    this.state = this._profile.deathState;
    this.frameIndex = 0;
    this._invulTimer = 0;
    this.velX = 0;
    this.velY = -200;
    this._wallGrabSide = 0;
    this._atLadderTop = false;
    exitLadder(this);
    exitRoll(this);
  },

  startVictoryPose() {
    this.state = 'victory';
    this.frameIndex = 0;
    this.velX = 0;
    this.velY = 0;
    this._wallGrabSide = 0;
    this._atLadderTop = false;
    exitLadder(this);
    exitRoll(this);
  },

  isRolling() {
    return this._rolling;
  },

  rollHit() {
    this._rollSpeed *= 0.75;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 5);
  },

  _tickTimers(dt) {
    this._tickTimerField('_invulTimer', dt);
    this._tickTimerField('_hurtTimer', dt);
    this._tickTimerField('_wallPushOffTimer', dt);
    this._tickTimerField('_ladderExitCooldown', dt);
    this._tickTimerField('_dropThroughTimer', dt);
    this._tickTimerField('_stepTimer', dt);
    this._tickTimerField('_attackCooldown', dt);
    this._tickTimerField('_attackAnimTimer', dt);
  },

  _tickTimerField(key, dt) {
    if (this[key] > 0) this[key] = Math.max(0, this[key] - dt);
  },

  _squashTick(dt) {
    if (this._squashTimer <= 0) return this._resetSquashScale();
    this._squashTimer = Math.max(0, this._squashTimer - dt);
    this._squashScale = 0.92 + (1.0 - 0.92) * (1 - this._squashTimer / 0.10);
  },

  _resetSquashScale() {
    this._squashScale = 1.0;
  },

  _validateAtLadderTop(tileMap) {
    if (!this._atLadderTop || this._onLadder) return;
    const col = Math.floor((this.x + this.w / 2) / TILE_SIZE);
    const row = Math.floor((this.y + this.h) / TILE_SIZE);
    if (!tileMap.isLadder(col, row) && !tileMap.isLadder(col, row + 1)) this._atLadderTop = false;
  },
};
