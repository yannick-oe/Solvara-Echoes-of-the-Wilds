import { Input } from "./input.js"; // Wir holen die Eingabe-Hilfe für Tastatur.
import { ImageCache } from "./imageCache.js"; // Wir holen den Bild-Cache, damit Bilder nur einmal geladen werden.
import { Camera } from "./camera.js"; // Wir holen die Kamera-Logik.
import { ParallaxLayer } from "./parallax.js"; // Wir holen den Hintergrund-Layer mit Parallax-Effekt.
import { Level } from "./level.js"; // Wir holen die Level-Klasse.
import { Player } from "./player.js"; // Wir holen die Spieler-Klasse.
import { CANVAS_HEIGHT, CANVAS_WIDTH, ASSET_PATHS, COLLECTIBLE_TYPE } from "./constants.js"; // Wir holen gemeinsame Werte und Bild-Pfade.
import { SpriteSheet } from "./spriteSheet.js";
import { HUD_FALLBACK_FRAMES, HUD_FRAMES, HUD_LAYOUT, HUD_SPRITE } from "./hudConfig.js";
import {
    Collectible,
    Enemy,
    getDefaultCollectiblesLayout,
    getDefaultEnemyLayout,
    isBodyHit,
    isStompHit,
} from "./worldEntities.js";

export class Game { // Diese Klasse steuert das ganze Spiel.
    constructor(canvas) { // Hier bauen wir das Spiel mit einem Canvas.
        this.canvas = canvas; // Wir speichern das Canvas.
        this.ctx = canvas.getContext("2d"); // Wir holen das 2D-Zeichenwerkzeug.
        this.ctx.imageSmoothingEnabled = false; // Pixel sollen scharf bleiben, nicht weichgezeichnet.

        this.input = new Input(); // Wir starten die Tastatur-Eingabe.
        this.imageCache = new ImageCache(); // Wir starten den Bild-Cache.
        this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT); // Wir starten eine Kamera in Canvas-Größe.

        this.level = null; // Das Level ist am Anfang noch nicht gebaut.
        this.player = null; // Der Spieler ist am Anfang noch nicht gebaut.
        this.parallaxLayers = []; // Die Hintergrund-Layer sind am Anfang leer.
        this.enemies = [];
        this.collectibles = [];
        this.score = 0;
        this.stars = 0;
        this.pickupSprite = null;
        this.hudSprite = null;
        this.hudAnimTime = 0;

        this.lastTime = 0; // Hier merken wir uns die Zeit vom letzten Frame.
        this.levelCompleted = false; // Am Anfang ist das Level noch nicht geschafft.

