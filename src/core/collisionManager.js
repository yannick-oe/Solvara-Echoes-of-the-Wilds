// #region Imports
import { CeilingSpike } from '../entities/hazards/ceilingSpike.js';
import { Switch }       from '../entities/interactables/switch.js';
import { Door }         from '../entities/interactables/door.js';
import { StarCoin }     from '../entities/pickups/starCoin.js';
import { Gem }          from '../entities/pickups/gem.js';
import { Cherry }       from '../entities/pickups/cherry.js';
import { DeathEffect }  from '../entities/effects/deathEffect.js';
import { audioManager } from './audioManager.js';
import { SFX_VOLUME }   from '../config/audioConfig.js';
// #endregion

// #region Public Methods
/** Checks stomp. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkStomp({ player, enemies, effects }) {
  if (player.velY <= 0) return;
  for (const enemy of enemies) {
    if (!canStompEnemy(player, enemy)) continue;
    killEnemy(enemy, effects);
    player.velY = -400;
  }
}

/** Checks roll Kill. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkRollKill({ player, enemies, effects }) {
  if (!player.isRolling()) return;
  for (const enemy of enemies) {
    if (!isActiveEnemy(enemy) || !player.intersects(enemy)) continue;
    killEnemy(enemy, effects);
    player.rollHit();
  }
}

/** Checks projectile Hits. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkProjectileHits({ projectiles, enemies, effects }) {
  for (const projectile of projectiles) {
    if (!projectile.active) continue;
    if (_applyProjectileHit(projectile, enemies, effects)) projectile.deactivate?.();
  }
}

/** Checks pickups. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkPickups({ player, pickups, gameState, hud, camera }) {
  for (const pickup of pickups) {
    if (!pickup.active || !player.intersects(pickup)) continue;
    pickup.collect(player, gameState);
    notifyPickup(pickup, hud, camera);
  }
}

/** Checks interactables. @param {object} param1 - Destructured parameter. @returns {boolean} - Whether the check passes. */
export function checkInteractables({ player, interactables, onVictory }) {
  for (const obj of interactables) {
    if (_handleSwitchInteract(player, obj)) continue;
    if (_handleDoorInteract(player, obj, onVictory)) return true;
  }
  return false;
}

/** Checks hazards. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkHazards({ player, hazards, gameState, hud, camera, onDeath }) {
  for (const hz of hazards) {
    if (!hz.active) continue;
    const lethal = hz instanceof CeilingSpike ? hz.isLethal : true;
    if (lethal && player.intersects(hz)) {
      gameState.hearts = 0;
      hud.notify('damage', player.x + player.w / 2 - camera.x, player.y - camera.y);
      onDeath?.();
      return;
    }
  }
}

/** Checks enemy Damage. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
export function checkEnemyDamage({ player, enemies, gameState, hud, camera, onDeath }) {
  if (player.dying || player.isRolling()) return;
  for (const enemy of enemies) {
    if (!shouldEnemyDealDamage(player, enemy)) continue;
    if (!applyEnemyDamage(player, enemy, gameState, hud, camera, onDeath)) break;
    break;
  }
}

/** Checks whether active Enemy. @param {*} enemy - Enemy value. @returns {boolean} - Whether the check passes. */
function isActiveEnemy(enemy) {
  return enemy.active && !enemy.dead;
}

/** Checks whether stomp Enemy. @param {*} player - Player value. @param {*} enemy - Enemy value. @returns {boolean} - Whether the check passes. */
function canStompEnemy(player, enemy) {
  if (!isActiveEnemy(enemy)) return false;
  if (!player.intersects(enemy)) return false;
  return player.y + player.h <= enemy.y + enemy.h / 3;
}

/** Handles kill Enemy. @param {*} enemy - Enemy value. @param {*} effects - Effects value. @returns {void} - Nothing. */
function killEnemy(enemy, effects) {
  enemy.stompDie();
  if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
  effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
}

