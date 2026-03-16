// #region Imports
import { GAME_STATES, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './constants.js';
import { imageCache } from './imageCache.js';
import { Hud }         from '../ui/hud.js';
import { audioManager } from './audioManager.js';
import { inputManager } from './input.js';
import { Camera } from './camera.js';
import { ASSET_ENTRIES } from '../config/assetPaths.js';
import { PROP_ASSET_ENTRIES } from '../config/propConfig.js';
import { Level } from '../world/level.js';
import { Parallax } from '../world/parallax.js';
import { StartScreen } from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen } from '../ui/screens/victoryScreen.js';
import { PauseScreen } from '../ui/screens/pauseScreen.js';
import { TouchControls } from '../ui/touchControls.js';
import { loadSelectedCharacter, saveSelectedCharacter } from '../config/characterConfig.js';
import {
  createGameState,
  initEntities,
  restartGameSession,
} from './gameLifecycle.js';
import { runInteractionChecks } from './gameInteractionChecks.js';
// #endregion

// #region Constants
const CAM_LOOKUP_OFFSET = 80;
const CAM_LERP_SPEED    = 6;
// #endregion

// #region Class Definition
export class GameManager {
  /**
   * Creates a new instance.
   * @param {object} canvas Input parameter.
   * @param {object} container Input parameter.
   */
  constructor(canvas, container) {
    this._initCoreState(canvas, container);
    this._initWorldState();
    this._initSessionState();
    this._initUiScreens();
    this._initTouchControls(container);
    this._loop = this._loop.bind(this);
  }

  /**
   * Initializes core canvas/runtime state.
   * @param {object} canvas Input parameter.
   * @param {object} container Input parameter.
   */
  _initCoreState(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    this.state = GAME_STATES.LOADING;
    this.gameState = createGameState();
    this._rafId = null;
    this._lastTime = 0;
    this._loopStarted = false;
    this._selectedCharacter = loadSelectedCharacter();
  }

  /** Initializes world collections and camera/level objects. */
  _initWorldState() {
    this._level = new Level();
    this._camera = new Camera();
    this._parallax = null;
    this._player = null;
    this._camLookOffset = 0;
    this._enemies = [];
    this._projectiles = [];
    this._effects = [];
    this._pickups = [];
    this._interactables = [];
    this._hazards = [];
    this._props = [];
    this._hud = new Hud(imageCache);
  }

  /** Initializes transition/timer/session helper fields. */
  _initSessionState() {
    this._deathTimeoutId = null;
    this._victoryPoseTimer = 0;
    this._levelTimer = 0;
    this._finalLevelTime = 0;
    this._victoryTransitionId = null;
  }

  /** Initializes all menu/screen controllers. */
  _initUiScreens() {
    this._startScreen = new StartScreen(() => this.restart(this._startScreen.getSelectedCharacter()));
    this._startScreen.setSelectedCharacter(this._selectedCharacter);
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen = this._createVictoryScreen();
    this._pauseScreen = this._createPauseScreen();
  }

  /** Creates configured victory screen controller. */
  _createVictoryScreen() {
    return new VictoryScreen({
      onRestart: () => this.restart(),
      onMainMenu: () => this._returnToStartMenu(true),
    });
  }

  /** Creates configured pause screen controller. */
  _createPauseScreen() {
    return new PauseScreen({
      onResume: () => { this.state = GAME_STATES.PLAYING; },
      onRestart: () => this.restart(),
      onBackToStart: () => this._returnToStartMenu(false),
      getSelectedCharacter: () => this._selectedCharacter,
    });
  }

  /**
   * Returns to start menu from pause/victory context.
   * @param {boolean} stopMusic Input parameter.
   */
  _returnToStartMenu(stopMusic) {
    if (stopMusic) audioManager.stopMusic();
    this._startScreen.reset();
    audioManager.playMusic('assets/audio/music/startMenu.ogg');
    this.state = GAME_STATES.START;
  }

  /**
   * Initializes touch controls bridge.
   * @param {object} container Input parameter.
   */
  _initTouchControls(container) {
    this._touchControls = new TouchControls(
      container,
      inputManager,
      () => this.state,
      () => ({ startSubOpen: this._startScreen.isSubPanelOpen(), pauseSubOpen: this._pauseScreen.isSubPanelOpen() })
    );
  }

