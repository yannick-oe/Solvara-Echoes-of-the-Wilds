/**
 * Movement handlers for wall grab, ladder, and roll attack.
 * All functions operate directly on the player object.
 * @module playerMovement
 */

// #region Imports
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED, JUMP_FORCE } from '../core/constants.js';
import {

  ROLL_SPEED_INIT, ROLL_FRICTION, ROLL_MIN_SPEED,
  WALL_SLIDE_GRAVITY, WALL_SLIDE_MAX_SPEED, WALL_JUMP_X, WALL_JUMP_Y,
  CLIMB_SPEED,
} from '../config/playerConfig.js';
import { audioManager } from '../core/audioManager.js';
import { SFX_VOLUME }   from '../config/audioConfig.js';
import { resolveX, resolveY } from './playerPhysics.js';
import { spawnDust } from './playerDust.js';
// #endregion

// #region Public Methods
/**
 * Handles enter ladder.
 * @param {object} player Input parameter.
 */
export function enterLadder(player) {
  player._onLadder     = true;
  player._atLadderTop  = false;
  player._wallGrabSide = 0;
  player.velX          = 0;
  player.velY          = 0;
  exitRoll(player);
}

/**
 * Exits ladder mode for the player.
 * @param {object} player Input parameter.
 */
export function exitLadder(player) {
  player._onLadder    = false;
  player._climbMoving = false;
}

/**
 * Updates ladder movement.
 * @param {import('./player.js').Player} player
 * @param {number} dt
 * @param {object} input
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function handleLadder(player, dt, input, tileMap) {
  const ts = TILE_SIZE;
  snapPlayerToLadderCenter(player, dt, ts);
  applyLadderInput(player, input);
  player.velX = 0;
  player.y += player.velY * dt;
  if (tryExitLadderAtBottom(player, tileMap, ts)) return;
  tryExitLadderAtTop(player, tileMap, ts);
}

/**
 * Detects whether the player is hanging on a wall and sets `_wallGrabSide`.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 * @param {object} input
 */
export function detectWallGrab(player, tileMap, input) {
  if (player.onGround) return clearWallGrab(player);
  if (tryGrabRightWall(player, tileMap, input)) return;
  if (tryGrabLeftWall(player, tileMap, input)) return;
  clearWallGrabIfReleased(player, tileMap, input);
}

/**
 * Checks whether the player is touching the specified wall side.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 * @param {number} side - +1 right, -1 left
 */
export function isAgainstWall(player, tileMap, side) {
  const ts       = TILE_SIZE;
  const checkCol = side > 0
    ? Math.floor((player.x + player.w) / ts)
    : Math.floor((player.x - 1) / ts);
  const topRow    = Math.floor(player.y / ts);
  const bottomRow = Math.floor((player.y + player.h - 1) / ts);
  for (let row = topRow; row <= bottomRow; row++) {
    if (tileMap.isSolid(checkCol, row)) return true;
  }
  return false;
}

/**
 * Handles the wall-grab state (slide + wall jump).
 * @param {import('./player.js').Player} player
 * @param {number} dt
 * @param {object} input
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function handleWallGrab(player, dt, input, tileMap) {
  applyWallSlideVelocity(player, dt);
  const wasGrounded = stepWallSlide(player, dt, tileMap);
  if (landedFromWallSlide(player, wasGrounded)) return;
  applyWallJumpIfBuffered(player);
}

/**
 * Starts player roll state and roll audio.
 * @param {object} player Input parameter.
 * @param {number} dir Input parameter.
 */
export function startRoll(player, dir) {
  player._rolling         = true;
  player._rollDir         = dir;
  player._rollSpeed       = ROLL_SPEED_INIT;
  player._rollChargeTimer = 0;
  player.facingRight      = dir > 0;
  audioManager.playLoopedSfx('roll', 'assets/audio/sfx/rollSound.mp3', { volume: SFX_VOLUME.roll });
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 6);
}

/**
 * Exits player roll state and stops roll audio.
 * @param {object} player Input parameter.
 */
