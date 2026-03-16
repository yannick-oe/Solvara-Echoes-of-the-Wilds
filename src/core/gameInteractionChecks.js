// #region Imports
import {
  checkStomp,
  checkRollKill,
  checkProjectileHits,
  checkPickups,
  checkInteractables,
  checkHazards,
  checkEnemyDamage,
} from './collisionManager.js';
import { handlePlayerDeath, startVictorySequence } from './gameLifecycle.js';

// #endregion

// #region Public Methods
/**
 * Runs all interaction and collision checks for the current playing frame.
 * @param {object} game Input parameter.
 */
export function runInteractionChecks(game) {
  checkStomp({
    player: game._player,
    enemies: game._enemies,
    effects: game._effects,
  });

  checkRollKill({
    player: game._player,
    enemies: game._enemies,
    effects: game._effects,
  });

  checkProjectileHits({
    projectiles: game._projectiles,
    enemies: game._enemies,
    effects: game._effects,
  });

  if (game._player.dying) return;

  checkEnemyDamage({
    player: game._player,
    enemies: game._enemies,
    gameState: game.gameState,
    hud: game._hud,
    camera: game._camera,
    onDeath: () => handlePlayerDeath(game),
  });

  checkPickups({
    player: game._player,
    pickups: game._pickups,
    gameState: game.gameState,
    hud: game._hud,
    camera: game._camera,
  });

  if (game._victoryPoseTimer <= 0) {
    checkInteractables({
      player: game._player,
      interactables: game._interactables,
      onVictory: () => startVictorySequence(game),
    });
  }

  checkHazards({
    player: game._player,
    hazards: game._hazards,
    gameState: game.gameState,
    hud: game._hud,
    camera: game._camera,
    onDeath: () => handlePlayerDeath(game),
  });
}
// #endregion