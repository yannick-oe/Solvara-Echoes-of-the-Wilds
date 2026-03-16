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
    if (!enemy.active || enemy.dead) continue;
    const overlapX = player.x < enemy.x + enemy.w && player.x + player.w > enemy.x;
    const overlapY = player.y < enemy.y + enemy.h && player.y + player.h > enemy.y;
    if (!overlapX || !overlapY) continue;
    if (player.y + player.h > enemy.y + enemy.h / 3) continue;

    enemy.stompDie();
    if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
    effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
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
    if (!enemy.active || enemy.dead) continue;
    if (!player.intersects(enemy)) continue;
    enemy.stompDie();
    if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
    effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
    player.rollHit();
  }
}

/**
 * Checks pickup collection.
 * @param {object} ctx - { player, pickups, gameState, hud, camera }
 */
export function checkPickups({ player, pickups, gameState, hud, camera }) {
  for (const pickup of pickups) {
    if (!pickup.active) continue;
    if (!player.intersects(pickup)) continue;
    pickup.collect(player, gameState);
    const sx = pickup.x + pickup.w / 2 - camera.x;
    const sy = pickup.y + pickup.h / 2 - camera.y;
    if (pickup instanceof StarCoin) {
      audioManager.playSfx('assets/audio/sfx/pickupStarCoin.mp3', { volume: SFX_VOLUME.pickup });
      hud.notify('starCoin', sx, sy, pickup.slotIndex);
    } else if (pickup instanceof Gem) {
      audioManager.playSfx('assets/audio/sfx/pickupGem.mp3', { volume: SFX_VOLUME.pickup });
      hud.notify('gem', sx, sy);
    } else if (pickup instanceof Cherry) {
      audioManager.playSfx('assets/audio/sfx/pickupCherry.mp3', { volume: SFX_VOLUME.pickup });
      hud.notify('heal', sx, sy);
    }
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
    if (!enemy.active || enemy.dead) continue;
    if (!player.intersects(enemy)) continue;
    if (player.velY > 0 && player.y + player.h <= enemy.y + enemy.h / 3) continue;
    const tookDamage = player.takeDamage(enemy.x + enemy.w / 2);
    if (!tookDamage) break;
    gameState.hearts--;
    hud.notify('damage', player.x + player.w / 2 - camera.x, player.y - camera.y);
    if (gameState.hearts <= 0) {
      gameState.hearts = 0;
      onDeath?.();
    } else {
      audioManager.playSfx('assets/audio/sfx/hurtSound.mp3', { volume: SFX_VOLUME.hurt });
    }
    break;
  }
}
// #endregion