/** Notifies pickup. @param {*} pickup - Pickup value. @param {*} hud - Current HUD instance. @param {*} camera - Current camera instance. @returns {*} - Resulting value. */
function notifyPickup(pickup, hud, camera) {
  const sx = pickup.x + pickup.w / 2 - camera.x;
  const sy = pickup.y + pickup.h / 2 - camera.y;
  if (pickup instanceof StarCoin) return notifyStarCoin(pickup, hud, sx, sy);
  if (pickup instanceof Gem) return notifyGem(hud, sx, sy);
  if (pickup instanceof Cherry) notifyCherry(hud, sx, sy);
}

/** Handles switch Interact. @param {*} player - Player value. @param {*} obj - Obj value. @returns {boolean} - Whether the check passes. */
function _handleSwitchInteract(player, obj) {
  if (!(obj instanceof Switch)) return false;
  if (player.intersects(obj) && obj.activate()) {
    audioManager.playSfx('assets/audio/sfx/switchSound.mp3', { volume: SFX_VOLUME.switch });
  }
  return true;
}

/** Handles door Interact. @param {*} player - Player value. @param {*} obj - Obj value. @param {*} onVictory - On Victory value. @returns {boolean} - Whether the check passes. */
function _handleDoorInteract(player, obj, onVictory) {
  if (!(obj instanceof Door)) return false;
  if (!obj.isOpen || !player.intersects(obj)) return false;
  onVictory?.();
  return true;
}

/** Notifies star Coin. @param {*} pickup - Pickup value. @param {*} hud - Current HUD instance. @param {*} sx - Sx value. @param {*} sy - Sy value. @returns {void} - Nothing. */
function notifyStarCoin(pickup, hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupStarCoin.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('starCoin', sx, sy, pickup.slotIndex);
}

/** Notifies gem. @param {*} hud - Current HUD instance. @param {*} sx - Sx value. @param {*} sy - Sy value. @returns {void} - Nothing. */
function notifyGem(hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupGem.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('gem', sx, sy);
}

/** Notifies cherry. @param {*} hud - Current HUD instance. @param {*} sx - Sx value. @param {*} sy - Sy value. @returns {void} - Nothing. */
function notifyCherry(hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupCherry.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('heal', sx, sy);
}

/** Checks whether enemy Deal Damage. @param {*} player - Player value. @param {*} enemy - Enemy value. @returns {boolean} - Whether the check passes. */
function shouldEnemyDealDamage(player, enemy) {
  if (!isActiveEnemy(enemy) || !player.intersects(enemy)) return false;
  return !(player.velY > 0 && player.y + player.h <= enemy.y + enemy.h / 3);
}

/** Applies enemy Damage. @param {*} player - Player value. @param {*} enemy - Enemy value. @param {*} gameState - Current game state. @param {*} hud - Current HUD instance. @param {*} camera - Current camera instance. @param {*} onDeath - On Death value. @returns {boolean} - Whether the check passes. */
function applyEnemyDamage(player, enemy, gameState, hud, camera, onDeath) {
  if (!player.takeDamage(enemy.x + enemy.w / 2)) return false;
  gameState.hearts--;
  hud.notify('damage', player.x + player.w / 2 - camera.x, player.y - camera.y);
  if (gameState.hearts > 0) return playHurtSfx();
  gameState.hearts = 0;
  onDeath?.();
  return true;
}

/** Plays hurt Sfx. @returns {boolean} - Whether the check passes. */
function playHurtSfx() {
  audioManager.playSfx('assets/audio/sfx/hurtSound.mp3', { volume: SFX_VOLUME.hurt });
  return true;
}

/** Applies projectile Hit. @param {*} projectile - Projectile value. @param {*} enemies - Enemies value. @param {*} effects - Effects value. @returns {boolean} - Whether the check passes. */
function _applyProjectileHit(projectile, enemies, effects) {
  for (const enemy of enemies) {
    if (!isActiveEnemy(enemy) || !projectile.intersects(enemy)) continue;
    killEnemy(enemy, effects);
    return true;
  }
  return false;
}
// #endregion