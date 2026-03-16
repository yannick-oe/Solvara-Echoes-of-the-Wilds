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
/**
 * Handles update anim.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 * @param {object} input Input parameter.
 * @param {string} lookUpOverride Input parameter.
 */
export function updateAnim(player, dt, input, lookUpOverride = false) {
  const FALL_THRESHOLD = 60;
  const animTable = player._animDefs;
  if (player._wallPushOffTimer > 0 && player._wallGrabSide === 0) {
    if (player.state !== 'wallGrab') {
      player.state      = 'wallGrab';
      player.frameIndex = 1;
      player.frameTimer = 0;
    }
    return;
  }
  let next;
  if (player._hurtTimer > 0) {
    next = 'hurt';
  } else if (player._wallGrabSide !== 0) {
    next = 'wallGrab';
  } else if (player._onLadder) {
    next = 'climb';
  } else if (player._rolling) {
    next = 'roll';
  } else if (player._attackAnimTimer > 0) {
    next = player._shotAnimState ?? 'shot';
  } else if (!player.onGround) {
    next = player.velY < FALL_THRESHOLD ? 'jump' : 'fall';
  } else if (input.down) {
    next = 'crouch';
  } else if (lookUpOverride) {
    next = 'lookUp';
  } else if (player.velX !== 0) {
    next = 'run';
  } else {
    next = 'idle';
  }
  if (next === 'climb' && !player._climbMoving) {
    if (player.state !== 'climb') {
      player.state      = 'climb';
      player.frameIndex = 0;
      player.frameTimer = 0;
    }
    return;
  }
  if (next !== player.state) {
    player.state      = next;
    player.frameIndex = 0;
    player.frameTimer = 0;
    return;
  }
  const anim = animTable[player.state] ?? FALLBACK_ANIM;
  if (anim.fps === 0) return;
  player.frameTimer += dt;
  const frameDuration = 1 / anim.fps;
  if (player.frameTimer >= frameDuration) {
    player.frameTimer -= frameDuration;
    player.frameIndex  = (player.frameIndex + 1) % anim.frames;
  }
}
// #endregion