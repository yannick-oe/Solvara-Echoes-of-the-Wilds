// #region Imports
import { ROLL_CHARGE_TIME } from '../../config/playerConfig.js';
import { FIREBALL_COOLDOWN } from '../../config/characterConfig.js';
import { startRoll } from './playerMovement.js';
import { FireballProjectile } from '../projectiles/fireballProjectile.js';

// #endregion
// #region Combat Methods
export const playerCombatMethods = {
/** Handles try Use Special Action. @param {*} dt - Frame delta time. @param {*} input - Current input state. @returns {*} - Resulting value. */
  _tryUseSpecialAction(dt, input) {
    if (this._profile.ability === 'fireball') return this._tryShootFireball(input);
    this._tryStartRoll(dt, input);
  },

/** Handles try Start Roll. @param {*} dt - Frame delta time. @param {*} input - Current input state. @returns {*} - Resulting value. */
  _tryStartRoll(dt, input) {
    if (!this.onGround || this._rolling || this._hurtTimer > 0) return;
    const holdDir = input.left ? -1 : (input.right ? 1 : 0);
    if (input.down && holdDir !== 0) return this._chargeRoll(dt, holdDir);
    this._rollChargeTimer = 0;
  },

/** Handles charge Roll. @param {*} dt - Frame delta time. @param {*} holdDir - Hold Dir value. @returns {void} - Nothing. */
  _chargeRoll(dt, holdDir) {
    this._rollChargeTimer = Math.min(this._rollChargeTimer + dt, ROLL_CHARGE_TIME);
    if (this._rollChargeTimer >= ROLL_CHARGE_TIME) startRoll(this, holdDir);
  },

/** Handles try Shoot Fireball. @param {*} input - Current input state. @returns {void} - Nothing. */
  _tryShootFireball(input) {
    if (!input.rollPressed || this._hurtTimer > 0 || this._rolling) return;
    if (this._onLadder || this._attackCooldown > 0) return;
    if (!this.onGround && !this._profile.canShootInAir) return;
    this._shotAnimState = this._isCrouchShooting(input) ? 'crouchShot' : 'shot';
    this._attackCooldown = FIREBALL_COOLDOWN;
    this._attackAnimTimer = 0.16;
    this._spawnProjectile(this._buildFireballProjectile(input));
  },

/** Builds fireball Projectile. @param {*} input - Current input state. @returns {*} - Resulting value. */
  _buildFireballProjectile(input) {
    const dir = this.facingRight ? 1 : -1;
    const shotY = this._isCrouchShooting(input) ? this.y + this.h * 0.58 : this.y + this.h * 0.34;
    const shotX = dir > 0 ? this.x + this.w - 2 : this.x - 26;
    return new FireballProjectile(shotX, shotY, dir);
  },

/** Checks whether crouch Shooting. @param {*} input - Current input state. @returns {boolean} - Whether the check passes. */
  _isCrouchShooting(input) {
    return this.onGround && input.down;
  },
};
// #endregion