import { GAME_STATES, TILE_SIZE } from '../constants.js';
import { audioManager } from '../audioManager.js';
import { inputManager } from '../input.js';
import { runInteractionChecks } from './gameInteractionChecks.js';
import { CAM_LOOKUP_OFFSET, CAM_LERP_SPEED } from './gameManagerShared.js';

export const gameManagerUpdateMethods = {
  _loop(timestamp) {
    if (this._handleFirstFrame(timestamp)) return;
    const dt = this._computeDelta(timestamp);
    this._handleFullscreenToggle();
    this._update(dt);
    this._draw();
    this._postFrame();
    this._rafId = requestAnimationFrame(this._loop);
  },

  _handleFirstFrame(timestamp) {
    if (this._loopStarted) return false;
    this._loopStarted = true;
    this._lastTime = timestamp;
    this._rafId = requestAnimationFrame(this._loop);
    return true;
  },

  _computeDelta(timestamp) {
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;
    return dt;
  },

  _handleFullscreenToggle() {
    if (inputManager.fullscreenPressed) this._toggleFullscreen();
  },

  _postFrame() {
    this._touchControls.setGameState(this.state);
    inputManager.resetFrameState();
  },

  _update(dt) {
    if (this.state === GAME_STATES.START) return this._updateStartScreen();
    if (this.state === GAME_STATES.PLAYING) return this._updatePlaying(dt);
    if (this.state === GAME_STATES.GAMEOVER) return this._updateGameOverScreen(dt);
    if (this.state === GAME_STATES.VICTORY) return this._updateVictoryScreen(dt);
    if (this.state === GAME_STATES.PAUSED) this._pauseScreen.handleInput(inputManager);
  },

  _updateStartScreen() {
    audioManager.playMusic('assets/audio/music/startMenu.ogg');
    this._startScreen.handleInput(inputManager);
  },

  _updateGameOverScreen(dt) {
    this._gameOverScreen.update(dt);
    this._gameOverScreen.handleInput(inputManager);
  },

  _updateVictoryScreen(dt) {
    this._victoryScreen.update(dt);
    this._victoryScreen.handleInput(inputManager);
  },

  _updatePlaying(dt) {
    if (this._tickVictoryTransition(dt)) return;
    if (this._handlePausePressed()) return;
    this._runPlayingUpdates(dt);
  },

  _tickVictoryTransition(dt) {
    if (this._victoryPoseTimer <= 0) return false;
    this._victoryPoseTimer -= dt;
    if (this._victoryPoseTimer > 0) return true;
    this._victoryPoseTimer = 0;
    audioManager.fadeOutMusic(220);
    this._queueVictoryScreen();
    return true;
  },

  _queueVictoryScreen() {
    this._victoryTransitionId = setTimeout(() => {
      this._victoryTransitionId = null;
      audioManager.playSting('assets/audio/music/victory.mp3');
      this._victoryScreen.show(this.gameState, this._finalLevelTime);
      this.state = GAME_STATES.VICTORY;
    }, 280);
  },

  _handlePausePressed() {
    if (!inputManager.pausePressed) return false;
    this._pauseScreen.reset();
    this.state = GAME_STATES.PAUSED;
    return true;
  },

  _runPlayingUpdates(dt) {
    this._levelTimer += dt;
    this._updateWorldEntities(dt);
    runInteractionChecks(this);
    this._updateEffectsAndHud(dt);
    this._updateCamera(dt);
  },

  _updateWorldEntities(dt) {
    this._player.update(dt, inputManager, this._level.tileMap);
    this._updateEnemies(dt);
    this._updateProjectiles(dt);
    this._updateHazards(dt);
    this._updatePickups(dt);
  },

  _updateProjectiles(dt) {
    for (const projectile of this._projectiles) if (projectile.active) projectile.update(dt, this._level.tileMap);
    this._projectiles = this._projectiles.filter(projectile => projectile.active);
  },

  _updateEnemies(dt) {
    for (const enemy of this._enemies) if (enemy.active) enemy.update(dt, this._level.tileMap);
  },

  _updateHazards(dt) {
    const mapH = this._level.tileMap.height;
    const groundY = mapH - mapH % TILE_SIZE;
    for (const hz of this._hazards) hz.update?.(dt, this._player, groundY);
  },

  _updatePickups(dt) {
    for (const pickup of this._pickups) if (pickup.active) pickup.update(dt);
  },

  _updateEffectsAndHud(dt) {
    this._hud.update(dt);
    for (const fx of this._effects) fx.update(dt);
    this._effects = this._effects.filter(fx => fx.active);
  },

  _updateCamera(dt) {
    this._camera.follow(this._player);
    const target = this._player.state === 'lookUp' ? -CAM_LOOKUP_OFFSET : 0;
    const lerp = Math.min(CAM_LERP_SPEED * dt, 1);
    this._camLookOffset += (target - this._camLookOffset) * lerp;
    this._camera.y += this._camLookOffset;
    this._camera.clamp(this._level.width, this._level.height);
  },
};
