// #region Constants
/**
 * Animation definitions and state machine for the player.
 * @module playerAnimation
 */

/** Default fallback animation for unknown states. */
const FALLBACK_ANIM = { prefix: 'PLAYER_IDLE', frames: 1, fps: 0 };

/**
 * Selects the next animation state and advances the frame timer.
 * @param {import('./player.js').Player} player
 * @param {number} dt
 * @param {object} input
 * @param {boolean} [lookUpOverride=false]
 */
// #endregion

// #region Public Methods
/** Updates anim. @param {*} player - Player value. @param {*} dt - Frame delta time. @param {*} input - Current input state. @param {*} lookUpOverride - Look Up Override value. @returns {void} - Nothing. */
export function updateAnim(player, dt, input, lookUpOverride = false) {
  if (_forceWallGrabDuringPushOff(player)) return;
  const next = _resolveNextAnimState(player, input, lookUpOverride);
  if (_applyStaticClimbFrame(player, next)) return;
  if (_applyAnimStateChange(player, next)) return;
  _advanceAnimFrame(player, dt);
}

/** Handles force Wall Grab During Push Off. @param {*} player - Player value. @returns {boolean} - Whether the check passes. */
function _forceWallGrabDuringPushOff(player) {
  if (!(player._wallPushOffTimer > 0 && player._wallGrabSide === 0)) return false;
  if (player.state === 'wallGrab') return true;
  player.state = 'wallGrab';
  player.frameIndex = 1;
  player.frameTimer = 0;
  return true;
}

/** Resolves next Anim State. @param {*} player - Player value. @param {*} input - Current input state. @param {*} lookUpOverride - Look Up Override value. @returns {string} - Derived text value. */
function _resolveNextAnimState(player, input, lookUpOverride) {
  const FALL_THRESHOLD = 60;
  if (player._hurtTimer > 0) return 'hurt';
  if (player._wallGrabSide !== 0) return 'wallGrab';
  if (player._onLadder) return 'climb';
  if (player._rolling) return 'roll';
  if (player._attackAnimTimer > 0) return player._shotAnimState ?? 'shot';
  if (!player.onGround) return player.velY < FALL_THRESHOLD ? 'jump' : 'fall';
  if (input.down) return 'crouch';
  if (lookUpOverride) return 'lookUp';
  if (player.velX !== 0) return 'run';
  return 'idle';
}

/** Applies static Climb Frame. @param {*} player - Player value. @param {*} next - Next value. @returns {boolean} - Whether the check passes. */
function _applyStaticClimbFrame(player, next) {
  if (!(next === 'climb' && !player._climbMoving)) return false;
  if (player.state === 'climb') return true;
  player.state = 'climb';
  player.frameIndex = 0;
  player.frameTimer = 0;
  return true;
}

/** Applies anim State Change. @param {*} player - Player value. @param {*} next - Next value. @returns {boolean} - Whether the check passes. */
function _applyAnimStateChange(player, next) {
  if (next === player.state) return false;
  player.state = next;
  player.frameIndex = 0;
  player.frameTimer = 0;
  return true;
}

/** Handles advance Anim Frame. @param {*} player - Player value. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
function _advanceAnimFrame(player, dt) {
  const anim = player._animDefs[player.state] ?? FALLBACK_ANIM;
  if (anim.fps === 0) return;
  player.frameTimer += dt;
  const frameDuration = 1 / anim.fps;
  if (player.frameTimer < frameDuration) return;
  player.frameTimer -= frameDuration;
  player.frameIndex = (player.frameIndex + 1) % anim.frames;
}
// #endregion