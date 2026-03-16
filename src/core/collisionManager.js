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
/**
 * Handles check stomp.
 * @param {object} param1 Composite input parameter.
 * @param {Array} enemies Input parameter.
 * @param {object} effects } Input parameter.
 */
export function checkStomp({ player, enemies, effects }) {
  if (player.velY <= 0) return;
  for (const enemy of enemies) {
    if (!canStompEnemy(player, enemy)) continue;
    killEnemy(enemy, effects);
    player.velY = -400;
  }
}

/**
 * Checks roll hits against enemies.
 * @param {object} ctx - { player, enemies, effects }
 */
export function checkRollKill({ player, enemies, effects }) {
  if (!player.isRolling()) return;
  for (const enemy of enemies) {
    if (!isActiveEnemy(enemy) || !player.intersects(enemy)) continue;
    killEnemy(enemy, effects);
    player.rollHit();
  }
}

/**
 * Checks projectile hits against enemies.
 * @param {object} ctx - { projectiles, enemies, effects }
 */
export function checkProjectileHits({ projectiles, enemies, effects }) {
  for (const projectile of projectiles) {
    if (!projectile.active) continue;
    if (_applyProjectileHit(projectile, enemies, effects)) projectile.deactivate?.();
  }
}

/**
 * Checks pickup collection.
 * @param {object} ctx - { player, pickups, gameState, hud, camera }
 */
export function checkPickups({ player, pickups, gameState, hud, camera }) {
  for (const pickup of pickups) {
    if (!pickup.active || !player.intersects(pickup)) continue;
    pickup.collect(player, gameState);
    notifyPickup(pickup, hud, camera);
  }
}

/**
 * Checks interactions with switches and doors.
 * @param {object} ctx - { player, interactables, onVictory }
 */
export function checkInteractables({ player, interactables, onVictory }) {
  for (const obj of interactables) {
    if (obj instanceof Switch) {
      if (player.intersects(obj) && obj.activate()) {
        audioManager.playSfx('assets/audio/sfx/switchSound.mp3', { volume: SFX_VOLUME.switch });
      }
    } else if (obj instanceof Door) {
      if (obj.isOpen && player.intersects(obj)) {
        onVictory?.();
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks collisions with hazards (lethal on contact).
 * @param {object} ctx - { player, hazards, gameState, hud, camera, onDeath }
 */
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

/**
 * Checks damage from enemy contact.
 * @param {object} ctx - { player, enemies, gameState, hud, camera, onDeath }
 */
export function checkEnemyDamage({ player, enemies, gameState, hud, camera, onDeath }) {
  if (player.dying || player.isRolling()) return;
  for (const enemy of enemies) {
    if (!shouldEnemyDealDamage(player, enemy)) continue;
    if (!applyEnemyDamage(player, enemy, gameState, hud, camera, onDeath)) break;
    break;
  }
}

/**
 * Returns whether enemy is active and alive.
 * @param {object} enemy Input parameter.
 */
function isActiveEnemy(enemy) {
  return enemy.active && !enemy.dead;
}

/**
 * Returns whether player can stomp enemy.
 * @param {object} player Input parameter.
 * @param {object} enemy Input parameter.
 */
function canStompEnemy(player, enemy) {
  if (!isActiveEnemy(enemy)) return false;
  if (!player.intersects(enemy)) return false;
  return player.y + player.h <= enemy.y + enemy.h / 3;
}

/**
 * Kills enemy, plays sound, and spawns death effect.
 * @param {object} enemy Input parameter.
 * @param {Array} effects Input parameter.
 */
function killEnemy(enemy, effects) {
  enemy.stompDie();
  if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
  effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
}

/**
 * Sends pickup feedback and audio.
 * @param {object} pickup Input parameter.
 * @param {object} hud Input parameter.
 * @param {object} camera Input parameter.
 */
function notifyPickup(pickup, hud, camera) {
  const sx = pickup.x + pickup.w / 2 - camera.x;
  const sy = pickup.y + pickup.h / 2 - camera.y;
  if (pickup instanceof StarCoin) return notifyStarCoin(pickup, hud, sx, sy);
  if (pickup instanceof Gem) return notifyGem(hud, sx, sy);
  if (pickup instanceof Cherry) notifyCherry(hud, sx, sy);
}

/**
 * Sends star coin pickup feedback.
 * @param {object} pickup Input parameter.
 * @param {object} hud Input parameter.
 * @param {number} sx Input parameter.
 * @param {number} sy Input parameter.
 */
function notifyStarCoin(pickup, hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupStarCoin.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('starCoin', sx, sy, pickup.slotIndex);
}

/**
 * Sends gem pickup feedback.
 * @param {object} hud Input parameter.
 * @param {number} sx Input parameter.
 * @param {number} sy Input parameter.
 */
function notifyGem(hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupGem.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('gem', sx, sy);
}

/**
 * Sends cherry pickup feedback.
 * @param {object} hud Input parameter.
 * @param {number} sx Input parameter.
 * @param {number} sy Input parameter.
 */
function notifyCherry(hud, sx, sy) {
  audioManager.playSfx('assets/audio/sfx/pickupCherry.mp3', { volume: SFX_VOLUME.pickup });
  hud.notify('heal', sx, sy);
}

/**
 * Returns whether enemy should damage player.
 * @param {object} player Input parameter.
 * @param {object} enemy Input parameter.
 */
function shouldEnemyDealDamage(player, enemy) {
  if (!isActiveEnemy(enemy) || !player.intersects(enemy)) return false;
  return !(player.velY > 0 && player.y + player.h <= enemy.y + enemy.h / 3);
}

/**
 * Applies enemy contact damage and feedback.
 * @param {object} player Input parameter.
 * @param {object} enemy Input parameter.
 * @param {object} gameState Input parameter.
 * @param {object} hud Input parameter.
 * @param {object} camera Input parameter.
 * @param {Function} onDeath Input parameter.
 */
function applyEnemyDamage(player, enemy, gameState, hud, camera, onDeath) {
  if (!player.takeDamage(enemy.x + enemy.w / 2)) return false;
  gameState.hearts--;
  hud.notify('damage', player.x + player.w / 2 - camera.x, player.y - camera.y);
  if (gameState.hearts > 0) return playHurtSfx();
  gameState.hearts = 0;
  onDeath?.();
  return true;
}

/**
 * Plays hurt sound and returns continue flag.
 */
function playHurtSfx() {
  audioManager.playSfx('assets/audio/sfx/hurtSound.mp3', { volume: SFX_VOLUME.hurt });
  return true;
}

/**
 * Applies a projectile hit to the first intersecting active enemy.
 * @param {object} projectile Input parameter.
 * @param {Array} enemies Input parameter.
 * @param {Array} effects Input parameter.
 */
function _applyProjectileHit(projectile, enemies, effects) {
  for (const enemy of enemies) {
    if (!isActiveEnemy(enemy) || !projectile.intersects(enemy)) continue;
    killEnemy(enemy, effects);
    return true;
  }
  return false;
}
// #endregion