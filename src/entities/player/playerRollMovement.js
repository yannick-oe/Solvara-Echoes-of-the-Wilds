import { GRAVITY, JUMP_FORCE, MAX_FALL_SPEED } from '../../core/constants.js';
import { ROLL_SPEED_INIT, ROLL_FRICTION, ROLL_MIN_SPEED } from '../../config/playerConfig.js';
import { audioManager } from '../../core/audioManager.js';
import { SFX_VOLUME } from '../../config/audioConfig.js';
import { resolveX, resolveY } from './playerPhysics.js';
import { spawnDust } from './playerDust.js';

export function startRoll(player, dir) {
  player._rolling = true;
  player._rollDir = dir;
  player._rollSpeed = ROLL_SPEED_INIT;
  player._rollChargeTimer = 0;
  player.facingRight = dir > 0;
  audioManager.playLoopedSfx('roll', 'assets/audio/sfx/rollSound.mp3', { volume: SFX_VOLUME.roll });
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 6);
}

export function exitRoll(player) {
  player._rolling = false;
  player._rollSpeed = 0;
  player._rollDir = 0;
  player._rollChargeTimer = 0;
  audioManager.stopLoopedSfx('roll');
}

export function handleRoll(player, dt, input, tileMap) {
  if (tryRollJump(player)) return;
  if (!tickRollSpeed(player, dt)) return;
  maybeSpawnRollTrail(player);
  if (!stepRollX(player, dt, tileMap)) return;
  stepRollY(player, dt, tileMap);
}

function tryRollJump(player) {
  if (player._jumpBuffer <= 0 || !player.onGround) return false;
  player.velY = JUMP_FORCE;
  player.onGround = false;
  player._jumpBuffer = 0;
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  exitRoll(player);
  return true;
}

function tickRollSpeed(player, dt) {
  player._rollSpeed = Math.max(0, player._rollSpeed - ROLL_FRICTION * dt);
  if (player._rollSpeed >= ROLL_MIN_SPEED) return true;
  exitRoll(player);
  return false;
}

function maybeSpawnRollTrail(player) {
  if (!player.onGround || player._rollSpeed <= ROLL_SPEED_INIT * 0.4) return;
  if (Math.random() < 0.25) spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 1);
}

function stepRollX(player, dt, tileMap) {
  player.velX = player._rollDir * player._rollSpeed;
  player.x += player.velX * dt;
  resolveX(player, tileMap);
  if (player.velX !== 0) return true;
  exitRoll(player);
  return false;
}

function stepRollY(player, dt, tileMap) {
  player.velY = Math.min(player.velY + GRAVITY * dt, MAX_FALL_SPEED);
  const wasGrounded = player.onGround;
  player.onGround = false;
  player._prevFeetY = player.y + player.h;
  player.y += player.velY * dt;
  resolveY(player, tileMap);
  if (!wasGrounded && player.onGround) resetAfterRollLanding(player);
}

function resetAfterRollLanding(player) {
  spawnDust(player._dustPool, player.x + player.w / 2, player.y + player.h, 4);
  player._wallLockSide = 0;
}
