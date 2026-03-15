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
  TILE_SIZE, GRAVITY, MAX_FALL_SPEED, JUMP_FORCE, PLAYER_SPEED,
} from '../core/constants.js';
import { ANIM, updateAnim }                                  from './playerAnimation.js';
import { resolveX, resolveY }                                from './playerPhysics.js';
import { makeDustPool, spawnDust, updateDust, drawDust }     from './playerDust.js';
import {
  enterLadder, exitLadder, handleLadder,
  detectWallGrab, handleWallGrab,
  startRoll, exitRoll, handleRoll,
} from './playerMovement.js';

const PLAYER_W = 32;
const PLAYER_H = 48;

const DRAW_W  = 88;
const DRAW_H  = 88;
const DRAW_OX = Math.round((PLAYER_W - DRAW_W) / 2);
const DRAW_OY = PLAYER_H - DRAW_H;

const FALL_FRAME = 1;
export class Player extends Entity {

  constructor(x, y) {
    super(x, y, PLAYER_W, PLAYER_H);
    this.facingRight = true;
    this.onGround    = false;

    this.state      = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;

    this._invulTimer = 0;
    this._hurtTimer  = 0;
    this.dying       = false;

    this._wallGrabSide = 0;
    this._wallLockSide = 0;
    this._onLadder           = false;
    this._climbMoving        = false;
    this._atLadderTop        = false;
    this._ladderExitCooldown = 0;
    this._coyoteTimer = 0;
    this._jumpBuffer  = 0;
    this._wallPushOffTimer = 0;
    this._rollChargeTimer = 0;
    this._rolling         = false;
    this._rollDir         = 0;
    this._rollSpeed       = 0;
    this._prevFeetY        = y + PLAYER_H;
    this._dropThroughTimer = 0;
    this._squashTimer      = 0;
    this._squashScale      = 1.0;
    this._stepTimer        = 0;
    this._dustPool         = makeDustPool();
  }

  /**
   * Aktualisiert den Spieler-Zustand.
   * @param {number}  dt       - Delta-Zeit in Sekunden
   * @param {object}  input    - Aktueller Input-State
   * @param {object}  tileMap  - TileMap-Instanz für Kollisionsabfragen
   */
  update(dt, input, tileMap) {
    if (this.dying) {
      this.velY  = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
      this.y    += this.velY * dt;
      this.x    += this.velX * dt;
      this.velX *= Math.max(0, 1 - 4 * dt);
      updateDust(this._dustPool, dt);
      return;
    }

    this._tickTimers(dt);
    this._squashTick(dt);

    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);

    const overlapLadder = this._hurtTimer <= 0 &&
      tileMap.isOnLadder(this.x, this.y, this.w, this.h);

    this._validateAtLadderTop(tileMap);

    if (!this._onLadder && overlapLadder &&
        this._ladderExitCooldown <= 0 && (input.up || input.down)) {
      this._atLadderTop = false;
      enterLadder(this);
    }

    if (this._onLadder) {
      if (!overlapLadder) {
        if (this.velY <= 0) {
          this.velY         = 0;
          this._atLadderTop = true;
          this._ladderExitCooldown = 0.2;
        }
        exitLadder(this);
      } else if (input.jumpPressed) {
        exitLadder(this);
        this.velY        = JUMP_FORCE;
        this._jumpBuffer = 0;
      }
    }

    if (this._onLadder) {
      handleLadder(this, dt, input, tileMap);
      updateAnim(this, dt, input);
      updateDust(this._dustPool, dt);
      return;
    }

    this._tryStartRoll(dt, input);

    if (this._rolling) {
      handleRoll(this, dt, input, tileMap);
      updateAnim(this, dt, input);
      updateDust(this._dustPool, dt);
      return;
    }