export function exitRoll(player) {
  player._rolling         = false;
  player._rollSpeed       = 0;
  player._rollDir         = 0;
  player._rollChargeTimer = 0;
  audioManager.stopLoopedSfx('roll');
}

/**
 * Updates roll movement.
 * @param {import('./player.js').Player} player
 * @param {number} dt
 * @param {object} input
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function handleRoll(player, dt, input, tileMap) {
  if (tryRollJump(player)) return;
  if (!tickRollSpeed(player, dt)) return;
  maybeSpawnRollTrail(player);
  if (!stepRollX(player, dt, tileMap)) return;
  stepRollY(player, dt, tileMap);
}

/**
 * Snaps player horizontally to ladder center.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 * @param {number} ts Input parameter.
 */
function snapPlayerToLadderCenter(player, dt, ts) {
  const midCol = Math.floor((player.x + player.w / 2) / ts);
  const ladderCX = midCol * ts + ts / 2;
  player.x += (ladderCX - player.w / 2 - player.x) * Math.min(8 * dt, 1);
}

/**
 * Applies vertical ladder input.
 * @param {object} player Input parameter.
 * @param {object} input Input parameter.
 */
function applyLadderInput(player, input) {
  player._climbMoving = false;
  if (input.up) return setLadderVelocity(player, -CLIMB_SPEED);
  if (input.down) return setLadderVelocity(player, CLIMB_SPEED);
  player.velY = 0;
}

/**
 * Sets ladder climb velocity and movement flag.
 * @param {object} player Input parameter.
 * @param {number} velY Input parameter.
 */
function setLadderVelocity(player, velY) {
  player.velY = velY;
  player._climbMoving = true;
}

/**
 * Tries to exit ladder at solid floor.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} ts Input parameter.
 */
function tryExitLadderAtBottom(player, tileMap, ts) {
  const col = Math.floor((player.x + player.w / 2) / ts);
  const bottomRow = Math.floor((player.y + player.h) / ts);
  if (player.velY < 0 || !tileMap.isSolid(col, bottomRow)) return false;
  player.y = bottomRow * ts - player.h;
  player.velY = 0;
  player.onGround = true;
  exitLadder(player);
  return true;
}

/**
 * Tries to exit ladder at top end.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} ts Input parameter.
 */
function tryExitLadderAtTop(player, tileMap, ts) {
  const col = Math.floor((player.x + player.w / 2) / ts);
  const topRow = Math.floor(player.y / ts);
  if (player.velY >= 0 || tileMap.isLadder(col, topRow)) return;
  player.y = (topRow + 1) * ts - player.h;
  if (tileMap.isSolid(col, topRow)) player.y = topRow * ts - player.h;
  player.velY = 0;
  player.onGround = true;
  player._atLadderTop = true;
  player._ladderExitCooldown = 0.15;
  exitLadder(player);
}

/**
 * Clears wall grab state.
 * @param {object} player Input parameter.
 */
function clearWallGrab(player) {
  player._wallGrabSide = 0;
}

/**
 * Tries grabbing right wall.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {object} input Input parameter.
 */
function tryGrabRightWall(player, tileMap, input) {
  if (!input.right || player._wallGrabSide === -1 || player._wallLockSide === 1) return false;
  return tryGrabWallSide(player, tileMap, 1);
}

/**
 * Tries grabbing left wall.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {object} input Input parameter.
 */
function tryGrabLeftWall(player, tileMap, input) {
  if (!input.left || player._wallGrabSide === 1 || player._wallLockSide === -1) return false;
  return tryGrabWallSide(player, tileMap, -1);
}

/**
 * Attempts wall grab on one side.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} side Input parameter.
 */
function tryGrabWallSide(player, tileMap, side) {
  if (!isAgainstWall(player, tileMap, side)) return false;
  player._wallGrabSide = side;
  player._wallLockSide = 0;
  player.facingRight = side > 0;
  return true;
}

/**
 * Clears wall grab when no longer touching or pressing.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {object} input Input parameter.
 */