  /**
   * Loads assets and level data, initializes input, and starts the game loop.
   */
  async start() {
    this._drawLoadingScreen();
    await this._loadWorldAssets();
    this._initWorldRenderSystems();
    this._initRuntimeSystems();
    this._enterStartState();
  }

  /** Loads required level and image assets. */
  async _loadWorldAssets() {
    await imageCache.preload(ASSET_ENTRIES);
    await imageCache.preload(PROP_ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');
    initEntities(this);
  }

  /** Initializes camera/parallax systems for world rendering. */
  _initWorldRenderSystems() {
    this._camera.y = 0;
    this._parallax = new Parallax([
      { img: imageCache.get('BG_FOREST_BACK'), speed: 0.15 },
      { img: imageCache.get('BG_FOREST_MIDDLE'), speed: 0.4, drawH: Math.round(CANVAS_HEIGHT * 0.58), alignBottom: true },
    ]);
  }

  /** Initializes runtime input/audio/touch systems. */
  _initRuntimeSystems() {
    inputManager.init();
    audioManager.preloadMusic('assets/audio/music/startMenu.ogg');
    this._touchControls.init();
  }

  /** Enters start state and begins animation loop. */
  _enterStartState() {
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  }

  /** Resets the current level and restarts the PLAYING phase. */
  restart(characterId = this._selectedCharacter) {
    this._selectedCharacter = characterId;
    this._startScreen.setSelectedCharacter(characterId);
    saveSelectedCharacter(characterId);
    restartGameSession(this, characterId);
  }

  /**
   * Handles loop.
   * @param {number} timestamp Input parameter.
   */
  _loop(timestamp) {
    if (this._handleFirstFrame(timestamp)) return;
    const dt = this._computeDelta(timestamp);
    this._handleFullscreenToggle();
    this._update(dt);
    this._draw();
    this._postFrame();
    this._rafId = requestAnimationFrame(this._loop);
  }

  /**
   * Handles first animation frame bootstrap.
   * @param {number} timestamp Input parameter.
   */
  _handleFirstFrame(timestamp) {
    if (this._loopStarted) return false;
    this._loopStarted = true;
    this._lastTime = timestamp;
    this._rafId = requestAnimationFrame(this._loop);
    return true;
  }

  /**
   * Computes clamped frame delta.
   * @param {number} timestamp Input parameter.
   */
  _computeDelta(timestamp) {
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;
    return dt;
  }

  /**
   * Handles fullscreen toggle input.
   */
  _handleFullscreenToggle() {
    if (inputManager.fullscreenPressed) this._toggleFullscreen();
  }

  /**
   * Runs post-frame bookkeeping.
   */
  _postFrame() {
    this._touchControls.setGameState(this.state);
    inputManager.resetFrameState();
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  _update(dt) {
    if (this.state === GAME_STATES.START) return this._updateStartScreen();
    if (this.state === GAME_STATES.PLAYING) return this._updatePlaying(dt);
    if (this.state === GAME_STATES.GAMEOVER) return this._updateGameOverScreen(dt);
    if (this.state === GAME_STATES.VICTORY) return this._updateVictoryScreen(dt);
    if (this.state === GAME_STATES.PAUSED) this._pauseScreen.handleInput(inputManager);
  }

  /** Updates start menu state input and music. */
  _updateStartScreen() {
    audioManager.playMusic('assets/audio/music/startMenu.ogg');
    this._startScreen.handleInput(inputManager);
  }

  /** Updates game-over screen state input. */
  _updateGameOverScreen(dt) {
    this._gameOverScreen.update(dt);
    this._gameOverScreen.handleInput(inputManager);
  }

  /** Updates victory screen state input. */
  _updateVictoryScreen(dt) {
    this._victoryScreen.update(dt);
    this._victoryScreen.handleInput(inputManager);
  }

  /**
   * Handles update playing.
   * @param {number} dt Input parameter.
   */
  _updatePlaying(dt) {
    if (this._tickVictoryTransition(dt)) return;
    if (this._handlePausePressed()) return;
    this._runPlayingUpdates(dt);
  }

  /**
   * Handles victory pose countdown and transition.
   * @param {number} dt Input parameter.
   */
  _tickVictoryTransition(dt) {
    if (this._victoryPoseTimer <= 0) return false;
    this._victoryPoseTimer -= dt;
    if (this._victoryPoseTimer > 0) return true;
    this._victoryPoseTimer = 0;
    audioManager.fadeOutMusic(220);
    this._queueVictoryScreen();
    return true;
  }

  /**
   * Queues victory screen transition after pose delay.
   */
  _queueVictoryScreen() {
    this._victoryTransitionId = setTimeout(() => {
      this._victoryTransitionId = null;
      audioManager.playSting('assets/audio/music/victory.mp3');
      this._victoryScreen.show(this.gameState, this._finalLevelTime);
      this.state = GAME_STATES.VICTORY;
    }, 280);
  }

  /**
   * Handles pause button press while playing.
   */
  _handlePausePressed() {
    if (!inputManager.pausePressed) return false;
    this._pauseScreen.reset();
    this.state = GAME_STATES.PAUSED;
    return true;
  }

  /**
   * Runs gameplay world updates for active frame.
   * @param {number} dt Input parameter.
   */
  _runPlayingUpdates(dt) {
    this._levelTimer += dt;
    this._updateWorldEntities(dt);
    runInteractionChecks(this);
    this._updateEffectsAndHud(dt);
    this._updateCamera(dt);
  }

  /**
   * Updates all world entities in playing state.
   * @param {number} dt Input parameter.
   */
  _updateWorldEntities(dt) {
    this._player.update(dt, inputManager, this._level.tileMap);
    this._updateEnemies(dt);
    this._updateProjectiles(dt);
    this._updateHazards(dt);
    this._updatePickups(dt);
  }

  /**
   * Updates active projectiles.
   * @param {number} dt Input parameter.
   */
  _updateProjectiles(dt) {
    for (const projectile of this._projectiles) {
      if (projectile.active) projectile.update(dt, this._level.tileMap);
    }
    this._projectiles = this._projectiles.filter(projectile => projectile.active);
  }

  /**
   * Updates enemy entities.
   * @param {number} dt Input parameter.
   */
  _updateEnemies(dt) {
    for (const enemy of this._enemies) if (enemy.active) enemy.update(dt, this._level.tileMap);
  }

  /**
   * Updates hazards with ground reference.
   * @param {number} dt Input parameter.
   */
  _updateHazards(dt) {
    const mapH = this._level.tileMap.height;
    const groundY = mapH - mapH % TILE_SIZE;
    for (const hz of this._hazards) hz.update?.(dt, this._player, groundY);
  }

  /**
   * Updates animated pickups.
   * @param {number} dt Input parameter.
   */
  _updatePickups(dt) {
    for (const pickup of this._pickups) if (pickup.active) pickup.update(dt);
  }

  /**
   * Updates HUD and transient effects.
   * @param {number} dt Input parameter.
   */
  _updateEffectsAndHud(dt) {
    this._hud.update(dt);
    for (const fx of this._effects) fx.update(dt);
    this._effects = this._effects.filter(fx => fx.active);
  }

  /**
   * Updates camera follow and look-up offset.
   * @param {number} dt Input parameter.
   */
  _updateCamera(dt) {
    this._camera.follow(this._player);
    const target = this._player.state === 'lookUp' ? -CAM_LOOKUP_OFFSET : 0;
    const lerp = Math.min(CAM_LERP_SPEED * dt, 1);
    this._camLookOffset += (target - this._camLookOffset) * lerp;
    this._camera.y += this._camLookOffset;
    this._camera.clamp(this._level.width, this._level.height);
  }

  /**
   * Handles draw.
   */
  _draw() {
    this._clearFrame();
    this.ctx.imageSmoothingEnabled = false;
    this._drawStateFrame();
  }

  /** Clears frame to base background color. */
  _clearFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#1a1220';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Draws current state frame content. */
  _drawStateFrame() {
    if (this.state === GAME_STATES.START) return this._startScreen.draw(this.ctx);
    if (this.state === GAME_STATES.PLAYING) return this._drawWorld();
    if (this.state === GAME_STATES.PAUSED) return this._drawPausedWorld();
    if (this.state === GAME_STATES.GAMEOVER) return this._gameOverScreen.draw(this.ctx);
    if (this.state === GAME_STATES.VICTORY) this._victoryScreen.draw(this.ctx);
  }

  /** Draws world and pause overlay. */
  _drawPausedWorld() {
    this._drawWorld();
    this._pauseScreen.draw(this.ctx);
  }

  /**
   * Handles draw world.
   */
  _drawWorld() {
    this._drawParallaxLayer();
    this._drawWorldEntities();
    this._drawLightingOverlay();
    this._hud.draw(this.ctx, this.gameState);
  }

  /** Draws parallax background layer. */
  _drawParallaxLayer() {
    this._parallax?.draw(this.ctx, this._camera.x);
  }

  /** Draws world tilemap and in-world entities within camera transform. */
  _drawWorldEntities() {
    this.ctx.save();
    this._camera.applyTransform(this.ctx);
    this._level.tileMap?.draw(this.ctx, this._camera);
    this._drawWorldPropAndEntityPass();
    this.ctx.restore();
  }

  /** Draws back/front props and entity passes in world space. */
  _drawWorldPropAndEntityPass() {
    this._drawProps('back');
    this._drawEntityGroup(this._hazards);
    this._drawEntityGroup(this._interactables);
    this._player?.draw(this.ctx, this._camera, imageCache);
    this._drawActiveEntityGroup(this._projectiles);
    this._drawActiveEntityGroup(this._enemies);
    this._drawActiveEntityGroup(this._effects);
    this._drawActiveEntityGroup(this._pickups);
    this._drawProps('front');
  }

  /**
   * Draws all entities in collection.
   * @param {Array} entities Input parameter.
   */
  _drawEntityGroup(entities) {
    for (const entity of entities) entity.draw(this.ctx, this._camera, imageCache);
  }

  /**
   * Draws only active entities in collection.
   * @param {Array} entities Input parameter.
   */
  _drawActiveEntityGroup(entities) {
    for (const entity of entities) if (entity.active) entity.draw(this.ctx, this._camera, imageCache);
  }

  /**
   * Draws warm lighting overlay above world pass.
   */
  _drawLightingOverlay() {
    const lightGrd = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    lightGrd.addColorStop(0, 'rgba(255,240,180,0.08)');
    lightGrd.addColorStop(1, 'rgba(0,0,0,0.08)');
    this.ctx.fillStyle = lightGrd;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = 'rgba(255,230,150,0.03)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Handles draw props.
   * @param {object} layer Input parameter.
   */
  _drawProps(layer) {
    for (const prop of this._props) {
      if (prop.layer !== layer) continue;
      this._drawSingleProp(prop);
    }
  }

  /**
   * Draws one prop entry when asset image is available.
   * @param {object} prop Input parameter.
   */
  _drawSingleProp(prop) {
    const img = imageCache.get(prop.key);
    if (!img) return;
    const size = this._propDrawSize(img, prop);
    this.ctx.save();
    if (prop.alpha !== 1) this.ctx.globalAlpha = prop.alpha;
    this._drawPropImage(prop, img, size);
    this.ctx.restore();
  }

  /**
   * Computes draw size for prop image.
   * @param {object} img Input parameter.
   * @param {object} prop Input parameter.
   */
  _propDrawSize(img, prop) {
    const w = img.naturalWidth * prop.scaleX;
    const h = img.naturalHeight * prop.scaleY;
    return { w, h };
  }

  /**
   * Draws prop image with optional flip transform.
   * @param {object} prop Input parameter.
   * @param {object} img Input parameter.
   * @param {object} size Input parameter.
   */
  _drawPropImage(prop, img, size) {
    if (!prop.flipX && !prop.flipY) {
      this.ctx.drawImage(img, prop.x, prop.y, size.w, size.h);
      return;
    }
    this._drawFlippedPropImage(prop, img, size);
  }

  /**
   * Draws prop image with flipped axis transforms.
   * @param {object} prop Input parameter.
   * @param {object} img Input parameter.
   * @param {object} size Input parameter.
   */
  _drawFlippedPropImage(prop, img, size) {
    const sx = prop.flipX ? -1 : 1;
    const sy = prop.flipY ? -1 : 1;
    this.ctx.translate(prop.x + (prop.flipX ? size.w : 0), prop.y + (prop.flipY ? size.h : 0));
    this.ctx.scale(sx, sy);
    this.ctx.drawImage(img, 0, 0, size.w, size.h);
  }

  /**
   * Handles draw loading screen.
   */
  _drawLoadingScreen() {
    const { ctx } = this;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading…', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  /**
   * Handles toggle fullscreen.
   */
  _toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const req = this.container.requestFullscreen
                ?? this.container.webkitRequestFullscreen;
      req?.call(this.container)?.catch?.(() => {});
    } else {
      const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
      exit?.call(document)?.catch?.(() => {});
    }
  }
}
// #endregion