import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT } from './constants.js';
import { imageCache }    from './imageCache.js';
import { inputManager }  from './input.js';
import { intervalManager } from './intervalManager.js';
import { ASSET_ENTRIES } from '../config/assetPaths.js';

function createGameState() {
  return {
    hearts:     PLAYER_START_HEARTS,
    heartsMax:  5,
    gems:       0,
    starCoins:  new Array(STAR_COIN_COUNT).fill(false),
    cherryFound: false,
  };
}

export class GameManager {
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.state     = GAME_STATES.LOADING;
    this.gameState = createGameState();

    this._rafId    = null;
    this._lastTime = 0;

    this._loop = this._loop.bind(this);
  }

  async start() {
    await imageCache.preload(ASSET_ENTRIES);
    inputManager.init();
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  }

  restart() {
    intervalManager.stopAll();
    this.gameState = createGameState();
    this.state     = GAME_STATES.PLAYING;
  }

  _stopLoop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;

    this._update(dt);
    this._draw();

    this._rafId = requestAnimationFrame(this._loop);
  }

  _update(dt) {
    switch (this.state) {
      case GAME_STATES.PLAYING:
        // TODO: Welt, Player, Entities updaten
        break;
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.state) {
      case GAME_STATES.LOADING:
        // TODO: Ladebildschirm
        break;
      case GAME_STATES.START:
        // TODO: StartScreen.draw()
        break;
      case GAME_STATES.PLAYING:
        // TODO: Parallax, TileMap, Entities, HUD
        break;
      case GAME_STATES.GAMEOVER:
        // TODO: GameOverScreen.draw()
        break;
      case GAME_STATES.VICTORY:
        // TODO: VictoryScreen.draw()
        break;
    }
  }
}
