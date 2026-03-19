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
/** Handles init Character State. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  _initCharacterState(options) {
    const characterId = normalizeCharacterId(options.characterId);
    this.characterId = characterId;
    this._profile = getCharacterProfile(characterId);
    this._animDefs = this._profile.anim;
    this._spawnProjectile = options.onSpawnProjectile ?? (() => {});
  },

/** Handles init Core Motion State. @param {*} y - Y value. @returns {void} - Nothing. */
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

/** Handles init Traversal State. @returns {void} - Nothing. */
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

/** Handles init Roll And Feedback State. @returns {void} - Nothing. */
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

/** Handles init Combat State. @returns {void} - Nothing. */
  _initCombatState() {
    this._attackCooldown = 0;
    this._attackAnimTimer = 0;
    this._shotAnimState = 'shot';
  },

/** Updates coyote Timer. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _updateCoyoteTimer(dt) {
    if (this.onGround) this._coyoteTimer = COYOTE_TIME;
    else this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
  },

/** Handles try Detect Wall Grab. @param {*} tileMap - Current tile map. @param {*} input - Current input state. @returns {void} - Nothing. */
  _tryDetectWallGrab(tileMap, input) {
    if (this._hurtTimer <= 0) detectWallGrab(this, tileMap, input);
  },

/** Resolves effective Look Up. @param {*} input - Current input state. @param {*} overlapLadder - Overlap Ladder value. @returns {*} - Resulting value. */
  _resolveEffectiveLookUp(input, overlapLadder) {
    return input.lookUp || (!overlapLadder && !this._atLadderTop && !!input.mobileUpActive);
  },

/** Runs movement Phase. @param {*} dt - Frame delta time. @param {*} input - Current input state. @param {*} tileMap - Current tile map. @param {*} lookUp - Look Up value. @param {*} overlapLadder - Overlap Ladder value. @returns {*} - Resulting value. */
  _runMovementPhase(dt, input, tileMap, lookUp, overlapLadder) {
    if (this._wallGrabSide !== 0) return handleWallGrab(this, dt, input, tileMap);
    this._handleFreeMovement(dt, input, tileMap, lookUp, overlapLadder);
  },

/** Updates dying. @param {*} dt - Frame delta time. @returns {boolean} - Whether the check passes. */
  _updateDying(dt) {
    if (!this.dying) return false;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.y += this.velY * dt;
    this.x += this.velX * dt;
    this.velX *= Math.max(0, 1 - 4 * dt);
    updateDust(this._dustPool, dt);
    return true;
  },

/** Handles tick Jump Buffer. @param {*} dt - Frame delta time. @param {*} input - Current input state. @returns {void} - Nothing. */
  _tickJumpBuffer(dt, input) {
    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);
  },

/** Handles prepare Ladder State. @param {*} input - Current input state. @param {*} tileMap - Current tile map. @returns {*} - Resulting value. */
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

/** Applies ladder Exit Rules. @param {*} input - Current input state. @param {*} overlapLadder - Overlap Ladder value. @returns {*} - Resulting value. */
  _applyLadderExitRules(input, overlapLadder) {
    if (!this._onLadder) return;
    if (!overlapLadder) return this._exitLadderAtTopEdge();
    if (!input.jumpPressed) return;
    exitLadder(this);
    this.velY = JUMP_FORCE;
    this._jumpBuffer = 0;
  },

/** Handles exit Ladder At Top Edge. @returns {*} - Resulting value. */
  _exitLadderAtTopEdge() {
    if (this.velY > 0) return exitLadder(this);
    this.velY = 0;
    this._atLadderTop = true;
    this._ladderExitCooldown = 0.2;
    exitLadder(this);
  },

/** Handles ladder Phase. @param {*} dt - Frame delta time. @param {*} input - Current input state. @param {*} tileMap - Current tile map. @returns {boolean} - Whether the check passes. */
  _handleLadderPhase(dt, input, tileMap) {
    if (!this._onLadder) return false;
    handleLadder(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  },

/** Handles roll Phase. @param {*} dt - Frame delta time. @param {*} input - Current input state. @param {*} tileMap - Current tile map. @returns {boolean} - Whether the check passes. */
  _handleRollPhase(dt, input, tileMap) {
    if (!this._rolling) return false;
    handleRoll(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  },

/** Handles take Damage. @param {*} enemyCenterX - Enemy Center X value. @returns {boolean} - Whether the check passes. */
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

/** Starts dying. @returns {void} - Nothing. */
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

/** Starts victory Pose. @returns {void} - Nothing. */
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

/** Checks whether rolling. @returns {boolean} - Whether the check passes. */
  isRolling() {
    return this._rolling;
  },

/** Handles roll Hit. @returns {void} - Nothing. */
  rollHit() {
    this._rollSpeed *= 0.75;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 5);
  },

/** Handles tick Timers. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
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

/** Handles tick Timer Field. @param {*} key - Key value. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _tickTimerField(key, dt) {
    if (this[key] > 0) this[key] = Math.max(0, this[key] - dt);
  },

/** Handles squash Tick. @param {*} dt - Frame delta time. @returns {*} - Resulting value. */
  _squashTick(dt) {
    if (this._squashTimer <= 0) return this._resetSquashScale();
    this._squashTimer = Math.max(0, this._squashTimer - dt);
    this._squashScale = 0.92 + (1.0 - 0.92) * (1 - this._squashTimer / 0.10);
  },

/** Handles reset Squash Scale. @returns {void} - Nothing. */
  _resetSquashScale() {
    this._squashScale = 1.0;
  },

/** Handles validate At Ladder Top. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  _validateAtLadderTop(tileMap) {
    if (!this._atLadderTop || this._onLadder) return;
    const col = Math.floor((this.x + this.w / 2) / TILE_SIZE);
    const row = Math.floor((this.y + this.h) / TILE_SIZE);
    if (!tileMap.isLadder(col, row) && !tileMap.isLadder(col, row + 1)) this._atLadderTop = false;
  },
};
