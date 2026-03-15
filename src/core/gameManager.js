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
import { SFX_VOLUME }   from '../config/audioConfig.js';
import { PROP_REGISTRY, PROP_ASSET_ENTRIES } from '../config/propConfig.js';
import { Level } from '../world/level.js';
import { Parallax } from '../world/parallax.js';
import { StartScreen } from '../ui/screens/startScreen.js';
import { GameOverScreen } from '../ui/screens/gameOverScreen.js';
import { VictoryScreen } from '../ui/screens/victoryScreen.js';
import { PauseScreen } from '../ui/screens/pauseScreen.js';
import { TouchControls } from '../ui/touchControls.js';

const CAM_LOOKUP_OFFSET = 80;
const CAM_LERP_SPEED    = 6;

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
    this._deathTimeoutId       = null;
    this._victoryPoseTimer     = 0;
    this._levelTimer           = 0;
    this._finalLevelTime       = 0;
    this._victoryTransitionId  = null;

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

  async start() {
    this._drawLoadingScreen();
    await imageCache.preload(ASSET_ENTRIES);
    await imageCache.preload(PROP_ASSET_ENTRIES);
    await this._level.load('assets/data/levels/level_01.json');

    this._player  = this._createPlayer();
    this._enemies  = this._spawnEnemies();
    this._pickups  = this._spawnPickups();
    this._interactables = this._spawnInteractables();
    this._hazards       = this._spawnHazards();
    this._props         = this._spawnProps();
    this._effects  = [];
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

  restart() {
    if (this._deathTimeoutId !== null) {
      clearTimeout(this._deathTimeoutId);
      this._deathTimeoutId = null;
    }
    if (this._victoryTransitionId !== null) {
      clearTimeout(this._victoryTransitionId);
      this._victoryTransitionId = null;
    }
    intervalManager.stopAll();
    this._levelTimer       = 0;
    this._victoryPoseTimer = 0;
    this._finalLevelTime   = 0;
    this.gameState         = createGameState();
    this._player        = this._createPlayer();
    this._enemies       = this._spawnEnemies();
    this._pickups       = this._spawnPickups();
    this._interactables = this._spawnInteractables();
    this._hazards       = this._spawnHazards();
    this._props         = this._spawnProps();
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

  _spawnInteractables() {
    const defs  = this._level.content?.interactables ?? [];

    const doors = {};
    for (const def of defs) {
      if (def.type === 'door') {
        doors[def.id] = new Door(def.x, def.y);
      }
    }

    const result = Object.values(doors);
    for (const def of defs) {
      if (def.type === 'switch') {
        const linked = doors[def.linkedDoor ?? 0];
        result.push(new Switch(def.x, def.y, linked));
      }
    }
    return result;
  }

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

  _spawnProps() {
    const defs = this._level.content?.props ?? [];
    return defs.map(def => {
      const entry = PROP_REGISTRY[def.asset];
      if (!entry) return null;

      const base     = entry.defaultScale ?? 1;
      const instU    = def.scale  ?? 1;
      const scaleX   = base * (def.scaleX ?? instU);
      const scaleY   = base * (def.scaleY ?? instU);

      return {
        key:    entry.key,
        x:      def.x     ?? 0,
        y:      def.y     ?? 0,
        layer:  def.layer ?? 'back',
        scaleX,
        scaleY,
        flipX:  def.flipX ?? false,
        flipY:  def.flipY ?? false,
        alpha:  def.alpha ?? 1,
      };
    }).filter(Boolean);
  }

  _setState(next) {
    this.state = next;
    if (next === GAME_STATES.PLAYING) {
      audioManager.playMusic('assets/audio/music/level01.ogg');
    }

  }

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

  _update(dt) {
    switch (this.state) {
      case GAME_STATES.START:
        audioManager.playMusic('assets/audio/music/startMenu.ogg');
        this._startScreen.handleInput(inputManager);
        break;
      case GAME_STATES.PLAYING:

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
          break;
        }

        if (inputManager.pausePressed) {
          this._pauseScreen.reset();
          this.state = GAME_STATES.PAUSED;
          break;
        }

        this._levelTimer += dt;

        this._player.update(dt, inputManager, this._level.tileMap);

        for (const enemy of this._enemies) {
          if (enemy.active) enemy.update(dt, this._level.tileMap);
        }

        const groundY = this._level.tileMap.height - this._level.tileMap.height % 48;
        for (const hz of this._hazards) {
          if (hz.update) hz.update(dt, this._player, groundY);
        }

        for (const pickup of this._pickups) {
          if (pickup.active) pickup.update(dt);
        }

        this._checkStomp();

        this._checkRollKill();

        if (!this._player.dying) {
          this._checkEnemyDamage();

          this._checkPickups();

          this._checkInteractables();

          this._checkHazards();
        }

        this._hud.update(dt);

        for (const fx of this._effects) fx.update(dt);
        this._effects = this._effects.filter(fx => fx.active);

        this._camera.follow(this._player);

        {
          const target = this._player.state === 'lookUp' ? -CAM_LOOKUP_OFFSET : 0;
          this._camLookOffset += (target - this._camLookOffset) * Math.min(CAM_LERP_SPEED * dt, 1);
          this._camera.y += this._camLookOffset;
        }
        this._camera.clamp(this._level.width, this._level.height);
        break;
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

  _checkStomp() {
    if (this._player.velY <= 0) return;

    const p = this._player;

    for (const enemy of this._enemies) {
      if (!enemy.active || enemy.dead) continue;

      const overlapX = p.x < enemy.x + enemy.w && p.x + p.w > enemy.x;
      const overlapY = p.y < enemy.y + enemy.h && p.y + p.h > enemy.y;
      if (!overlapX || !overlapY) continue;

      const stompZone = enemy.y + enemy.h / 3;
      if (p.y + p.h > stompZone) continue;

      enemy.stompDie();
      if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
      this._effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
      p.velY = -400;
    }
  }

  _checkRollKill() {
    if (!this._player.isRolling()) return;
    const p = this._player;
    for (const enemy of this._enemies) {
      if (!enemy.active || enemy.dead) continue;
      if (!p.intersects(enemy)) continue;
      enemy.stompDie();
      if (enemy.deathSound) audioManager.playSfx(enemy.deathSound, { volume: SFX_VOLUME.enemyKill });
      this._effects.push(new DeathEffect(enemy.x + enemy.w / 2, enemy.y));
      p.rollHit();
    }
  }

  _checkPickups() {
    const p = this._player;
    for (const pickup of this._pickups) {
      if (!pickup.active) continue;
      if (!p.intersects(pickup)) continue;

      pickup.collect(p, this.gameState);

      const sx = pickup.x + pickup.w / 2 - this._camera.x;
      const sy = pickup.y + pickup.h / 2 - this._camera.y;

      if (pickup instanceof StarCoin) {
        audioManager.playSfx('assets/audio/sfx/pickupStarCoin.mp3', { volume: SFX_VOLUME.pickup });
        this._hud.notify('starCoin', sx, sy, pickup.slotIndex);
      } else if (pickup instanceof Gem) {
        audioManager.playSfx('assets/audio/sfx/pickupGem.mp3', { volume: SFX_VOLUME.pickup });
        this._hud.notify('gem', sx, sy);
      } else if (pickup instanceof Cherry) {
        audioManager.playSfx('assets/audio/sfx/pickupCherry.mp3', { volume: SFX_VOLUME.pickup });
        this._hud.notify('heal', sx, sy);
      }
    }
  }

  _checkInteractables() {
    const p = this._player;
    for (const obj of this._interactables) {
      if (obj instanceof Switch) {
        if (p.intersects(obj) && obj.activate()) {
          audioManager.playSfx('assets/audio/sfx/switchSound.mp3', { volume: SFX_VOLUME.switch });
        }
      } else if (obj instanceof Door) {

        if (obj.isOpen && p.intersects(obj) && this._victoryPoseTimer <= 0) {
          this._startVictorySequence();
        }
      }
    }
  }

  _startVictorySequence() {
    this._player.startVictoryPose();
    this._victoryPoseTimer = 0.65;
    this._finalLevelTime   = this._levelTimer;
  }

  _checkHazards() {
    const p = this._player;
    for (const hz of this._hazards) {
      if (!hz.active) continue;
      const lethal = hz instanceof CeilingSpike ? hz.isLethal : true;
      if (lethal && p.intersects(hz)) {
        this.gameState.hearts = 0;
        this._hud.notify('damage', p.x + p.w / 2 - this._camera.x, p.y - this._camera.y);
        this._handlePlayerDeath();
        return;
      }
    }
  }

  _checkEnemyDamage() {
    if (this._player.dying) return;
    if (this._player.isRolling()) return;
    const p = this._player;
    for (const enemy of this._enemies) {
      if (!enemy.active || enemy.dead) continue;
      if (!p.intersects(enemy)) continue;

      if (p.velY > 0 && p.y + p.h <= enemy.y + enemy.h / 3) continue;

      const tookDamage = p.takeDamage(enemy.x + enemy.w / 2);
      if (!tookDamage) break;

      this.gameState.hearts--;

      this._hud.notify('damage', p.x + p.w / 2 - this._camera.x, p.y - this._camera.y);
      if (this.gameState.hearts <= 0) {
        this.gameState.hearts = 0;
        this._handlePlayerDeath();
      } else {
        audioManager.playSfx('assets/audio/sfx/hurtSound.mp3', { volume: SFX_VOLUME.hurt });
      }
      break;
    }
  }

  _handlePlayerDeath() {
    this._player.startDying();
    audioManager.playSfx('assets/audio/sfx/deathSound.mp3', { volume: SFX_VOLUME.death });

    audioManager.fadeOutMusic(300);

    this._deathTimeoutId = setTimeout(() => {
      this._deathTimeoutId = null;
      this._gameOverScreen.show();
      this._setState(GAME_STATES.GAMEOVER);
    }, 400);
  }

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