    if (this.onGround) this._coyoteTimer = COYOTE_TIME;
    else               this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);

    if (this._hurtTimer <= 0) detectWallGrab(this, tileMap, input);

    const effectiveLookUp = input.lookUp ||
      (!overlapLadder && !this._atLadderTop && !!input.mobileUpActive);

    if (this._wallGrabSide !== 0) {
      handleWallGrab(this, dt, input, tileMap);
    } else {
      this._handleFreeMovement(dt, input, tileMap, effectiveLookUp, overlapLadder);
    }

    updateAnim(this, dt, input, effectiveLookUp);
    updateDust(this._dustPool, dt);
  }

  /**
   * Verursacht Schaden am Spieler durch eine Feindberührung.
   * @param {number} enemyCenterX - X-Mittelpunkt des Feindes (bestimmt Rückstoß-Richtung)
   * @returns {boolean} true, wenn Schaden erfolgreich verarbeitet wurde
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

  /** Versetzt den Spieler in den Sterbe-Zustand (letzte Berührung). */
  startDying() {
    this.dying       = true;
    this.state       = 'hurt2';
    this.frameIndex  = 0;
    this._invulTimer = 0;
    this.velX        = 0;
    this.velY        = -200;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    exitLadder(this);
    exitRoll(this);
  }

  /** Versetzt den Spieler in die Sieges-Pose am Ziel. */
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

  /** Gibt true zurück, wenn der Spieler gerade rollt */
  isRolling() { return this._rolling; }

  /** Trifft beim Rollen auf ein Hindernis – Geschwindigkeit reduzieren */
  rollHit() {
    this._rollSpeed *= 0.75;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 5);
  }

  /**
   * Zeichnet den Spieler (Partikel + Sprite).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} _cam
   * @param {object} imageCache
   */
  draw(ctx, _cam, imageCache) {
    drawDust(this._dustPool, ctx);

    if (!this.dying) {
      if (this._invulTimer > 0 && Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0) return;
    }

    const anim = ANIM[this.state];
    let fi = this.state === 'fall' ? FALL_FRAME : this.frameIndex;

    if (this.state === 'wallGrab') {
      fi = this._wallPushOffTimer > 0 ? 1 : 0;
    }

    let flipX = !this.facingRight;
    if (this.state === 'wallGrab') {
      flipX = this._wallGrabSide < 0;
    }

    const img = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;

    if (this._squashScale !== 1.0) {
      const squashH = DRAW_H * this._squashScale;
      const squashY = dy + (DRAW_H - squashH);
      if (!flipX) {
        ctx.drawImage(img, dx, squashY, DRAW_W, squashH);
      } else {
        ctx.save();
        ctx.translate(dx + DRAW_W, squashY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, DRAW_W, squashH);
        ctx.restore();
      }
    } else if (!flipX) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // Private Hilfsmethoden
  // ---------------------------------------------------------------------------

  /** Alle Countdown-Timer dekrementieren */
  _tickTimers(dt) {
    if (this._invulTimer       > 0) this._invulTimer       = Math.max(0, this._invulTimer       - dt);
    if (this._hurtTimer        > 0) this._hurtTimer        = Math.max(0, this._hurtTimer        - dt);
    if (this._wallPushOffTimer > 0) this._wallPushOffTimer = Math.max(0, this._wallPushOffTimer - dt);
    if (this._ladderExitCooldown > 0) this._ladderExitCooldown = Math.max(0, this._ladderExitCooldown - dt);
    if (this._dropThroughTimer > 0) this._dropThroughTimer = Math.max(0, this._dropThroughTimer - dt);
    if (this._stepTimer        > 0) this._stepTimer        = Math.max(0, this._stepTimer        - dt);
  }

  /** Squash-&-Stretch-Animation auf Landung (Timer-basiert) */
  _squashTick(dt) {
    if (this._squashTimer > 0) {
      this._squashTimer = Math.max(0, this._squashTimer - dt);
      this._squashScale = 0.92 + (1.0 - 0.92) * (1 - this._squashTimer / 0.10);
    } else {
      this._squashScale = 1.0;
    }
  }

  /** Veraltetes atLadderTop-Flag bereinigen, wenn Spieler nicht mehr auf der Leiter steht */
  _validateAtLadderTop(tileMap) {
    if (!this._atLadderTop || this._onLadder) return;
    const ts  = TILE_SIZE;
    const col = Math.floor((this.x + this.w / 2) / ts);
    const fr  = Math.floor((this.y + this.h) / ts);
    if (!tileMap.isLadder(col, fr) && !tileMap.isLadder(col, fr + 1)) {
      this._atLadderTop = false;
    }
  }

  /** Roll starten, wenn Bedingungen erfüllt sind */
  _tryStartRoll(dt, input) {
    if (!this.onGround || this._rolling || this._hurtTimer > 0) return;
    if (input.rollPressed) {
      startRoll(this, this.facingRight ? 1 : -1);
      return;
    }
    const holdDir = input.left ? -1 : (input.right ? 1 : 0);
    if (input.down && holdDir !== 0) {
      this._rollChargeTimer = Math.min(this._rollChargeTimer + dt, ROLL_CHARGE_TIME);
      if (this._rollChargeTimer >= ROLL_CHARGE_TIME) startRoll(this, holdDir);
    } else {
      this._rollChargeTimer = 0;
    }
  }

  /** Standard-Plattformer-Bewegung (Laufen, Springen, Gravitation, Footsteps) */
  _handleFreeMovement(dt, input, tileMap, effectiveLookUp, _overlapLadder) {
    if (this._hurtTimer <= 0) {
      // Horizontale Bewegung
      if (input.left) {
        this.velX        = -PLAYER_SPEED;
        this.facingRight = false;
      } else if (input.right) {
        this.velX        = PLAYER_SPEED;
        this.facingRight = true;
      } else {
        this.velX = 0;
      }
      if (this.onGround && (input.down || effectiveLookUp)) this.velX = 0;

      // Drop-through One-Way-Plattformen
      if (this.onGround && input.down && this._jumpBuffer > 0 && this._dropThroughTimer <= 0) {
        const _ts   = TILE_SIZE;
        const _fRow = Math.floor((this.y + this.h) / _ts);
        const _lCol = Math.floor(this.x / _ts);
        const _rCol = Math.floor((this.x + this.w - 1) / _ts);
        for (let _c = _lCol; _c <= _rCol; _c++) {
          if (tileMap.isOneWay(_c, _fRow)) {
            this._dropThroughTimer = 0.18;
            this._jumpBuffer       = 0;
            this.onGround          = false;
            this._coyoteTimer      = 0;
            break;
          }
        }
      }

      // Springen
      const canJump = this.onGround || this._coyoteTimer > 0;
      if (this._jumpBuffer > 0 && canJump) {
        this.velY         = JUMP_FORCE;
        this.onGround     = false;
        this._coyoteTimer = 0;
        this._jumpBuffer  = 0;
        this._atLadderTop = false;
        audioManager.playSfx('assets/audio/sfx/jumpSound.mp3', { volume: SFX_VOLUME.jump });
        spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
      }
    }

    // Gravitation
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);

    // X-Bewegung + Kollision
    this.x += this.velX * dt;
    resolveX(this, tileMap);

    // Y-Bewegung + Kollision
    const wasGrounded = this.onGround;
    this.onGround   = false;
    this._prevFeetY = this.y + this.h;
    this.y         += this.velY * dt;
    resolveY(this, tileMap);

    // Leiter-Top-Einrasten nach Austritt
    if (this._atLadderTop && !this.onGround) {
      const _ts   = TILE_SIZE;
      const _col  = Math.floor((this.x + this.w / 2) / _ts);
      const _fRow = Math.floor((this.y + this.h) / _ts);
      if (tileMap.isLadder(_col, _fRow)) {
        this.y        = _fRow * _ts - this.h;
        this.velY     = 0;
        this.onGround = true;
      } else {
        this._atLadderTop = false;
      }
    }

    // Landungs-Feedback
    if (!wasGrounded && this.onGround) {
      const landSfx = tileMap.getLandingSound?.(this.x + this.w / 2, this.y + this.h);
      if (landSfx) audioManager.playSfx(landSfx, { volume: SFX_VOLUME.landing });
      this._squashTimer  = 0.10;
      this._squashScale  = 0.92;
      this._stepTimer    = 0.20;
      this._wallLockSide = 0;
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
    }

    // Schritt-Sound
    if (this.onGround && this._hurtTimer <= 0 && Math.abs(this.velX) > 20 && this._stepTimer <= 0) {
      const stepSfx = tileMap.getFootstepSound?.(this.x + this.w / 2, this.y + this.h);
      if (stepSfx) audioManager.playSfx(stepSfx, { volume: SFX_VOLUME.footstep });
      this._stepTimer = 0.30;
    }
  }
}