function clearWallGrabIfReleased(player, tileMap, input) {
  if (player._wallGrabSide === 0) return;
  const stillTouch = isAgainstWall(player, tileMap, player._wallGrabSide);
  const stillPress = player._wallGrabSide > 0 ? input.right : input.left;
  if (!stillTouch || !stillPress) player._wallGrabSide = 0;
}

/**
 * Applies wall-slide gravity and horizontal lock.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 */
function applyWallSlideVelocity(player, dt) {
  player.velX = 0;
  if (player.velY < 0) player.velY = 0;
  player.velY = Math.min(player.velY + WALL_SLIDE_GRAVITY * dt, WALL_SLIDE_MAX_SPEED);
}

/**
 * Steps wall-slide motion and resolves vertical collisions.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 * @param {object} tileMap Input parameter.
 */
function stepWallSlide(player, dt, tileMap) {
  const wasGrounded = player.onGround;
  player.onGround = false;
  player._prevFeetY = player.y + player.h;
  player.y += player.velY * dt;
  resolveY(player, tileMap);
  return wasGrounded;
}

/**
 * Handles landing result from wall slide.
 * @param {object} player Input parameter.
 * @param {boolean} wasGrounded Input parameter.
 */
function landedFromWallSlide(player, wasGrounded) {
  if (wasGrounded || !player.onGround) return false;
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  player._wallLockSide = 0;
  player._wallGrabSide = 0;
  return true;
}

/**
 * Applies buffered wall jump from grab state.
 * @param {object} player Input parameter.
 */
function applyWallJumpIfBuffered(player) {
  if (player._jumpBuffer <= 0) return;
  const jumpDir = -player._wallGrabSide;
  player.velX = jumpDir * WALL_JUMP_X;
  player.velY = WALL_JUMP_Y;
  player.facingRight = jumpDir > 0;
  player._wallLockSide = player._wallGrabSide;
  player._wallPushOffTimer = 0.10;
  player._wallGrabSide = 0;
  player._jumpBuffer = 0;
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h / 2, 4);
}

/**
 * Tries jump cancel from rolling state.
 * @param {object} player Input parameter.
 */
function tryRollJump(player) {
  if (player._jumpBuffer <= 0 || !player.onGround) return false;
  player.velY = JUMP_FORCE;
  player.onGround = false;
  player._jumpBuffer = 0;
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  exitRoll(player);
  return true;
}

/**
 * Updates roll speed and exits when too slow.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 */
function tickRollSpeed(player, dt) {
  player._rollSpeed = Math.max(0, player._rollSpeed - ROLL_FRICTION * dt);
  if (player._rollSpeed >= ROLL_MIN_SPEED) return true;
  exitRoll(player);
  return false;
}

/**
 * Spawns occasional dust trail while fast rolling.
 * @param {object} player Input parameter.
 */
function maybeSpawnRollTrail(player) {
  if (!player.onGround || player._rollSpeed <= ROLL_SPEED_INIT * 0.4) return;
  if (Math.random() < 0.25) spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 1);
}

/**
 * Steps roll horizontal movement and resolves wall collision.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 * @param {object} tileMap Input parameter.
 */
function stepRollX(player, dt, tileMap) {
  player.velX = player._rollDir * player._rollSpeed;
  player.x += player.velX * dt;
  resolveX(player, tileMap);
  if (player.velX !== 0) return true;
  exitRoll(player);
  return false;
}

/**
 * Steps roll vertical movement and resolves landing.
 * @param {object} player Input parameter.
 * @param {number} dt Input parameter.
 * @param {object} tileMap Input parameter.
 */
function stepRollY(player, dt, tileMap) {
  player.velY = Math.min(player.velY + GRAVITY * dt, MAX_FALL_SPEED);
  const wasGrounded = player.onGround;
  player.onGround = false;
  player._prevFeetY = player.y + player.h;
  player.y += player.velY * dt;
  resolveY(player, tileMap);
  if (!wasGrounded && player.onGround) resetAfterRollLanding(player);
}

/**
 * Resets wall lock and spawns landing dust after roll landing.
 * @param {object} player Input parameter.
 */
function resetAfterRollLanding(player) {
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  player._wallLockSide = 0;
}
// #endregion