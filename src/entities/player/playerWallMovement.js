import { TILE_SIZE } from '../../core/constants.js';
import { WALL_SLIDE_GRAVITY, WALL_SLIDE_MAX_SPEED, WALL_JUMP_X, WALL_JUMP_Y } from '../../config/playerConfig.js';
import { resolveY } from './playerPhysics.js';
import { spawnDust } from './playerDust.js';

export function detectWallGrab(player, tileMap, input) {
  if (player.onGround) return clearWallGrab(player);
  if (tryGrabRightWall(player, tileMap, input)) return;
  if (tryGrabLeftWall(player, tileMap, input)) return;
  clearWallGrabIfReleased(player, tileMap, input);
}

export function isAgainstWall(player, tileMap, side) {
  const col = side > 0
    ? Math.floor((player.x + player.w) / TILE_SIZE)
    : Math.floor((player.x - 1) / TILE_SIZE);
  const topRow = Math.floor(player.y / TILE_SIZE);
  const bottomRow = Math.floor((player.y + player.h - 1) / TILE_SIZE);
  for (let row = topRow; row <= bottomRow; row++) if (tileMap.isSolid(col, row)) return true;
  return false;
}

export function handleWallGrab(player, dt, input, tileMap) {
  applyWallSlideVelocity(player, dt);
  const wasGrounded = stepWallSlide(player, dt, tileMap);
  if (landedFromWallSlide(player, wasGrounded)) return;
  applyWallJumpIfBuffered(player);
}

function clearWallGrab(player) {
  player._wallGrabSide = 0;
}

function tryGrabRightWall(player, tileMap, input) {
  if (!input.right || player._wallGrabSide === -1 || player._wallLockSide === 1) return false;
  return tryGrabWallSide(player, tileMap, 1);
}

function tryGrabLeftWall(player, tileMap, input) {
  if (!input.left || player._wallGrabSide === 1 || player._wallLockSide === -1) return false;
  return tryGrabWallSide(player, tileMap, -1);
}

function tryGrabWallSide(player, tileMap, side) {
  if (!isAgainstWall(player, tileMap, side)) return false;
  player._wallGrabSide = side;
  player._wallLockSide = 0;
  player.facingRight = side > 0;
  return true;
}

function clearWallGrabIfReleased(player, tileMap, input) {
  if (player._wallGrabSide === 0) return;
  const stillTouch = isAgainstWall(player, tileMap, player._wallGrabSide);
  const stillPress = player._wallGrabSide > 0 ? input.right : input.left;
  if (!stillTouch || !stillPress) player._wallGrabSide = 0;
}

function applyWallSlideVelocity(player, dt) {
  player.velX = 0;
  if (player.velY < 0) player.velY = 0;
  player.velY = Math.min(player.velY + WALL_SLIDE_GRAVITY * dt, WALL_SLIDE_MAX_SPEED);
}

function stepWallSlide(player, dt, tileMap) {
  const wasGrounded = player.onGround;
  player.onGround = false;
  player._prevFeetY = player.y + player.h;
  player.y += player.velY * dt;
  resolveY(player, tileMap);
  return wasGrounded;
}

function landedFromWallSlide(player, wasGrounded) {
  if (wasGrounded || !player.onGround) return false;
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  player._wallLockSide = 0;
  player._wallGrabSide = 0;
  return true;
}

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
