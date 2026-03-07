import { GAME_STATES, PLAYER_START_HEARTS, STAR_COIN_COUNT, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './constants.js';
import { imageCache } from './imageCache.js';
import { Player }      from '../entities/player.js';
import { AntEnemy }    from '../entities/enemies/ant.js';
import { FrogEnemy }   from '../entities/enemies/frog.js';
import { EagleEnemy }  from '../entities/enemies/eagle.js';
import { DeathEffect } from '../entities/effects/deathEffect.js';
import { Gem }         from '../entities/pickups/gem.js';
import { StarCoin }    from '../entities/pickups/starCoin.js';
import { Cherry }      from '../entities/pickups/cherry.js';
import { Door }        from '../entities/interactables/door.js';
import { Switch }      from '../entities/interactables/switch.js';
import { FloorSpike }  from '../entities/hazards/floorSpike.js';
import { CeilingSpike } from '../entities/hazards/ceilingSpike.js';
import { Hud }         from '../ui/hud.js';
import { audioManager } from './audioManager.js';
import { inputManager } from './input.js';
import { intervalManager } from './intervalManager.js';
import { Camera } from './camera.js';
import { ASSET_ENTRIES } from '../config/assetPaths.js';
import { Level } from '../world/level.js';
import { Parallax } from '../world/parallax.js';
import { StartScreen } from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen } from '../ui/screens/victoryScreen.js';
import { PauseScreen } from '../ui/screens/pauseScreen.js';

// Kamera-Lookup-Effekt
const CAM_LOOKUP_OFFSET = 80;  // px – Kamera hebt sich beim Hochschauen
const CAM_LERP_SPEED    = 6;   // Interpolationsgeschwindigkeit (1/s)

