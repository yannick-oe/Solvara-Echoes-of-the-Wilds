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
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    this.state = GAME_STATES.LOADING;
    this.gameState = createGameState();
    this._rafId = null;
    this._lastTime = 0;
    this._loopStarted = false;
    this._level = new Level();
    this._camera = new Camera();
    this._parallax      = null;
    this._player        = null;
    this._camLookOffset = 0;
    this._enemies       = [];
    this._effects       = [];
    this._pickups       = [];
    this._interactables = [];
    this._hazards       = [];
    this._props         = [];
    this._hud           = new Hud(imageCache);
    this._deathTimeoutId      = null;
    this._victoryPoseTimer    = 0;
    this._levelTimer          = 0;
    this._finalLevelTime      = 0;
    this._victoryTransitionId = null;
    this._startScreen   = new StartScreen(() => this.restart());
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen = new VictoryScreen({
      onRestart:  () => this.restart(),
      onMainMenu: () => {
        audioManager.stopMusic();
        this._startScreen.reset();
        audioManager.playMusic('assets/audio/music/startMenu.ogg');
        this.state = GAME_STATES.START;
      },
    });
    this._pauseScreen    = new PauseScreen({
      onResume:      () => { this.state = GAME_STATES.PLAYING; },
      onRestart:     () => this.restart(),
      onBackToStart: () => { audioManager.playMusic('assets/audio/music/startMenu.ogg'); this._startScreen.reset(); this.state = GAME_STATES.START; },
    });

    this._touchControls = new TouchControls(container, inputManager, () => this.state);

    this._loop = this._loop.bind(this);
  }

  /**
   * Loads assets and level data, initializes input, and starts the game loop.
   */
  async start() {
    this._drawLoadingScreen();
    await imageCache.preload(ASSET_ENTRIES);
    await imageCache.preload(PROP_ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');
    initEntities(this);
    this._camera.y = 0;
    this._parallax = new Parallax([
      { img: imageCache.get('BG_FOREST_BACK'),   speed: 0.15 },
      { img: imageCache.get('BG_FOREST_MIDDLE'), speed: 0.4,
        drawH: Math.round(CANVAS_HEIGHT * 0.58), alignBottom: true },
    ]);
    inputManager.init();
    audioManager.preloadMusic('assets/audio/music/startMenu.ogg');
    this._touchControls.init();
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  }

  /** Resets the current level and restarts the PLAYING phase. */
  restart() {
    restartGameSession(this);
  }

  /**
   * Handles loop.
   * @param {number} timestamp Input parameter.
   */
  _loop(timestamp) {
    if (!this._loopStarted) {
      this._loopStarted = true;
      this._lastTime = timestamp;
      this._rafId = requestAnimationFrame(this._loop);
      return;
    }
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;
    if (inputManager.fullscreenPressed) this._toggleFullscreen();
    this._update(dt);
    this._draw();
    this._touchControls.setGameState(this.state);
    inputManager.resetFrameState();

    this._rafId = requestAnimationFrame(this._loop);
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  _update(dt) {
    switch (this.state) {
      case GAME_STATES.START:
        audioManager.playMusic('assets/audio/music/startMenu.ogg');
        this._startScreen.handleInput(inputManager);
        break;
      case GAME_STATES.PLAYING:    this._updatePlaying(dt); break;
      case GAME_STATES.GAMEOVER:
        this._gameOverScreen.update(dt);
        this._gameOverScreen.handleInput(inputManager);
        break;
      case GAME_STATES.VICTORY:
        this._victoryScreen.update(dt);
        this._victoryScreen.handleInput(inputManager);
        break;
      case GAME_STATES.PAUSED:
        this._pauseScreen.handleInput(inputManager);
        break;
    }
  }

  /**
   * Handles update playing.
   * @param {number} dt Input parameter.
   */
  _updatePlaying(dt) {
    if (this._victoryPoseTimer > 0) {
      this._victoryPoseTimer -= dt;
      if (this._victoryPoseTimer <= 0) {
        this._victoryPoseTimer = 0;
        audioManager.fadeOutMusic(220);
        this._victoryTransitionId = setTimeout(() => {
          this._victoryTransitionId = null;
          audioManager.playSting('assets/audio/music/victory.mp3');
          this._victoryScreen.show(this.gameState, this._finalLevelTime);
          this.state = GAME_STATES.VICTORY;
        }, 280);
      }
      return;
    }
    if (inputManager.pausePressed) {
      this._pauseScreen.reset();
      this.state = GAME_STATES.PAUSED;
      return;
    }
    this._levelTimer += dt;
    this._player.update(dt, inputManager, this._level.tileMap);
    for (const enemy of this._enemies) {
      if (enemy.active) enemy.update(dt, this._level.tileMap);
    }
    const groundY = this._level.tileMap.height - this._level.tileMap.height % TILE_SIZE;
    for (const hz of this._hazards) hz.update?.(dt, this._player, groundY);
    for (const pickup of this._pickups) { if (pickup.active) pickup.update(dt); }
    runInteractionChecks(this);
    this._hud.update(dt);
    for (const fx of this._effects) fx.update(dt);
    this._effects = this._effects.filter(fx => fx.active);
    this._camera.follow(this._player);
    const target = this._player.state === 'lookUp' ? -CAM_LOOKUP_OFFSET : 0;
    this._camLookOffset += (target - this._camLookOffset) * Math.min(CAM_LERP_SPEED * dt, 1);
    this._camera.y += this._camLookOffset;
    this._camera.clamp(this._level.width, this._level.height);
  }

  /**
   * Handles draw.
   */
  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#1a1220';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = false;
    switch (this.state) {
      case GAME_STATES.START:
        this._startScreen.draw(this.ctx);
        break;
      case GAME_STATES.PLAYING:
        this._drawWorld();
        break;
      case GAME_STATES.PAUSED:
        this._drawWorld();
        this._pauseScreen.draw(this.ctx);
        break;
      case GAME_STATES.GAMEOVER:
        this._gameOverScreen.draw(this.ctx);
        break;
      case GAME_STATES.VICTORY:
        this._victoryScreen.draw(this.ctx);
        break;
    }
  }

  /**
   * Handles draw world.
   */
  _drawWorld() {

    this._parallax?.draw(this.ctx, this._camera.x);
    this.ctx.save();
    this._camera.applyTransform(this.ctx);
    this._level.tileMap?.draw(this.ctx, this._camera);
    this._drawProps('back');
    for (const hz of this._hazards) {
      hz.draw(this.ctx, this._camera, imageCache);
    }
    for (const obj of this._interactables) {
      obj.draw(this.ctx, this._camera, imageCache);
    }
    this._player?.draw(this.ctx, this._camera, imageCache);
    for (const enemy of this._enemies) {
      if (enemy.active) enemy.draw(this.ctx, this._camera, imageCache);
    }
    for (const fx of this._effects) {
      if (fx.active) fx.draw(this.ctx, this._camera, imageCache);
    }
    for (const pickup of this._pickups) {
      if (pickup.active) pickup.draw(this.ctx, this._camera, imageCache);
    }
    this._drawProps('front');
    this.ctx.restore();
    const lightGrd = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    lightGrd.addColorStop(0, 'rgba(255,240,180,0.08)');
    lightGrd.addColorStop(1, 'rgba(0,0,0,0.08)');
    this.ctx.fillStyle = lightGrd;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = 'rgba(255,230,150,0.03)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._hud.draw(this.ctx, this.gameState);
  }

  /**
   * Handles draw props.
   * @param {object} layer Input parameter.
   */
  _drawProps(layer) {
    const ctx = this.ctx;
    for (const prop of this._props) {
      if (prop.layer !== layer) continue;
      const img = imageCache.get(prop.key);
      if (!img) continue;
      const w = img.naturalWidth  * prop.scaleX;
      const h = img.naturalHeight * prop.scaleY;
      ctx.save();
      if (prop.alpha !== 1) ctx.globalAlpha = prop.alpha;
      if (prop.flipX || prop.flipY) {
        const sx = prop.flipX ? -1 : 1;
        const sy = prop.flipY ? -1 : 1;
        ctx.translate(
          prop.x + (prop.flipX ? w : 0),
          prop.y + (prop.flipY ? h : 0)
        );
        ctx.scale(sx, sy);
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        ctx.drawImage(img, prop.x, prop.y, w, h);
      }
      ctx.restore();
    }
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