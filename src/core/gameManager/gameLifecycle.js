// #region Imports
import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT } from '../constants.js';
import { audioManager } from '../audioManager.js';
import { intervalManager } from '../intervalManager.js';
import { SFX_VOLUME } from '../../config/audioConfig.js';
import {
  createPlayer,
  spawnEnemies,
  spawnPickups,
  spawnInteractables,
  spawnHazards,
  spawnProps,
} from '../entityFactory.js';

// #endregion

// #region Public Methods
/** Creates game State. @returns {*} - Resulting value. */
export function createGameState() {
  return {
    hearts: PLAYER_START_HEARTS,
    heartsMax: 5,
    score: 0,
    gemsCollected: 0,
    starCoins: new Array(STAR_COIN_COUNT).fill(false),
  };
}

/** Handles init Entities. @param {*} game - Game value. @returns {void} - Nothing. */
export function initEntities(game) {
  const levelContent = game._level.content;
  _resetTransientEntities(game);
  game._player = _createLevelPlayer(game, levelContent);
  _spawnLevelEntities(game, levelContent);
}

/** Sets game State. @param {*} game - Game value. @param {*} nextState - Next State value. @returns {void} - Nothing. */
export function setGameState(game, nextState) {
  game.state = nextState;
  if (nextState === GAME_STATES.PLAYING) {
    audioManager.playMusic('assets/audio/music/level01.ogg');
  }
}

/** Handles reset Transient Entities. @param {*} game - Game value. @returns {void} - Nothing. */
function _resetTransientEntities(game) {
  game._projectiles = [];
  game._effects = [];
}

/** Creates level Player. @param {*} game - Game value. @param {*} levelContent - Level Content value. @returns {*} - Resulting value. */
function _createLevelPlayer(game, levelContent) {
  return createPlayer(
    levelContent,
    game._selectedCharacter,
    projectile => game._projectiles.push(projectile),
  );
}

/** Spawns level Entities. @param {*} game - Game value. @param {*} levelContent - Level Content value. @returns {void} - Nothing. */
function _spawnLevelEntities(game, levelContent) {
  game._enemies = spawnEnemies(levelContent);
  game._pickups = spawnPickups(levelContent);
  game._interactables = spawnInteractables(levelContent);
  game._hazards = spawnHazards(levelContent);
  game._props = spawnProps(levelContent);
}

/** Starts victory Sequence. @param {*} game - Game value. @returns {void} - Nothing. */
export function startVictorySequence(game) {
  game._player.startVictoryPose();
  game._victoryPoseTimer = 0.65;
  game._finalLevelTime = game._levelTimer;
}

/** Handles player Death. @param {*} game - Game value. @returns {void} - Nothing. */
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

/** Handles restart Game Session. @param {*} game - Game value. @param {*} characterId - Character Id value. @returns {void} - Nothing. */
export function restartGameSession(game, characterId = game._selectedCharacter) {
  _clearPendingSessionTimeouts(game);
  intervalManager.stopAll();
  _resetSessionState(game, characterId);
  initEntities(game);
  _resetCameraState(game);
  setGameState(game, GAME_STATES.PLAYING);
}

/** Clears pending Session Timeouts. @param {*} game - Game value. @returns {void} - Nothing. */
function _clearPendingSessionTimeouts(game) {
  if (game._deathTimeoutId !== null) {
    clearTimeout(game._deathTimeoutId);
    game._deathTimeoutId = null;
  }
  if (game._victoryTransitionId !== null) {
    clearTimeout(game._victoryTransitionId);
    game._victoryTransitionId = null;
  }
}

/** Handles reset Session State. @param {*} game - Game value. @param {*} characterId - Character Id value. @returns {void} - Nothing. */
function _resetSessionState(game, characterId) {
  game._selectedCharacter = characterId;
  game._levelTimer = 0;
  game._victoryPoseTimer = 0;
  game._finalLevelTime = 0;
  game.gameState = createGameState();
}

/** Handles reset Camera State. @param {*} game - Game value. @returns {void} - Nothing. */
function _resetCameraState(game) {
  game._camera.x = 0;
  game._camera.y = 0;
  game._camLookOffset = 0;
}
// #endregion