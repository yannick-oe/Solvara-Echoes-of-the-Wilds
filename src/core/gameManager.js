import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { imageCache }      from './imageCache.js';
import { inputManager }    from './input.js';
import { intervalManager } from './intervalManager.js';
import { Camera }          from './camera.js';
import { ASSET_ENTRIES }   from '../config/assetPaths.js';
import { Level }           from '../world/level.js';
import { Parallax }        from '../world/parallax.js';
import { StartScreen }    from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen }  from '../ui/screens/victoryScreen.js';

function createGameState() {
  return {
    hearts:      PLAYER_START_HEARTS,
    heartsMax:   5,
    gems:        0,
    starCoins:   new Array(STAR_COIN_COUNT).fill(false),
    cherryFound: false,
  };
}

export class GameManager {
  constructor(canvas, container) {
    this.canvas    = canvas;
    this.container = container;   // für TouchControls
    this.ctx       = canvas.getContext('2d');
    this.state     = GAME_STATES.LOADING;
    this.gameState = createGameState();

    this._rafId       = null;
    this._lastTime    = 0;
    this._loopStarted = false;

    this._level    = new Level();
    this._camera   = new Camera();
    this._parallax = null;   // nach preload initialisiert

    this._startScreen    = new StartScreen(() => this._setState(GAME_STATES.PLAYING));
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen  = new VictoryScreen(() => this.restart());

    this._loop = this._loop.bind(this);
  }

  async start() {
    this._drawLoadingScreen();
    await imageCache.preload(ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');

    this._parallax = new Parallax([
      { img: imageCache.get('BG_FOREST_BACK'),   speed: 0.15 },
      { img: imageCache.get('BG_FOREST_MIDDLE'), speed: 0.4  },
    ]);

    inputManager.init();
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  }

  restart() {
    intervalManager.stopAll();
    this.gameState   = createGameState();
    this._camera.x   = 0;
    this._camera.y   = 0;
    this._setState(GAME_STATES.PLAYING);
  }

  _setState(next) {
    this.state = next;
  }

  _loop(timestamp) {
    // Ersten Frame überspringen: _lastTime initialisieren ohne riesigen dt-Sprung
    if (!this._loopStarted) {
      this._loopStarted = true;
      this._lastTime    = timestamp;
      this._rafId = requestAnimationFrame(this._loop);
      return;
    }

    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;

    this._update(dt);
    this._draw();
    inputManager.resetFrameState();

    this._rafId = requestAnimationFrame(this._loop);
  }

  _update(dt) {
    switch (this.state) {
      case GAME_STATES.START:
        this._startScreen.handleInput(inputManager);
        break;
      case GAME_STATES.PLAYING:
        // TODO: Player, Entities updaten
        break;
      case GAME_STATES.GAMEOVER:
        this._gameOverScreen.handleInput(inputManager);
        break;
      case GAME_STATES.VICTORY:
        this._victoryScreen.handleInput(inputManager);
        break;
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.state) {
      case GAME_STATES.START:
        this._startScreen.draw(this.ctx);
        break;
      case GAME_STATES.PLAYING:
        this._drawWorld();
        break;
      case GAME_STATES.GAMEOVER:
        this._gameOverScreen.draw(this.ctx);
        break;
      case GAME_STATES.VICTORY:
        this._victoryScreen.draw(this.ctx, this.gameState);
        break;
    }
  }

  /** Parallax + TileMap für den PLAYING State. */
  _drawWorld() {
    // 1. Hintergrund-Ebenen im Screen-Space
    this._parallax?.draw(this.ctx, this._camera.x);

    // 2. Kamera-Transform für Weltgegenstände
    this.ctx.save();
    this._camera.applyTransform(this.ctx);

    this._level.tileMap?.draw(this.ctx, this._camera);
    // TODO: Props, Entities hier einfügen

    this.ctx.restore();

    // 3. HUD im Screen-Space (TODO)
  }

  _drawLoadingScreen() {
    const { ctx } = this;
    ctx.fillStyle    = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle    = '#ffffff';
    ctx.font         = 'bold 22px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading…', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
}

