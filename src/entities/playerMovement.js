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
  const midCol   = Math.floor((player.x + player.w / 2) / ts);
  const ladderCX = midCol * ts + ts / 2;
  player.x      += (ladderCX - player.w / 2 - player.x) * Math.min(8 * dt, 1);
  player._climbMoving = false;
  if (input.up) {
    player.velY         = -CLIMB_SPEED;
    player._climbMoving = true;
  } else if (input.down) {
    player.velY         =  CLIMB_SPEED;
    player._climbMoving = true;
  } else {
    player.velY = 0;
  }
  player.velX = 0;
  player.y   += player.velY * dt;
  const probeY    = player.y + player.h;
  const bottomRow = Math.floor(probeY / ts);
  const col       = Math.floor((player.x + player.w / 2) / ts);
  if (player.velY >= 0 && tileMap.isSolid(col, bottomRow)) {
    player.y        = bottomRow * ts - player.h;
    player.velY     = 0;
    player.onGround = true;
    exitLadder(player);
    return;
  }
  const topRow = Math.floor(player.y / ts);
  if (player.velY < 0 && !tileMap.isLadder(col, topRow)) {
    player.y    = (topRow + 1) * ts - player.h;
    player.velY = 0;
    if (tileMap.isSolid(col, topRow)) {
      player.y = topRow * ts - player.h;
    }
    player.onGround            = true;
    player._atLadderTop        = true;
    player._ladderExitCooldown = 0.15;
    exitLadder(player);
  }
}

/**
 * Detects whether the player is hanging on a wall and sets `_wallGrabSide`.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 * @param {object} input
 */
export function detectWallGrab(player, tileMap, input) {
  if (player.onGround) {
    player._wallGrabSide = 0;
    return;
  }
  const ts = TILE_SIZE;
  if (input.right && player._wallGrabSide !== -1 && player._wallLockSide !== 1) {
    const checkCol  = Math.floor((player.x + player.w) / ts);
    const topRow    = Math.floor(player.y / ts);
    const bottomRow = Math.floor((player.y + player.h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        player._wallGrabSide = 1;
        player._wallLockSide = 0;
        player.facingRight   = true;
        return;
      }
    }
  }
  if (input.left && player._wallGrabSide !== 1 && player._wallLockSide !== -1) {
    const checkCol  = Math.floor((player.x - 1) / ts);
    const topRow    = Math.floor(player.y / ts);
    const bottomRow = Math.floor((player.y + player.h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        player._wallGrabSide = -1;
        player._wallLockSide = 0;
        player.facingRight   = false;
        return;
      }
    }
  }
  if (player._wallGrabSide !== 0) {
    const stillTouch = isAgainstWall(player, tileMap, player._wallGrabSide);
    const stillPress = (player._wallGrabSide > 0 && input.right) ||
                       (player._wallGrabSide < 0 && input.left);
    if (!stillTouch || !stillPress) player._wallGrabSide = 0;
  }
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
  player.velX = 0;
  if (player.velY < 0) player.velY = 0;
  player.velY = Math.min(player.velY + WALL_SLIDE_GRAVITY * dt, WALL_SLIDE_MAX_SPEED);
  const wasGrounded = player.onGround;
  player.onGround   = false;
  player._prevFeetY = player.y + player.h;
  player.y         += player.velY * dt;
  resolveY(player, tileMap);
  if (!wasGrounded && player.onGround) {
    spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
    player._wallLockSide = 0;
    player._wallGrabSide = 0;
    return;
  }
  if (player._jumpBuffer > 0) {
    const jumpDir           = -player._wallGrabSide;
    player.velX             = jumpDir * WALL_JUMP_X;
    player.velY             = WALL_JUMP_Y;
    player.facingRight      = jumpDir > 0;
    player._wallLockSide    = player._wallGrabSide;
    player._wallPushOffTimer = 0.10;
    player._wallGrabSide    = 0;
    player._jumpBuffer      = 0;
    spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h / 2, 4);
  }
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
  if (player._jumpBuffer > 0 && player.onGround) {
    player.velY        = JUMP_FORCE;
    player.onGround    = false;
    player._jumpBuffer = 0;
    spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
    exitRoll(player);
    return;
  }
  player._rollSpeed = Math.max(0, player._rollSpeed - ROLL_FRICTION * dt);
  if (player._rollSpeed < ROLL_MIN_SPEED) {
    exitRoll(player);
    return;
  }
  if (player.onGround && player._rollSpeed > ROLL_SPEED_INIT * 0.4) {
    if (Math.random() < 0.25) {
      spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 1);
    }
  }
  player.velX = player._rollDir * player._rollSpeed;
  player.x   += player.velX * dt;
  resolveX(player, tileMap);
  if (player.velX === 0) {
    exitRoll(player);
    return;
  }
  player.velY = Math.min(player.velY + GRAVITY * dt, MAX_FALL_SPEED);
  const wasGrounded  = player.onGround;
  player.onGround    = false;
  player._prevFeetY  = player.y + player.h;
  player.y          += player.velY * dt;
  resolveY(player, tileMap);
  if (!wasGrounded && player.onGround) {
    spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
    player._wallLockSide = 0;
  }
}
// #endregion