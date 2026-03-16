// #region Imports
import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT } from './constants.js';
import { audioManager } from './audioManager.js';
import { intervalManager } from './intervalManager.js';
import { SFX_VOLUME } from '../config/audioConfig.js';
import {
  createPlayer,
  spawnEnemies,
  spawnPickups,
  spawnInteractables,
  spawnHazards,
  spawnProps,
} from './entityFactory.js';

// #endregion

// #region Public Methods
/**
 * Creates a new default game state object.
 */
export function createGameState() {
  return {
    hearts: PLAYER_START_HEARTS,
    heartsMax: 5,
    score: 0,
    gemsCollected: 0,
    starCoins: new Array(STAR_COIN_COUNT).fill(false),
  };
}

/**
 * Rebuilds world entities from the loaded level content.
 * @param {object} game Input parameter.
 */
export function initEntities(game) {
  const levelContent = game._level.content;
  game._player = createPlayer(levelContent);
  game._enemies = spawnEnemies(levelContent);
  game._pickups = spawnPickups(levelContent);
  game._interactables = spawnInteractables(levelContent);
  game._hazards = spawnHazards(levelContent);
  game._props = spawnProps(levelContent);
  game._effects = [];
}

/**
 * Applies a game state transition and triggers state-bound side effects.
 * @param {object} game Input parameter.
 * @param {object} nextState Input parameter.
 */
export function setGameState(game, nextState) {
  game.state = nextState;
  if (nextState === GAME_STATES.PLAYING) {
    audioManager.playMusic('assets/audio/music/level01.ogg');
  }
}

/**
 * Starts the delayed transition from victory pose to victory screen.
 * @param {object} game Input parameter.
 */
export function startVictorySequence(game) {
  game._player.startVictoryPose();
  game._victoryPoseTimer = 0.65;
  game._finalLevelTime = game._levelTimer;
}

/**
 * Handles player death flow including audio fade and game-over transition.
 * @param {object} game Input parameter.
 */
export function handlePlayerDeath(game) {
  game._player.startDying();
  audioManager.playSfx('assets/audio/sfx/deathSound.mp3', { volume: SFX_VOLUME.death });
  audioManager.fadeOutMusic(300);

  game._deathTimeoutId = setTimeout(() => {
    game._deathTimeoutId = null;
    game._gameOverScreen.show();
    setGameState(game, GAME_STATES.GAMEOVER);
  }, 400);
}

/**
 * Resets runtime timers and world state and re-enters the playing phase.
 * @param {object} game Input parameter.
 */
export function restartGameSession(game) {
  if (game._deathTimeoutId !== null) {
    clearTimeout(game._deathTimeoutId);
    game._deathTimeoutId = null;
  }
  if (game._victoryTransitionId !== null) {
    clearTimeout(game._victoryTransitionId);
    game._victoryTransitionId = null;
  }

  intervalManager.stopAll();
  game._levelTimer = 0;
  game._victoryPoseTimer = 0;
  game._finalLevelTime = 0;
  game.gameState = createGameState();

  initEntities(game);
  game._camera.x = 0;
  game._camera.y = 0;
  game._camLookOffset = 0;
  setGameState(game, GAME_STATES.PLAYING);
}
// #endregion