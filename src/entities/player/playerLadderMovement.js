import { TILE_SIZE } from '../../core/constants.js';
import { CLIMB_SPEED } from '../../config/playerConfig.js';
import { exitRoll } from './playerRollMovement.js';

/** Handles enter Ladder. @param {*} player - Player value. @returns {void} - Nothing. */
export function enterLadder(player) {
  player._onLadder = true;
  player._atLadderTop = false;
  player._wallGrabSide = 0;
  player.velX = 0;
  player.velY = 0;
  exitRoll(player);
}

/** Handles exit Ladder. @param {*} player - Player value. @returns {void} - Nothing. */
export function exitLadder(player) {
  player._onLadder = false;
  player._climbMoving = false;
}

/** Handles ladder. @param {*} player - Player value. @param {*} dt - Frame delta time. @param {*} input - Current input state. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
export function handleLadder(player, dt, input, tileMap) {
  snapPlayerToLadderCenter(player, dt);
  applyLadderInput(player, input);
  player.velX = 0;
  player.y += player.velY * dt;
  if (tryExitLadderAtBottom(player, tileMap)) return;
  tryExitLadderAtTop(player, tileMap);
}

/** Handles snap Player To Ladder Center. @param {*} player - Player value. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
function snapPlayerToLadderCenter(player, dt) {
  const midCol = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const ladderCX = midCol * TILE_SIZE + TILE_SIZE / 2;
  player.x += (ladderCX - player.w / 2 - player.x) * Math.min(8 * dt, 1);
}

/** Applies ladder Input. @param {*} player - Player value. @param {*} input - Current input state. @returns {*} - Resulting value. */
function applyLadderInput(player, input) {
  player._climbMoving = false;
  if (input.up) return setLadderVelocity(player, -CLIMB_SPEED);
  if (input.down) return setLadderVelocity(player, CLIMB_SPEED);
  player.velY = 0;
}

/** Sets ladder Velocity. @param {*} player - Player value. @param {*} velY - Vel Y value. @returns {void} - Nothing. */
function setLadderVelocity(player, velY) {
  player.velY = velY;
  player._climbMoving = true;
}

/** Handles try Exit Ladder At Bottom. @param {*} player - Player value. @param {*} tileMap - Current tile map. @returns {boolean} - Whether the check passes. */
function tryExitLadderAtBottom(player, tileMap) {
  const col = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const row = Math.floor((player.y + player.h) / TILE_SIZE);
  if (player.velY < 0 || !tileMap.isSolid(col, row)) return false;
  player.y = row * TILE_SIZE - player.h;
  player.velY = 0;
  player.onGround = true;
  exitLadder(player);
  return true;
}

/** Handles try Exit Ladder At Top. @param {*} player - Player value. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
function tryExitLadderAtTop(player, tileMap) {
  const col = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const row = Math.floor(player.y / TILE_SIZE);
  if (player.velY >= 0 || tileMap.isLadder(col, row)) return;
  player.y = (row + 1) * TILE_SIZE - player.h;
  if (tileMap.isSolid(col, row)) player.y = row * TILE_SIZE - player.h;
  player.velY = 0;
  player.onGround = true;
  player._atLadderTop = true;
  player._ladderExitCooldown = 0.15;
  exitLadder(player);
}