        this._rafId = null;
        this._running = false;
    } // Ende vom Konstruktor.

    async start() {
        if (this._running) return; // verhindert doppelten Start
        this._running = true;

        await this.loadAssets();

        const tileset = this.imageCache.get(ASSET_PATHS.tileSet);
        const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite);
        const pickupAtlas = this.imageCache.get(ASSET_PATHS.pickupAtlas);
        const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack);
        const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle);

        this.level = new Level(tileset);
        this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY);
        this.pickupSprite = new SpriteSheet(
            pickupAtlas,
            HUD_SPRITE.frameWidth,
            HUD_SPRITE.frameHeight
        );
        this.hudSprite = this.pickupSprite;
        this.enemies = this.createEnemies();
        this.collectibles = this.createCollectibles();

        const backScale = CANVAS_HEIGHT / bgBack.height;
        const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height;
        this.parallaxLayers = [
            new ParallaxLayer(bgBack, 0.1, backScale, 0),
            new ParallaxLayer(bgMiddle, 0.3, middleScale, 0),
        ];

        this.lastTime = performance.now();
        this._rafId = requestAnimationFrame(this.loop.bind(this));
    }

    createEnemies() {
        const layout = getDefaultEnemyLayout(this.level.tileDisplaySize);
        return layout.map((config) => new Enemy(config));
    }

    createCollectibles() {
        const layout = getDefaultCollectiblesLayout(this.level.tileDisplaySize);
        return layout.map((config) => new Collectible(config, this.pickupSprite));
    }

    resetWorldState() {
        this.level.resetRuntimeState();
        for (const enemy of this.enemies) enemy.reset();
        for (const item of this.collectibles) item.reset();
        this.score = 0;
        this.stars = 0;
    }

    async loadAssets() { // Diese Funktion lädt alle benötigten Bilder.
        await this.imageCache.loadAll([ // Wir geben alle Pfade an den Cache-Lader.
            ASSET_PATHS.backgroundBack, // Pfad zum hinteren Hintergrund.
            ASSET_PATHS.backgroundMiddle, // Pfad zum mittleren Hintergrund.
            ASSET_PATHS.tileSet, // Pfad zum Tileset.
            ASSET_PATHS.playerSprite, // Pfad zum Spieler-Spritesheet.
            ASSET_PATHS.pickupAtlas,
        ]); // Ende Bildliste.
    } // Ende von loadAssets.

    loop(timestamp) {
        const rawDt = (timestamp - this.lastTime) / 1000;
        const dt = Math.min(0.05, rawDt);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        this._rafId = requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) { // Diese Funktion berechnet Logik, nicht Grafik.
        if (!this.level || !this.player) { // Wenn Level oder Spieler noch nicht bereit sind...
            return; // ...brechen wir hier ab.
        } // Ende Sicherheitscheck.

        if (!this.levelCompleted) { // Nur wenn das Level noch nicht gewonnen wurde...
            this.player.update(dt, this.input, this.level); // ...aktualisieren wir den Spieler.
            this.updateHudAnimation(dt);
            this.updateSwitch();
            this.updateEnemies(dt);
            this.updateCollectibles(dt);
            this.tryApplyWorldReset();
            this.camera.follow(this.player, this.level.pixelWidth); // ...und lassen die Kamera folgen.

            if (this.level.touchesGoalHouse(this.player.getRect())) { // Wenn der Spieler das Ziel berührt...
                this.levelCompleted = true; // ...markieren wir das Level als geschafft.
            } // Ende Zielprüfung.
        } // Ende Update bei aktivem Level.

        this.input.endFrame(); // Wir löschen "nur in diesem Frame gedrückt"-Tasten.
    } // Ende von update.

    draw() { // Diese Funktion zeichnet ein komplettes Bild.
        this.ctx.fillStyle = "#5DC8E8"; // Himmel-Farbe wählen.
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Ganze Fläche mit Himmel füllen.

        if (!this.level || !this.player) { // Wenn noch nicht alles geladen ist...
            return; // ...und fertig für dieses Frame.
        } // Ende Ladebildschirm.

        for (let i = 0; i < this.parallaxLayers.length; i++) { // Wir zeichnen jeden Parallax-Layer.
            this.parallaxLayers[i].draw(this.ctx, this.canvas.width, this.canvas.height, this.camera.x); // Layer wird mit Kamera-X verschoben.
        } // Ende Layer-Schleife.

        this.level.draw(this.ctx, this.camera); // Level-Tiles zeichnen.
        this.drawCollectibles();
        this.drawEnemies();
        this.player.draw(this.ctx, this.camera); // Spieler zeichnen.

        this.drawHud();
    } // Ende von draw.

    updateHudAnimation(dt) {
        this.hudAnimTime += dt;
    }

    getAnimatedHudFrame(frames, fallback) {
        if (!frames || frames.length === 0) return fallback;
        const index = Math.floor(this.hudAnimTime * 10) % frames.length;
        return frames[index];
    }

    getPulseHudFrame(frames, fallback) {
        if (!frames || frames.length === 0) return fallback;
        const loopLength = frames.length * 2 - 2;
        if (loopLength <= 0) return frames[0];
        const index = Math.floor(this.hudAnimTime * 6) % loopLength;
        const pingPongIndex = index < frames.length ? index : loopLength - index;
        return frames[pingPongIndex];
    }

    drawHudIcon(frame, x, y, alpha = 1) {
        if (!this.hudSprite) return;
        const source = this.hudSprite.frameAt(frame.col, frame.row);
        const size = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(
            this.hudSprite.image,
            source.sx,
            source.sy,
            source.sw,
            source.sh,
            Math.round(x),
            Math.round(y),
            size,
            size
        );
        this.ctx.restore();
    }

    drawHeartsHud(startX, startY) {
        const frame = this.getPulseHudFrame(HUD_FRAMES.hearts, HUD_FALLBACK_FRAMES.heart);
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
        const iconStep = iconSize + HUD_LAYOUT.iconGap;
        for (let i = 0; i < this.player.maxHearts; i++) {
            const alpha = i < this.player.hearts ? 1 : 0.25;
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha);
        }
    }

    drawDiamondHud(startX, startY) {
        const frame = this.getAnimatedHudFrame(HUD_FRAMES.diamondSpin, HUD_FALLBACK_FRAMES.diamond);
        this.drawHudIcon(frame, startX, startY);
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "24px monospace";
        this.ctx.fillText(String(this.score), startX + iconSize + HUD_LAYOUT.scoreGap, startY + iconSize - 7);
    }

    drawStarsHud(startX, startY) {
        const idleFrame = HUD_FRAMES.starCoinSpin[0] || HUD_FALLBACK_FRAMES.starCoin;
        const spinFrame = this.getAnimatedHudFrame(HUD_FRAMES.starCoinSpin, HUD_FALLBACK_FRAMES.starCoin);
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale;
        const iconStep = iconSize + HUD_LAYOUT.iconGap;
        for (let i = 0; i < HUD_LAYOUT.maxStars; i++) {
            const collected = i < this.stars;
            const frame = collected ? spinFrame : idleFrame;
            const alpha = collected ? 1 : 0.25;
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha);
        }
    }

    drawHud() {
        this.drawHeartsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.heartsY);
        this.drawDiamondHud(HUD_LAYOUT.leftX, HUD_LAYOUT.diamondsY);
        this.drawStarsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.starsY);
    }

    updateSwitch() {
        const wantsInteract = this.input.wasPressed("KeyE") || this.input.wasPressed("ArrowUp");
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
            enemy.alive = false;
            this.player.stompBounce();
            this.score += 25;
            return;
        }

        if (isBodyHit(this.player, enemy)) {
            this.player.takeHit(enemy.x);
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
        if (collected.type === COLLECTIBLE_TYPE.diamond) this.score += collected.value;
        if (collected.type === COLLECTIBLE_TYPE.starCoin) {
            this.score += collected.value;
            this.stars += 1;
        }
        if (collected.type === COLLECTIBLE_TYPE.cherry) {
            if (this.player.maxHearts < this.player.hardMaxHearts) {
                this.player.maxHearts += 1;
                this.player.hearts = this.player.maxHearts;
                return;
            }
            this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + 1);
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
} // Ende der Game-Klasse.
