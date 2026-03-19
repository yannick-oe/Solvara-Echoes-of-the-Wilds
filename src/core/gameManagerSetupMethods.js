import { GAME_STATES, CANVAS_HEIGHT, CANVAS_WIDTH } from './constants.js';
import { imageCache } from './imageCache.js';
import { audioManager } from './audioManager.js';
import { inputManager } from './input.js';
import { Camera } from './camera.js';
import { ASSET_ENTRIES } from '../config/assetPaths.js';
import { PROP_ASSET_ENTRIES } from '../config/propConfig.js';
import { Level } from '../world/level.js';
import { Parallax } from '../world/parallax.js';
import { Hud } from '../ui/hud.js';
import { StartScreen } from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen } from '../ui/screens/victoryScreen.js';
import { PauseScreen } from '../ui/screens/pauseScreen.js';
import { TouchControls } from '../ui/touchControls.js';
import { loadSelectedCharacter, saveSelectedCharacter } from '../config/characterConfig.js';
import { createGameState, initEntities, restartGameSession } from './gameLifecycle.js';

export const gameManagerSetupMethods = {
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
  },

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
  },

  _initSessionState() {
    this._deathTimeoutId = null;
    this._victoryPoseTimer = 0;
    this._levelTimer = 0;
    this._finalLevelTime = 0;
    this._victoryTransitionId = null;
  },

  _initUiScreens() {
    this._startScreen = new StartScreen(() => this.restart(this._startScreen.getSelectedCharacter()));
    this._startScreen.setSelectedCharacter(this._selectedCharacter);
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen = this._createVictoryScreen();
    this._pauseScreen = this._createPauseScreen();
  },

  _createVictoryScreen() {
    return new VictoryScreen({
      onRestart: () => this.restart(),
      onMainMenu: () => this._returnToStartMenu(true),
    });
  },

  _createPauseScreen() {
    return new PauseScreen({
      onResume: () => { this.state = GAME_STATES.PLAYING; },
      onRestart: () => this.restart(),
      onBackToStart: () => this._returnToStartMenu(false),
      getSelectedCharacter: () => this._selectedCharacter,
    });
  },

  _returnToStartMenu(stopMusic) {
    if (stopMusic) audioManager.stopMusic();
    this._startScreen.reset();
    audioManager.playMusic('assets/audio/music/startMenu.ogg');
    this.state = GAME_STATES.START;
  },

  _initTouchControls(container) {
    this._touchControls = new TouchControls(
      container,
      inputManager,
      () => this.state,
      () => ({ startSubOpen: this._startScreen.isSubPanelOpen(), pauseSubOpen: this._pauseScreen.isSubPanelOpen() }),
    );
  },

  async start() {
    this._drawLoadingScreen();
    await this._loadWorldAssets();
    this._initWorldRenderSystems();
    this._initRuntimeSystems();
    this._enterStartState();
  },

  async _loadWorldAssets() {
    await imageCache.preload(ASSET_ENTRIES);
    await imageCache.preload(PROP_ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');
    initEntities(this);
  },

  _initWorldRenderSystems() {
    this._camera.y = 0;
    this._parallax = new Parallax([
      { img: imageCache.get('BG_FOREST_BACK'), speed: 0.15 },
      { img: imageCache.get('BG_FOREST_MIDDLE'), speed: 0.4, drawH: Math.round(CANVAS_HEIGHT * 0.58), alignBottom: true },
    ]);
  },

  _initRuntimeSystems() {
    inputManager.init();
    audioManager.preloadMusic('assets/audio/music/startMenu.ogg');
    this._touchControls.init();
  },

  _enterStartState() {
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  },

  restart(characterId = this._selectedCharacter) {
    this._selectedCharacter = characterId;
    this._startScreen.setSelectedCharacter(characterId);
    saveSelectedCharacter(characterId);
    restartGameSession(this, characterId);
  },

  _drawLoadingScreen() {
    const { ctx } = this;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading…', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  },

  _toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) return this._requestFullscreen();
    this._exitFullscreen();
  },

  _requestFullscreen() {
    const req = this.container.requestFullscreen ?? this.container.webkitRequestFullscreen;
    req?.call(this.container)?.catch?.(() => {});
  },

  _exitFullscreen() {
    const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
    exit?.call(document)?.catch?.(() => {});
  },
};
