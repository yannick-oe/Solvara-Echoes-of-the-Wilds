import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './constants.js';
import { imageCache } from './imageCache.js';
import { Player }      from '../entities/player.js';
import { AntEnemy }    from '../entities/enemies/ant.js';
import { FrogEnemy }   from '../entities/enemies/frog.js';
import { DeathEffect } from '../entities/effects/deathEffect.js';
import { inputManager } from './input.js';
import { intervalManager } from './intervalManager.js';
import { Camera } from './camera.js';
import { ASSET_ENTRIES } from '../config/assetPaths.js';
import { Level } from '../world/level.js';
import { Parallax } from '../world/parallax.js';
import { StartScreen } from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen } from '../ui/screens/victoryScreen.js';

// Kamera-Lookup-Effekt
const CAM_LOOKUP_OFFSET = 80;  // px – Kamera hebt sich beim Hochschauen
const CAM_LERP_SPEED    = 6;   // Interpolationsgeschwindigkeit (1/s)

function createGameState() {
  return {
    hearts: PLAYER_START_HEARTS,
    heartsMax: 5,
    gems: 0,
    starCoins: new Array(STAR_COIN_COUNT).fill(false),
    cherryFound: false,
  };
}

export class GameManager {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;   // für TouchControls
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

    this._startScreen = new StartScreen(() => this._setState(GAME_STATES.PLAYING));
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen = new VictoryScreen(() => this.restart());

    this._loop = this._loop.bind(this);
  }

  async start() {
    this._drawLoadingScreen();
    await imageCache.preload(ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');

    this._player  = this._createPlayer();
    this._enemies  = this._spawnEnemies();
    this._effects  = [];
    this._camera.y = 0;

    this._parallax = new Parallax([
      { img: imageCache.get('BG_FOREST_BACK'), speed: 0.15 },
      { img: imageCache.get('BG_FOREST_MIDDLE'), speed: 0.4 },
    ]);

    inputManager.init();
    this.state = GAME_STATES.START;
    this._rafId = requestAnimationFrame(this._loop);
  }

  restart() {
    intervalManager.stopAll();
    this.gameState = createGameState();
    this._player        = this._createPlayer();
    this._enemies       = this._spawnEnemies();
    this._effects       = [];
    this._camera.x      = 0;
    this._camera.y      = 0;
    this._camLookOffset = 0;
    this._setState(GAME_STATES.PLAYING);
  }

  _createPlayer() {
    return new Player(2 * TILE_SIZE, 8 * TILE_SIZE - 48);
  }

  /** Erstellt die Test-Gegner für Level 01. */
  _spawnEnemies() {
    return [
      // Ameise auf dem Boden rechts vom Spieler-Spawn
      new AntEnemy(8 * TILE_SIZE, 9 * TILE_SIZE),
      // Frosch auf der unteren Plattform (row 7, col 13)
      new FrogEnemy(13 * TILE_SIZE, 7 * TILE_SIZE - 32),
    ];
  }

  _setState(next) {
    this.state = next;
  }

  _loop(timestamp) {
    // Ersten Frame überspringen: _lastTime initialisieren ohne riesigen dt-Sprung
    if (!this._loopStarted) {
      this._loopStarted = true;
      this._lastTime = timestamp;
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
        this._player.update(dt, inputManager, this._level.tileMap);

        // Gegner updaten
        for (const enemy of this._enemies) {
          if (enemy.active) enemy.update(dt, this._level.tileMap);
        }

        // Stomp-Kollision
        this._checkStomp();

        // Effekte updaten; inaktive entfernen
        for (const fx of this._effects) fx.update(dt);
        this._effects = this._effects.filter(fx => fx.active);

        // Kamera X: Spieler zentriert, an Levelbreite geclampt
        this._camera.x = this._player.x + this._player.w / 2 - CANVAS_WIDTH / 2;
        this._camera.x = Math.max(0, Math.min(this._camera.x, this._level.width - CANVAS_WIDTH));
        // Kamera Y: weich nach oben verschieben wenn Spieler hochschaut
        {
          const target = this._player.state === 'lookUp' ? -CAM_LOOKUP_OFFSET : 0;
          this._camLookOffset += (target - this._camLookOffset) * Math.min(CAM_LERP_SPEED * dt, 1);
          this._camera.y = Math.round(this._camLookOffset);
        }
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
    this._player?.draw(this.ctx, this._camera, imageCache);
    for (const enemy of this._enemies) {
      if (enemy.active) enemy.draw(this.ctx, this._camera, imageCache);
    }
    for (const fx of this._effects) {
      if (fx.active) fx.draw(this.ctx, this._camera, imageCache);
    }

    this.ctx.restore();

    // 3. HUD im Screen-Space (TODO)
  }

  /**
   * Stomp-Prüfung: Spieler landet auf einem Gegner von oben.
   *
   * Bedingung:
   *   - Spieler fällt (velY > 0)
   *   - AABB des Spielers überlappt mit dem Gegner
   *   - Unterkante des Spielers war in letztem Frame OBERHALB der Oberkante des Gegners
   *     (approximiert: Spieler-Unterkante liegt jetzt im oberen Drittel des Gegners)
   *
   * Bei Treffer:
   *   - Gegner stirbt, DeathEffect wird gespawnt
   *   - Spieler bekommt kleinen Aufprall-Bounce
   */
  _checkStomp() {
    if (this._player.velY <= 0) return;

    const p = this._player;

    for (const enemy of this._enemies) {
      if (!enemy.active || enemy.dead) continue;

      // AABB-Überlappung prüfen
      const overlapX = p.x < enemy.x + enemy.w && p.x + p.w > enemy.x;
      const overlapY = p.y < enemy.y + enemy.h && p.y + p.h > enemy.y;
      if (!overlapX || !overlapY) continue;

      // Spieler-Unterkante muss im oberen Drittel des Gegners liegen
      const stompZone = enemy.y + enemy.h / 3;
      if (p.y + p.h > stompZone) continue;

      // Treffer!
      enemy.stompDie();
      this._effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
      p.velY = -400;   // kleiner Bounce
    }
  }

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
}

