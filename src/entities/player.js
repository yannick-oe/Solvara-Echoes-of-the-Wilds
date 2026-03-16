// #region Imports
import { Entity }        from './entity.js';
import { audioManager }  from '../core/audioManager.js';
import { SFX_VOLUME }    from '../config/audioConfig.js';
import {

  ROLL_CHARGE_TIME,
  INVUL_DURATION, HURT_DURATION, BLINK_INTERVAL,
  KNOCKBACK_X, KNOCKBACK_Y,
  COYOTE_TIME, JUMP_BUFFER,
} from '../config/playerConfig.js';
import {
  FIREBALL_COOLDOWN,
  getCharacterProfile,
  normalizeCharacterId,
} from '../config/characterConfig.js';
import {
  TILE_SIZE, GRAVITY, MAX_FALL_SPEED, JUMP_FORCE, PLAYER_SPEED,
} from '../core/constants.js';
import { updateAnim }                                        from './playerAnimation.js';
import { resolveX, resolveY }                                from './playerPhysics.js';
import { makeDustPool, spawnDust, updateDust, drawDust }     from './playerDust.js';
import { FireballProjectile } from './projectiles/fireballProjectile.js';
import {
  enterLadder, exitLadder, handleLadder,
  detectWallGrab, handleWallGrab,
  startRoll, exitRoll, handleRoll,
} from './playerMovement.js';
// #endregion

// #region Constants
const PLAYER_W = 32;
const PLAYER_H = 48;
const DRAW_W  = 88;
const DRAW_H  = 88;
const DRAW_OX = Math.round((PLAYER_W - DRAW_W) / 2);
const DRAW_OY = PLAYER_H - DRAW_H;
const FALL_FRAME = 1;
// #endregion

// #region Class Definition
export class Player extends Entity {

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {object} options Input parameter.
   */
  constructor(x, y, options = {}) {
    super(x, y, PLAYER_W, PLAYER_H);
    this._initCharacterState(options);
    this._initCoreMotionState(y);
    this._initTraversalState();
    this._initRollAndFeedbackState();
    this._initCombatState();
  }

  /**
   * Initializes character/profile-related fields.
   * @param {object} options Input parameter.
   */
  _initCharacterState(options) {
    const characterId = normalizeCharacterId(options.characterId);
    this.characterId = characterId;
    this._profile = getCharacterProfile(characterId);
    this._animDefs = this._profile.anim;
    this._spawnProjectile = options.onSpawnProjectile ?? (() => {});
  }

  /**
   * Initializes core motion and base state fields.
   * @param {number} y Input parameter.
   */
  _initCoreMotionState(y) {
    this.facingRight = true;
    this.onGround = false;
    this.state = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this._invulTimer = 0;
    this._hurtTimer = 0;
    this.dying = false;
    this._prevFeetY = y + PLAYER_H;
  }

