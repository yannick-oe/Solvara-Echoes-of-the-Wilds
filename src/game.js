import { Input } from "./input.js";
import { ImageCache } from "./imageCache.js";
import { Camera } from "./camera.js";
import { ParallaxLayer } from "./parallax.js";
import { Level } from "./level.js";
import { Player } from "./player.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ASSET_PATHS,
  COLLECTIBLE_TYPE,
} from "./constants.js";
import { SpriteSheet } from "./spriteSheet.js";
import {
  HUD_FALLBACK_FRAMES,
  HUD_FRAMES,
  HUD_LAYOUT,
  HUD_SPRITE,
} from "./hudConfig.js";
import {
  Collectible,
  Enemy,
  getDefaultCollectiblesLayout,
  getDefaultEnemyLayout,
  isBodyHit,
  isStompHit,
} from "./worldEntities.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false; // Pixel-Art soll schaerf bleiben, keine Weichzeichnung.

    this.input = new Input();
    this.imageCache = new ImageCache();
    this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT); // Kamera zeigt immer einen Canvas-grossen Ausschnitt.

    this.level = null;
    this.player = null;
    this.parallaxLayers = []; // Reihenfolge der Hintergrund-Layer (weit hinten -> naeher vorne).
    this.enemies = []; // Laufende Gegnerinstanzen aus dem Level-Layout.
    this.collectibles = []; // Alle sammelbaren Objekte des Levels.
    this.score = 0; // Gesamtscore (Diamanten + Sternmuenzen + Gegner-Bounce).
    this.stars = 0; // Anzahl eingesammelter Sternmuenzen fuer das HUD.
    this.enemyAtlasImage = null;
    this.pickupSprite = null;
    this.hudSprite = null;
    this.hudAnimTime = 0; // Gemeinsame Zeitbasis fuer HUD-Animationen.

    this.lastTime = 0;
    this.levelCompleted = false; // Wird true, sobald der Spieler das Zielhaus beruehrt.

    this._rafId = null;
    this._running = false; // Schutz vor doppeltem Start der Game-Loop.
  }

  async start() {
    if (this._running) return;
    this._running = true;

    await this.loadAssets();

    const tileset = this.imageCache.get(ASSET_PATHS.tileSet);
    const propsAtlas = this.imageCache.get(ASSET_PATHS.propsAtlas);
    const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite);
    const enemyAtlas = this.imageCache.get(ASSET_PATHS.enemyAtlas);
    const pickupAtlas = this.imageCache.get(ASSET_PATHS.pickupAtlas);
    const uiDoorClosed = this.imageCache.get(ASSET_PATHS.uiDoorClosed);
    const uiDoorOpen = this.imageCache.get(ASSET_PATHS.uiDoorOpen);
    const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack);
    const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle);

    this.level = new Level(tileset, propsAtlas, uiDoorClosed, uiDoorOpen);
    this.player = new Player(
      playerSprite,
      this.level.spawnX,
      this.level.spawnY,
    ); // Spawn kommt direkt aus der Level-Definition.
    this.enemyAtlasImage = enemyAtlas;
    this.pickupSprite = new SpriteSheet(
      pickupAtlas,
      HUD_SPRITE.frameWidth,
      HUD_SPRITE.frameHeight,
    );
    this.hudSprite = this.pickupSprite; // HUD nutzt aktuell dieselbe Atlas-Grafik wie Pickups.
    this.enemies = this.createEnemies();
    this.collectibles = this.createCollectibles();

    const backScale = CANVAS_HEIGHT / bgBack.height;
    const middleScale = (CANVAS_HEIGHT * 0.4) / bgMiddle.height;
    this.parallaxLayers = [
      new ParallaxLayer(bgBack, 0.1, backScale, 0), // Hinterster Layer bewegt sich langsam fuer Tiefenwirkung.
      new ParallaxLayer(bgMiddle, 0.5, middleScale, 0), // Vorderer Layer reagiert staerker auf Kamera-Bewegung.
    ];

    this.lastTime = performance.now();
    this._rafId = requestAnimationFrame(this.loop.bind(this));
  }

  createEnemies() {
    const layout = getDefaultEnemyLayout(this.level.tileDisplaySize); // Tile-Groesse steuert Startkoordinaten der Gegner.
    return layout.map((config) => new Enemy(config, this.enemyAtlasImage));
  }

  createCollectibles() {
    const layout = getDefaultCollectiblesLayout(this.level.tileDisplaySize);
    return layout.map((config) => new Collectible(config, this.pickupSprite));
  }

  resetWorldState() {
    this.level.resetRuntimeState(); // Schalter/Tuer im Level auf Ausgangszustand zuruecksetzen.
    for (const enemy of this.enemies) enemy.reset(); // Gegner wieder an ihre Spawn-Positionen.
    for (const item of this.collectibles) item.reset(); // Alle Pickups wieder sichtbar/sammelbar.
    this.score = 0;
    this.stars = 0;
  }

  async loadAssets() {
    await this.imageCache.loadAll([
      ASSET_PATHS.backgroundBack,
      ASSET_PATHS.backgroundMiddle,
      ASSET_PATHS.tileSet,
      ASSET_PATHS.propsAtlas,
      ASSET_PATHS.playerSprite,
      ASSET_PATHS.enemyAtlas,
      ASSET_PATHS.pickupAtlas,
      ASSET_PATHS.uiDoorClosed,
      ASSET_PATHS.uiDoorOpen,
    ]);
  }

  loop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 1000; // Verstrichene Zeit seit letztem Frame in Sekunden.
    const dt = Math.min(0.05, rawDt); // Delta wird begrenzt, damit Physik bei Lag nicht explodiert.
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    this._rafId = requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    if (!this.level || !this.player) {
      return;
    }

    if (!this.levelCompleted) {
      this.player.update(dt, this.input, this.level);
      this.updateHudAnimation(dt);
      this.updateSwitch();
      this.updateEnemies(dt);
      this.updateCollectibles(dt);
      this.tryApplyWorldReset(); // Reagiert auf Tod/Respawn und setzt Weltobjekte zurueck.
      this.camera.follow(this.player, this.level.pixelWidth); // Kamera folgt horizontal dem Spieler im Levelbereich.

      if (this.level.touchesGoalHouse(this.player.getRect())) {
        this.levelCompleted = true;
      }
    }

    this.input.endFrame(); // One-frame Tastenflags (pressed/released) zuruecksetzen.
  }

  draw() {
    this.ctx.fillStyle = "#5DC8E8"; // Basis-Himmel hinter allen Layern.
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.level || !this.player) {
      return;
    }

    for (let i = 0; i < this.parallaxLayers.length; i++) {
      this.parallaxLayers[i].draw(
        this.ctx,
        this.canvas.width,
        this.canvas.height,
        this.camera.x,
      );
    }

    this.level.draw(this.ctx, this.camera);
    this.drawCollectibles();
    this.drawEnemies();
    this.player.draw(this.ctx, this.camera);

    this.drawHud();
  }

  updateHudAnimation(dt) {
    this.hudAnimTime += dt; // Laesst Herz/Diamant/Stern-Animationen synchron laufen.
  }

  getAnimatedHudFrame(frames, fallback) {
    if (!frames || frames.length === 0) return fallback;
    const index = Math.floor(this.hudAnimTime * 10) % frames.length; // 10 = feste Animationsgeschwindigkeit fuer Spin.
    return frames[index];
  }

  getPulseHudFrame(frames, fallback) {
    if (!frames || frames.length === 0) return fallback;
    const loopLength = frames.length * 2 - 2; // Hin- und Ruecklauf durch dieselben Frames.
    if (loopLength <= 0) return frames[0];
    const index = Math.floor(this.hudAnimTime * 6) % loopLength;
    const pingPongIndex = index < frames.length ? index : loopLength - index; // Macht aus 0..N..0 statt 0..N Sprung.
    return frames[pingPongIndex];
  }

  drawHudIcon(frame, x, y, alpha = 1) {
    if (!this.hudSprite) return;
    const source =
      frame.sx !== undefined
        ? frame
        : this.hudSprite.frameAt(frame.col, frame.row);
    const size = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Zielgroesse des Icons im HUD in Pixeln.
    this.ctx.save();
    this.ctx.globalAlpha = alpha; // 0.25 wird fuer "nicht vorhanden" oder "nicht gesammelt" genutzt.
    this.ctx.drawImage(
      this.hudSprite.image,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      Math.round(x),
      Math.round(y),
      size,
      size,
    );
    this.ctx.restore();
  }

  drawHeartsHud(startX, startY) {
    const frame = this.getPulseHudFrame(
      HUD_FRAMES.hearts,
      HUD_FALLBACK_FRAMES.heart,
    );
    const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
    const iconStep = iconSize + HUD_LAYOUT.iconGap;
    for (let i = 0; i < this.player.maxHearts; i++) {
      const alpha = i < this.player.hearts ? 1 : 0.25; // Aktuelle Herzen voll, fehlende Herzen ausgegraut.
      this.drawHudIcon(frame, startX + i * iconStep, startY, alpha);
    }
  }

  drawDiamondHud(startX, startY) {
    const frame = this.getAnimatedHudFrame(
      HUD_FRAMES.diamondSpin,
      HUD_FALLBACK_FRAMES.diamond,
    );
    this.drawHudIcon(frame, startX, startY);
    const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "24px monospace";
    this.ctx.fillText(
      String(this.score),
      startX + iconSize + HUD_LAYOUT.scoreGap,
      startY + iconSize - 7,
    ); // Score rechts neben dem Diamant-Icon.
  }

  drawStarsHud(startX, startY) {
    const idleFrame =
      HUD_FRAMES.starCoinSpin[0] || HUD_FALLBACK_FRAMES.starCoin;
    const spinFrame = this.getAnimatedHudFrame(
      HUD_FRAMES.starCoinSpin,
      HUD_FALLBACK_FRAMES.starCoin,
    );
    const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
    const iconStep = iconSize + HUD_LAYOUT.iconGap;
    for (let i = 0; i < HUD_LAYOUT.maxStars; i++) {
      const collected = i < this.stars; // this.stars ist der aktuelle Fortschritt im Level.
      const frame = collected ? spinFrame : idleFrame;
      const alpha = collected ? 1 : 0.25;
      this.drawHudIcon(frame, startX + i * iconStep, startY, alpha);
    }
  }

  drawHud() {
    this.drawHeartsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.heartsY);
    this.drawStarsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.starsY);
    this.drawDiamondHud(HUD_LAYOUT.leftX, HUD_LAYOUT.diamondsY);
  }

  updateSwitch() {
    const wantsInteract =
      this.input.wasPressed("KeyE") || this.input.wasPressed("ArrowUp"); // Interaktions-Trigger fuer den Level-Schalter.
    this.level.tryActivateSwitch(this.player.getRect(), wantsInteract);
  }

  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      enemy.update(dt, this.level);
      this.resolveEnemyContact(enemy);
    }
  }

  resolveEnemyContact(enemy) {
    if (!enemy.alive) return;
    if (isStompHit(this.player, enemy)) {
      enemy.alive = false; // Gegner wird nach Stomp deaktiviert.
      this.player.stompBounce(); // Spieler bekommt den typischen Bounce nach oben.
      this.score += 25; // Bonus fuer erfolgreichen Stomp.
      return;
    }

    if (isBodyHit(this.player, enemy)) {
      this.player.takeHit(enemy.x); // Schaden + Knockback-Richtung basierend auf Gegner-X.
    }
  }

  updateCollectibles(dt) {
    const playerRect = this.player.getRect();
    for (const item of this.collectibles) {
      item.update(dt);
      item.tryCollect(playerRect, (collected) => this.onCollect(collected));
    }
  }

  onCollect(collected) {
    if (collected.type === COLLECTIBLE_TYPE.diamond)
      this.score += collected.value; // value ist in constants als diamondScore definiert.
    if (collected.type === COLLECTIBLE_TYPE.starCoin) {
      this.score += collected.value;
      this.stars += 1; // Zaehler fuer die Stern-Icons im HUD.
    }
    if (collected.type === COLLECTIBLE_TYPE.cherry) {
      if (this.player.maxHearts < this.player.hardMaxHearts) {
        this.player.maxHearts += 1; // Kirsche erweitert zuerst dauerhaft die max. Herzen.
        this.player.hearts = this.player.maxHearts; // Danach direkt voll heilen.
        return;
      }
      this.player.hearts = Math.min(
        this.player.maxHearts,
        this.player.hearts + 1,
      ); // Sonst nur normale Heilung um +1.
    }
  }

  tryApplyWorldReset() {
    if (!this.player.consumeWorldResetRequest()) return;
    this.resetWorldState();
  }

  drawEnemies() {
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx, this.camera);
    }
  }

  drawCollectibles() {
    for (const item of this.collectibles) {
      item.draw(this.ctx, this.camera);
    }
  }
}
