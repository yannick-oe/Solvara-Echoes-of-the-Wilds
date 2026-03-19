// #region Imports
import {
  checkStomp,
  checkRollKill,
  checkProjectileHits,
  checkPickups,
  checkInteractables,
  checkHazards,
  checkEnemyDamage,
} from '../collisionManager.js';
import { handlePlayerDeath, startVictorySequence } from './gameLifecycle.js';

// #endregion

// #region Public Methods
/**
 * Runs all interaction and collision checks for the current playing frame.
 * @param {object} game Input parameter.
 */
export function runInteractionChecks(game) {
  _runPreDamageChecks(game);
  if (game._player.dying) return;
  _runPlayerDamageAndPickups(game);
  _runInteractablesIfAllowed(game);
  _runHazardChecks(game);
}

/** Runs stomp/roll/projectile pre-damage checks. */
function _runPreDamageChecks(game) {
  const common = { player: game._player, enemies: game._enemies, effects: game._effects };
  checkStomp(common);
  checkRollKill(common);
  checkProjectileHits({ projectiles: game._projectiles, enemies: game._enemies, effects: game._effects });
}

/** Runs enemy damage and pickup collision checks. */
function _runPlayerDamageAndPickups(game) {
  const shared = { player: game._player, gameState: game.gameState, hud: game._hud, camera: game._camera };
  checkEnemyDamage({ ...shared, enemies: game._enemies, onDeath: () => handlePlayerDeath(game) });
  checkPickups({ ...shared, pickups: game._pickups });
}

/** Runs interactable checks when not in victory pose lock. */
function _runInteractablesIfAllowed(game) {
  if (game._victoryPoseTimer > 0) return;
  checkInteractables({ player: game._player, interactables: game._interactables, onVictory: () => startVictorySequence(game) });
}

/** Runs hazard damage checks. */
function _runHazardChecks(game) {
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