  /** Initializes ladder/wall/coyote traversal fields. */
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
  }

  /** Initializes rolling and feedback helper fields. */
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
  }

  /** Initializes attack/projectile fields. */
  _initCombatState() {
    this._attackCooldown = 0;
    this._attackAnimTimer = 0;
    this._shotAnimState = 'shot';
  }

  /**
   * Updates the player state.
   * @param {number}  dt 
   * @param {object}  input
   * @param {object}  tileMap
   */
  update(dt, input, tileMap) {
    if (this._updateDying(dt)) return;
    this._tickTimers(dt);
    this._squashTick(dt);
    this._tickJumpBuffer(dt, input);
    const overlapLadder = this._prepareLadderState(input, tileMap);
    if (this._handleLadderPhase(dt, input, tileMap)) return;
    this._tryUseSpecialAction(dt, input);
    if (this._handleRollPhase(dt, input, tileMap)) return;
    this._updateCoyoteTimer(dt);
    this._tryDetectWallGrab(tileMap, input);
    const effectiveLookUp = this._resolveEffectiveLookUp(input, overlapLadder);
    this._runMovementPhase(dt, input, tileMap, effectiveLookUp, overlapLadder);
    updateAnim(this, dt, input, effectiveLookUp);
    updateDust(this._dustPool, dt);
  }

  /**
   * Updates coyote timer from grounded state.
   * @param {number} dt Input parameter.
   */
  _updateCoyoteTimer(dt) {
    if (this.onGround) this._coyoteTimer = COYOTE_TIME;
    else this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
  }

  /**
   * Tries to detect wall-grab opportunities.
   * @param {object} tileMap Input parameter.
   * @param {object} input Input parameter.
   */
  _tryDetectWallGrab(tileMap, input) {
    if (this._hurtTimer <= 0) detectWallGrab(this, tileMap, input);
  }

  /**
   * Resolves effective look-up intent.
   * @param {object} input Input parameter.
   * @param {boolean} overlapLadder Input parameter.
   */
  _resolveEffectiveLookUp(input, overlapLadder) {
    return input.lookUp || (!overlapLadder && !this._atLadderTop && !!input.mobileUpActive);
  }

  /**
   * Runs either wall-grab movement or normal free movement.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   * @param {boolean} effectiveLookUp Input parameter.
   * @param {boolean} overlapLadder Input parameter.
   */
  _runMovementPhase(dt, input, tileMap, effectiveLookUp, overlapLadder) {
    if (this._wallGrabSide !== 0) return handleWallGrab(this, dt, input, tileMap);
    this._handleFreeMovement(dt, input, tileMap, effectiveLookUp, overlapLadder);
  }

  /**
   * Updates physics while dying and returns whether normal update should stop.
   * @param {number} dt Input parameter.
   */
  _updateDying(dt) {
    if (!this.dying) return false;
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.y += this.velY * dt;
    this.x += this.velX * dt;
    this.velX *= Math.max(0, 1 - 4 * dt);
    updateDust(this._dustPool, dt);
    return true;
  }

  /**
   * Ticks jump input buffer.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   */
  _tickJumpBuffer(dt, input) {
    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);
  }

  /**
   * Prepares ladder enter/exit state and returns overlap flag.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _prepareLadderState(input, tileMap) {
    const overlapLadder = this._hurtTimer <= 0 && tileMap.isOnLadder(this.x, this.y, this.w, this.h);
    this._validateAtLadderTop(tileMap);
    if (!this._onLadder && overlapLadder && this._ladderExitCooldown <= 0 && (input.up || input.down)) {
      this._atLadderTop = false;
      enterLadder(this);
    }
    this._applyLadderExitRules(input, overlapLadder);
    return overlapLadder;
  }

  /**
   * Applies ladder exit and jump-off rules.
   * @param {object} input Input parameter.
   * @param {boolean} overlapLadder Input parameter.
   */
  _applyLadderExitRules(input, overlapLadder) {
    if (!this._onLadder) return;
    if (!overlapLadder) return this._exitLadderAtTopEdge();
    if (!input.jumpPressed) return;
    exitLadder(this);
    this.velY = JUMP_FORCE;
    this._jumpBuffer = 0;
  }

  /**
   * Exits ladder when player leaves climbable tiles at top.
   */
  _exitLadderAtTopEdge() {
    if (this.velY > 0) return exitLadder(this);
    this.velY = 0;
    this._atLadderTop = true;
    this._ladderExitCooldown = 0.2;
    exitLadder(this);
  }

  /**
   * Handles ladder movement phase.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _handleLadderPhase(dt, input, tileMap) {
    if (!this._onLadder) return false;
    handleLadder(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  }

  /**
   * Handles rolling phase.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _handleRollPhase(dt, input, tileMap) {
    if (!this._rolling) return false;
    handleRoll(this, dt, input, tileMap);
    updateAnim(this, dt, input);
    updateDust(this._dustPool, dt);
    return true;
  }

  /**
   * Applies damage to the player from enemy contact.
   * @param {number} enemyCenterX - X center of the enemy (determines knockback direction)
   */
  takeDamage(enemyCenterX) {
    if (this._invulTimer > 0 || this.dying) return false;
    const dir        = (this.x + this.w / 2) < enemyCenterX ? -1 : 1;
    this.velX        = dir * KNOCKBACK_X;
    this.velY        = KNOCKBACK_Y;
    this._hurtTimer  = HURT_DURATION;
    this._invulTimer = INVUL_DURATION;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    exitLadder(this);
    exitRoll(this);
    return true;
  }

  /** Sets the player into the dying state (final hit). */
  startDying() {
    this.dying       = true;
    this.state       = this._profile.deathState;
    this.frameIndex  = 0;
    this._invulTimer = 0;
    this.velX        = 0;
    this.velY        = -200;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    exitLadder(this);
    exitRoll(this);
  }

  /** Sets the player into the victory pose at the goal. */
  startVictoryPose() {
    this.state      = 'victory';
    this.frameIndex = 0;
    this.velX       = 0;
    this.velY       = 0;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    exitLadder(this);
    exitRoll(this);
  }

  /** Returns true when the player is currently rolling */
  isRolling() { return this._rolling; }

  /** Called when rolling into an obstacle - reduces speed */
  rollHit() {
    this._rollSpeed *= 0.75;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 5);
  }

  /**
   * Draws the player (particles + sprite).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} _cam
   * @param {object} imageCache
   */
  draw(ctx, _cam, imageCache) {
    drawDust(this._dustPool, ctx);
    if (this._shouldSkipDraw()) return;
    const anim = this._animDefs[this.state] ?? this._animDefs.idle;
    const fi = this._getFrameIndex();
    const flipX = this._shouldFlipSprite();
    const img = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    if (this._squashScale !== 1.0) return this._drawSquashed(ctx, img, dx, dy, flipX);
    this._drawSprite(ctx, img, dx, dy, flipX, DRAW_H);
  }

  /**
   * Returns true when invulnerability blink should skip draw.
   */
  _shouldSkipDraw() {
    if (this.dying || this._invulTimer <= 0) return false;
    return Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0;
  }

  /**
   * Returns current frame index for active state.
   */
  _getFrameIndex() {
    if (this.state === 'fall') return FALL_FRAME;
    if (this.state === 'wallGrab') return this._wallPushOffTimer > 0 ? 1 : 0;
    return this.frameIndex;
  }

  /**
   * Returns whether sprite should be rendered mirrored.
   */
  _shouldFlipSprite() {
    if (this.state === 'wallGrab') return this._wallGrabSide < 0;
    return !this.facingRight;
  }

  /**
   * Draws squash/stretch frame.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} img Input parameter.
   * @param {number} dx Input parameter.
   * @param {number} dy Input parameter.
   * @param {boolean} flipX Input parameter.
   */
  _drawSquashed(ctx, img, dx, dy, flipX) {
    const squashH = DRAW_H * this._squashScale;
    const squashY = dy + (DRAW_H - squashH);
    this._drawSprite(ctx, img, dx, squashY, flipX, squashH);
  }

  /**
   * Draws sprite either normal or mirrored.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} img Input parameter.
   * @param {number} dx Input parameter.
   * @param {number} dy Input parameter.
   * @param {boolean} flipX Input parameter.
   * @param {number} drawH Input parameter.
   */
  _drawSprite(ctx, img, dx, dy, flipX, drawH) {
    if (!flipX) return ctx.drawImage(img, dx, dy, DRAW_W, drawH);
    ctx.save();
    ctx.translate(dx + DRAW_W, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, DRAW_W, drawH);
    ctx.restore();
  }

  /**
   * Updates internal countdown timers.
   * @param {number} dt Input parameter.
   */
  _tickTimers(dt) {
    if (this._invulTimer       > 0) this._invulTimer       = Math.max(0, this._invulTimer       - dt);
    if (this._hurtTimer        > 0) this._hurtTimer        = Math.max(0, this._hurtTimer        - dt);
    if (this._wallPushOffTimer > 0) this._wallPushOffTimer = Math.max(0, this._wallPushOffTimer - dt);
    if (this._ladderExitCooldown > 0) this._ladderExitCooldown = Math.max(0, this._ladderExitCooldown - dt);
    if (this._dropThroughTimer > 0) this._dropThroughTimer = Math.max(0, this._dropThroughTimer - dt);
    if (this._stepTimer        > 0) this._stepTimer        = Math.max(0, this._stepTimer        - dt);
    if (this._attackCooldown   > 0) this._attackCooldown   = Math.max(0, this._attackCooldown   - dt);
    if (this._attackAnimTimer  > 0) this._attackAnimTimer  = Math.max(0, this._attackAnimTimer  - dt);
  }

  /**
   * Updates squash and stretch animation state.
   * @param {number} dt Input parameter.
   */
  _squashTick(dt) {
    if (this._squashTimer > 0) {
      this._squashTimer = Math.max(0, this._squashTimer - dt);
      this._squashScale = 0.92 + (1.0 - 0.92) * (1 - this._squashTimer / 0.10);
    } else {
      this._squashScale = 1.0;
    }
  }

  /**
   * Validates ladder-top state when leaving ladder space.
   * @param {object} tileMap Input parameter.
   */
  _validateAtLadderTop(tileMap) {
    if (!this._atLadderTop || this._onLadder) return;
    const ts  = TILE_SIZE;
    const col = Math.floor((this.x + this.w / 2) / ts);
    const fr  = Math.floor((this.y + this.h) / ts);
    if (!tileMap.isLadder(col, fr) && !tileMap.isLadder(col, fr + 1)) {
      this._atLadderTop = false;
    }
  }

  /**
   * Attempts to use character-specific special action.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   */
  _tryUseSpecialAction(dt, input) {
    if (this._profile.ability === 'fireball') return this._tryShootFireball(input);
    this._tryStartRoll(dt, input);
  }

  /**
   * Attempts to start fox roll.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   */
  _tryStartRoll(dt, input) {
    if (!this.onGround || this._rolling || this._hurtTimer > 0) return;
    const holdDir = input.left ? -1 : (input.right ? 1 : 0);
    if (input.down && holdDir !== 0) {
      this._rollChargeTimer = Math.min(this._rollChargeTimer + dt, ROLL_CHARGE_TIME);
      if (this._rollChargeTimer >= ROLL_CHARGE_TIME) startRoll(this, holdDir);
    } else {
      this._rollChargeTimer = 0;
    }
  }

  /**
   * Attempts to fire imp projectile.
   * @param {object} input Input parameter.
   */
  _tryShootFireball(input) {
    if (!input.rollPressed || this._hurtTimer > 0 || this._rolling) return;
    if (this._onLadder || this._attackCooldown > 0) return;
    if (!this.onGround && !this._profile.canShootInAir) return;
    this._shotAnimState = this._isCrouchShooting(input) ? 'crouchShot' : 'shot';
    this._attackCooldown = FIREBALL_COOLDOWN;
    this._attackAnimTimer = 0.16;
    const projectile = this._buildFireballProjectile(input);
    this._spawnProjectile(projectile);
  }

  /**
   * Creates fireball projectile at standing/crouch height and facing direction.
   * @param {object} input Input parameter.
   */
  _buildFireballProjectile(input) {
    const dir = this.facingRight ? 1 : -1;
    const shotY = this._isCrouchShooting(input)
      ? this.y + this.h * 0.58
      : this.y + this.h * 0.34;
    const shotX = dir > 0 ? this.x + this.w - 2 : this.x - 26;
    return new FireballProjectile(shotX, shotY, dir);
  }

  /**
   * Returns true when shot should use crouch-shoot animation and lower spawn.
   * @param {object} input Input parameter.
   */
  _isCrouchShooting(input) {
    return this.onGround && input.down;
  }

  /**
   * Applies default movement, jumping, and gravity behavior.
   * @param {number} dt Input parameter.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   * @param {boolean} effectiveLookUp Input parameter.
   * @param {boolean} _overlapLadder Input parameter.
   */
  _handleFreeMovement(dt, input, tileMap, effectiveLookUp, _overlapLadder) {
    this._applyGroundInput(input, tileMap, effectiveLookUp);
    this._applyGravityAndResolveX(dt, tileMap);
    const wasGrounded = this.onGround;
    this.onGround = false;
    this._prevFeetY = this.y + this.h;
    this._resolveYAndLadderTopSnap(dt, tileMap);
    this._runGroundFeedback(tileMap, wasGrounded);
  }

  /**
   * Applies gravity and resolves horizontal movement.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _applyGravityAndResolveX(dt, tileMap) {
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    this.x += this.velX * dt;
    resolveX(this, tileMap);
  }

  /**
   * Resolves vertical movement and ladder-top snap rules.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _resolveYAndLadderTopSnap(dt, tileMap) {
    this.y += this.velY * dt;
    resolveY(this, tileMap);
    this._applyLadderTopSnap(tileMap);
  }

  /**
   * Applies ladder-top snap when exiting ladders upward.
   * @param {object} tileMap Input parameter.
   */
  _applyLadderTopSnap(tileMap) {
    if (!(this._atLadderTop && !this.onGround)) return;
    const ts = TILE_SIZE;
    const col = Math.floor((this.x + this.w / 2) / ts);
    const floorRow = Math.floor((this.y + this.h) / ts);
    if (!tileMap.isLadder(col, floorRow)) {
      this._atLadderTop = false;
      return;
    }
    this.y = floorRow * ts - this.h;
    this.velY = 0;
    this.onGround = true;
  }

  /**
   * Runs landing and footstep feedback handlers.
   * @param {object} tileMap Input parameter.
   * @param {boolean} wasGrounded Input parameter.
   */
  _runGroundFeedback(tileMap, wasGrounded) {
    this._handleLandingFeedback(tileMap, wasGrounded);
    this._handleFootstepFeedback(tileMap);
  }

  /**
   * Applies directional input, drop-through and jump logic.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   * @param {boolean} effectiveLookUp Input parameter.
   */
  _applyGroundInput(input, tileMap, effectiveLookUp) {
    if (this._hurtTimer > 0) return;
    this._applyHorizontalInput(input);
    if (this.onGround && (input.down || effectiveLookUp)) this.velX = 0;
    this._tryDropThroughOneWay(input, tileMap);
    this._tryJump();
  }

  /**
   * Applies horizontal movement and facing direction.
   * @param {object} input Input parameter.
   */
  _applyHorizontalInput(input) {
    if (input.left) return this._setHorizontal(-PLAYER_SPEED, false);
    if (input.right) return this._setHorizontal(PLAYER_SPEED, true);
    this.velX = 0;
  }

  /**
   * Sets horizontal velocity and facing direction.
   * @param {number} vx Input parameter.
   * @param {boolean} facingRight Input parameter.
   */
  _setHorizontal(vx, facingRight) {
    this.velX = vx;
    this.facingRight = facingRight;
  }

  /**
   * Handles drop-through from one-way platforms.
   * @param {object} input Input parameter.
   * @param {object} tileMap Input parameter.
   */
  _tryDropThroughOneWay(input, tileMap) {
    if (!this.onGround || !input.down || this._jumpBuffer <= 0 || this._dropThroughTimer > 0) return;
    const hasOneWay = this._isStandingOnOneWay(tileMap);
    if (!hasOneWay) return;
    this._dropThroughTimer = 0.18;
    this._jumpBuffer = 0;
    this.onGround = false;
    this._coyoteTimer = 0;
  }

  /**
   * Returns whether player feet overlap one-way tiles.
   * @param {object} tileMap Input parameter.
   */
  _isStandingOnOneWay(tileMap) {
    const ts = TILE_SIZE;
    const row = Math.floor((this.y + this.h) / ts);
    const left = Math.floor(this.x / ts);
    const right = Math.floor((this.x + this.w - 1) / ts);
    for (let col = left; col <= right; col++) if (tileMap.isOneWay(col, row)) return true;
    return false;
  }

  /**
   * Handles buffered jump execution.
   */
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
  }

  /**
   * Handles landing sound, squash and dust feedback.
   * @param {object} tileMap Input parameter.
   * @param {boolean} wasGrounded Input parameter.
   */
  _handleLandingFeedback(tileMap, wasGrounded) {
    if (wasGrounded || !this.onGround) return;
    const landSfx = tileMap.getLandingSound?.(this.x + this.w / 2, this.y + this.h);
    if (landSfx) audioManager.playSfx(landSfx, { volume: SFX_VOLUME.landing });
    this._squashTimer = 0.10;
    this._squashScale = 0.92;
    this._stepTimer = 0.20;
    this._wallLockSide = 0;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
  }

  /**
   * Handles footstep audio feedback while grounded.
   * @param {object} tileMap Input parameter.
   */
  _handleFootstepFeedback(tileMap) {
    const canStep = this.onGround && this._hurtTimer <= 0 && Math.abs(this.velX) > 20 && this._stepTimer <= 0;
    if (!canStep) return;
    const stepSfx = tileMap.getFootstepSound?.(this.x + this.w / 2, this.y + this.h);
    if (stepSfx) audioManager.playSfx(stepSfx, { volume: SFX_VOLUME.footstep });
    this._stepTimer = 0.30;
  }
}
// #endregion