function createGameState() {
  return {
    hearts:         PLAYER_START_HEARTS,
    heartsMax:      5,
    score:          0,
    gemsCollected:  0,
    starCoins:      new Array(STAR_COIN_COUNT).fill(false),
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

    this._pickups       = [];
    this._interactables = [];   // Switch, Door
    this._hazards       = [];   // FloorSpike, CeilingSpike
    this._hud           = new Hud(imageCache);
    this._deathTimeoutId  = null;
    this._victoryPoseTimer = 0;  // > 0 while victory pose plays before screen switch

    this._startScreen   = new StartScreen(() => this._setState(GAME_STATES.PLAYING));
    this._gameOverScreen = new GameOverScreen(() => this.restart());
    this._victoryScreen  = new VictoryScreen(() => this.restart());
    this._pauseScreen    = new PauseScreen({
      onResume:      () => { this.state = GAME_STATES.PLAYING; },
      onRestart:     () => this.restart(),
      onBackToStart: () => { audioManager.stopMusic(); this.state = GAME_STATES.START; },
    });

    this._loop = this._loop.bind(this);
  }

  async start() {
    this._drawLoadingScreen();
    await imageCache.preload(ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');

    this._player  = this._createPlayer();
    this._enemies  = this._spawnEnemies();
    this._pickups  = this._spawnPickups();
    this._interactables = this._spawnInteractables();
    this._hazards       = this._spawnHazards();
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
    if (this._deathTimeoutId !== null) {
      clearTimeout(this._deathTimeoutId);
      this._deathTimeoutId = null;
    }
    intervalManager.stopAll();
    this.gameState      = createGameState();
    this._player        = this._createPlayer();
    this._enemies       = this._spawnEnemies();
    this._pickups       = this._spawnPickups();
    this._interactables = this._spawnInteractables();
    this._hazards       = this._spawnHazards();
    this._effects       = [];
    this._camera.x      = 0;
    this._camera.y      = 0;
    this._camLookOffset = 0;
    this._setState(GAME_STATES.PLAYING);
  }

  _createPlayer() {
    const spawn = this._level.content?.playerSpawn;
    const x = spawn?.x ?? 2 * TILE_SIZE;
    const y = spawn?.y ?? (8 * TILE_SIZE - 48);
    return new Player(x, y);
  }

  /** Erstellt Gegner aus den JSON-Definitionen des Levels. */
  _spawnEnemies() {
    const defs = this._level.content?.enemies ?? [];
    return defs.map(def => {
      switch (def.type) {
        case 'ant':   return new AntEnemy(def.x, def.y);
        case 'frog':  return new FrogEnemy(def.x, def.y);
        case 'eagle': return new EagleEnemy(def.x, def.minY, def.maxY);
        default:      return null;
      }
    }).filter(Boolean);
  }

  /** Erstellt Pickups aus den JSON-Definitionen des Levels. */
  _spawnPickups() {
    const defs = this._level.content?.pickups ?? [];
    return defs.map(def => {
      switch (def.type) {
        case 'gem':      return new Gem(def.x, def.y);
        case 'starCoin': return new StarCoin(def.x, def.y, def.slotIndex);
        case 'cherry':   return new Cherry(def.x, def.y);
        default:         return null;
      }
    }).filter(Boolean);
  }

  /** Erstellt Schalter und Tür aus den JSON-Definitionen des Levels. */
  _spawnInteractables() {
    const defs  = this._level.content?.interactables ?? [];
    // Zuerst alle Türen anlegen und per id indizieren
    const doors = {};
    for (const def of defs) {
      if (def.type === 'door') {
        doors[def.id] = new Door(def.x, def.y);
      }
    }
    // Dann Schalter anlegen und mit der gewünschten Tür verknüpfen
    const result = Object.values(doors);
    for (const def of defs) {
      if (def.type === 'switch') {
        const linked = doors[def.linkedDoor ?? 0];
        result.push(new Switch(def.x, def.y, linked));
      }
    }
    return result;
  }

  /** Erstellt Gefahren-Props aus den JSON-Definitionen des Levels. */
  _spawnHazards() {
    const defs = this._level.content?.hazards ?? [];
    return defs.map(def => {
      switch (def.type) {
        case 'floorSpike':
          return new FloorSpike(def.x, def.y);
        case 'ceilingSpike':
          return new CeilingSpike(def.x, def.y, def.triggers ?? false, def.triggerRange ?? 88);
        default:
          return null;
      }
    }).filter(Boolean);
  }

  _setState(next) {
    this.state = next;
    if (next === GAME_STATES.PLAYING) {
      audioManager.playMusic(
        'assets/audio/music/level01.ogg',
        'assets/audio/music/level01.mp3'
      );
    }
    if (next === GAME_STATES.VICTORY) {
      audioManager.stopMusic();
    }
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
        // Pause-Toggle: ESC während PLAYING
        if (inputManager.escPressed) {
          this._pauseScreen.reset();
          this.state = GAME_STATES.PAUSED;
          break;
        }
        // Sieges-Pose läuft: nur Timer herunterzählen, Welt eingefroren
        if (this._victoryPoseTimer > 0) {
          this._victoryPoseTimer -= dt;
          if (this._victoryPoseTimer <= 0) {
            this._setState(GAME_STATES.VICTORY);
          }
          break;
        }

        this._player.update(dt, inputManager, this._level.tileMap);

        // Gegner updaten
        for (const enemy of this._enemies) {
          if (enemy.active) enemy.update(dt, this._level.tileMap);
        }

        // Gefahren updaten (CeilingSpike-Fallen)
        const groundY = this._level.tileMap.height - this._level.tileMap.height % 48;
        for (const hz of this._hazards) {
          if (hz.update) hz.update(dt, this._player, groundY);
        }

        // Pickups animieren
        for (const pickup of this._pickups) {
          if (pickup.active) pickup.update(dt);
        }

        // Stomp-Kollision
        this._checkStomp();

        // Gegner-Körperkontakt (Schaden) – nur wenn nicht sterbend
        if (!this._player.dying) {
          this._checkEnemyDamage();

          // Pickup-Kollision
          this._checkPickups();

          // Schalter + Zielzone prüfen
          this._checkInteractables();

          // Spike-Kollision prüfen
          this._checkHazards();
        }

        // Spieler hat den Bildschirm unten verlassen → Level neu starten
        if (this._player.dying && this._player.y > this._level.height + CANVAS_HEIGHT) {
          this._resetLevelState();
        }

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
      case GAME_STATES.PAUSED:
        this._pauseScreen.handleInput(inputManager);
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
      case GAME_STATES.PAUSED:
        // Spielwelt eingefroren im Hintergrund, Pause-Overlay darüber
        this._drawWorld();
        this._pauseScreen.draw(this.ctx);
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

    // Gefahren hinter dem Spieler zeichnen
    for (const hz of this._hazards) {
      hz.draw(this.ctx, this._camera, imageCache);
    }

    // Interaktierbare Objekte (hinter Spieler, damit diese sichtbar bleiben)
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

    this.ctx.restore();

    // 3. HUD im Screen-Space
    this._hud.draw(this.ctx, this.gameState);
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

  /** AABB-Überlappung Spieler ↔ Pickup; bei Treffer collect() aufrufen. */
  _checkPickups() {
    const p = this._player;
    for (const pickup of this._pickups) {
      if (!pickup.active) continue;
      if (p.intersects(pickup)) {
        pickup.collect(p, this.gameState);
        if (pickup instanceof StarCoin) {
          audioManager.playSfx('assets/audio/sfx/pickupStarCoin.mp3');
        }
      }
    }
  }

  /** Schalter automatisch bei Berührung aktivieren; Tür-Blocking und Sieges-Auslöser. */
  _checkInteractables() {
    const p = this._player;
    for (const obj of this._interactables) {
      if (obj instanceof Switch) {
        if (p.intersects(obj)) obj.activate();
      } else if (obj instanceof Door) {
        if (obj.open) {
          // Offene Tür: Spieler betritt sie → Sieges-Sequenz starten
          if (p.intersects(obj) && this._victoryPoseTimer <= 0) {
            this._startVictorySequence();
          }
        } else {
          // Geschlossene Tür: Spieler zurückdrängen
          if (obj.blocks(p)) {
            const pushRight = p.x + p.w / 2 < obj.x + obj.w / 2;
            p.x    = pushRight ? obj.x - p.w : obj.x + obj.w;
            p.velX = 0;
          }
        }
      }
    }
  }

  /** Spieler in Sieges-Pose einfrieren; nach kurzer Verzögerung zu VICTORY wechseln. */
  _startVictorySequence() {
    this._player.startVictoryPose();
    this._victoryPoseTimer = 0.9;   // Sekunden Sieges-Pose sichtbar
  }

  /**
   * Prüft ob der Spieler eine Spike-Gefahr berührt.
   * FloorSpike: statisch, immer tödlich.
   * CeilingSpike: nur tödlich während des Falls (isLethal).
   */
  _checkHazards() {
    const p = this._player;
    for (const hz of this._hazards) {
      if (!hz.active) continue;
      const lethal = hz instanceof CeilingSpike ? hz.isLethal : true;
      if (lethal && p.intersects(hz)) {
        this.gameState.hearts = 0;
        this._handlePlayerDeath();
        return;   // nur ein Treffer pro Frame
      }
    }
  }

  /**
   * Prüft Kollision zwischen Spieler und Gegnerkörper.
   * Schäden werden nur vergeben wenn kein gültiger Stomp vorliegt.
   * Pro Frame kann maximal ein Treffer verarbeitet werden.
   */
  _checkEnemyDamage() {
    if (this._player.dying) return;
    const p = this._player;
    for (const enemy of this._enemies) {
      if (!enemy.active || enemy.dead) continue;
      if (!p.intersects(enemy)) continue;

      // Stomp-Zone ausschließen: fällt der Spieler und trifft oben aufs Drittel?
      if (p.velY > 0 && p.y + p.h <= enemy.y + enemy.h / 3) continue;

      const tookDamage = p.takeDamage(enemy.x + enemy.w / 2);
      if (!tookDamage) break;

      this.gameState.hearts--;
      if (this.gameState.hearts <= 0) {
        this.gameState.hearts = 0;
        this._handlePlayerDeath();
      }
      break;  // nur ein Treffer pro Frame
    }
  }

  /** Setzt den Spieler in den Sterbe-Zustand. Der Reset erfolgt wenn er vom Screen fällt. */
  _handlePlayerDeath() {
    this._player.startDying();
  }

  /**
   * Setzt den Level-Zustand vollständig zurück (Spieler, Gegner, Pickups, Kamera).
   * Pickups werden neu gespawnt, sodass ein vollständiger Level-Reset erfolgt.
   */
  _resetLevelState() {
    this._deathTimeoutId = null;
    this.gameState       = createGameState();
    this._player         = this._createPlayer();
    this._enemies        = this._spawnEnemies();
    this._pickups        = this._spawnPickups();
    this._interactables  = this._spawnInteractables();
    this._hazards        = this._spawnHazards();
    this._effects        = [];
    this._camera.x       = 0;
    this._camera.y       = 0;
    this._camLookOffset  = 0;
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

