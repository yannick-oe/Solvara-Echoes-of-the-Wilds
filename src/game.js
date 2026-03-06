import { Input } from "./input.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { ImageCache } from "./imageCache.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { Camera } from "./camera.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { ParallaxLayer } from "./parallax.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { Level } from "./level.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { Player } from "./player.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { CANVAS_HEIGHT, CANVAS_WIDTH, ASSET_PATHS, COLLECTIBLE_TYPE } from "./constants.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { SpriteSheet } from "./spriteSheet.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { HUD_FALLBACK_FRAMES, HUD_FRAMES, HUD_LAYOUT, HUD_SPRITE } from "./hudConfig.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { // Importiert eine in dieser Datei verwendete Abhaengigkeit.
    Collectible, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    Enemy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    getDefaultCollectiblesLayout, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    getDefaultEnemyLayout, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    isBodyHit, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    isStompHit, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
} from "./worldEntities.js"; // Fuehrt diesen Schritt im aktuellen Ablauf aus.

export class Game { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
    // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
    constructor(canvas) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.canvas = canvas; // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx = canvas.getContext("2d"); // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx.imageSmoothingEnabled = false; // Speichert Daten in der aktuellen Objektinstanz.

        this.input = new Input(); // Speichert Daten in der aktuellen Objektinstanz.
        this.imageCache = new ImageCache(); // Speichert Daten in der aktuellen Objektinstanz.
        this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT); // Speichert Daten in der aktuellen Objektinstanz.

        this.level = null; // Speichert Daten in der aktuellen Objektinstanz.
        this.player = null; // Speichert Daten in der aktuellen Objektinstanz.
        this.parallaxLayers = []; // Speichert Daten in der aktuellen Objektinstanz.
        this.enemies = []; // Speichert Daten in der aktuellen Objektinstanz.
        this.collectibles = []; // Speichert Daten in der aktuellen Objektinstanz.
        this.score = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.stars = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.enemyAtlasImage = null; // Speichert Daten in der aktuellen Objektinstanz.
        this.pickupSprite = null; // Speichert Daten in der aktuellen Objektinstanz.
        this.hudSprite = null; // Speichert Daten in der aktuellen Objektinstanz.
        this.hudAnimTime = 0; // Speichert Daten in der aktuellen Objektinstanz.

        this.lastTime = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.levelCompleted = false; // Speichert Daten in der aktuellen Objektinstanz.

        this._rafId = null; // Speichert Daten in der aktuellen Objektinstanz.
        this._running = false; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "start" in dieser Datei.
    async start() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (this._running) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this._running = true; // Speichert Daten in der aktuellen Objektinstanz.

        await this.loadAssets(); // Wartet, bis die asynchrone Operation abgeschlossen ist.

        const tileset = this.imageCache.get(ASSET_PATHS.tileSet); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const propsAtlas = this.imageCache.get(ASSET_PATHS.propsAtlas); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const enemyAtlas = this.imageCache.get(ASSET_PATHS.enemyAtlas); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const pickupAtlas = this.imageCache.get(ASSET_PATHS.pickupAtlas); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const uiDoorClosed = this.imageCache.get(ASSET_PATHS.uiDoorClosed); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const uiDoorOpen = this.imageCache.get(ASSET_PATHS.uiDoorOpen); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

        this.level = new Level(tileset, propsAtlas, uiDoorClosed, uiDoorOpen); // Speichert Daten in der aktuellen Objektinstanz.
        this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY); // Speichert Daten in der aktuellen Objektinstanz.
        this.enemyAtlasImage = enemyAtlas; // Speichert Daten in der aktuellen Objektinstanz.
        this.pickupSprite = new SpriteSheet( // Speichert Daten in der aktuellen Objektinstanz.
            pickupAtlas, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            HUD_SPRITE.frameWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            HUD_SPRITE.frameHeight // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.hudSprite = this.pickupSprite; // Speichert Daten in der aktuellen Objektinstanz.
        this.enemies = this.createEnemies(); // Speichert Daten in der aktuellen Objektinstanz.
        this.collectibles = this.createCollectibles(); // Speichert Daten in der aktuellen Objektinstanz.

        const backScale = CANVAS_HEIGHT / bgBack.height; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.parallaxLayers = [ // Speichert Daten in der aktuellen Objektinstanz.
            new ParallaxLayer(bgBack, 0.1, backScale, 0), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            new ParallaxLayer(bgMiddle, 0.3, middleScale, 0), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.

        this.lastTime = performance.now(); // Speichert Daten in der aktuellen Objektinstanz.
        this._rafId = requestAnimationFrame(this.loop.bind(this)); // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "createEnemies" in dieser Datei.
    createEnemies() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const layout = getDefaultEnemyLayout(this.level.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        return layout.map((config) => new Enemy(config, this.enemyAtlasImage)); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "createCollectibles" in dieser Datei.
    createCollectibles() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const layout = getDefaultCollectiblesLayout(this.level.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        return layout.map((config) => new Collectible(config, this.pickupSprite)); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "resetWorldState" in dieser Datei.
    resetWorldState() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.level.resetRuntimeState(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        for (const enemy of this.enemies) enemy.reset(); // Iteriert in einer Schleife ueber Elemente oder Indizes.
        for (const item of this.collectibles) item.reset(); // Iteriert in einer Schleife ueber Elemente oder Indizes.
        this.score = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.stars = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "loadAssets" in dieser Datei.
    async loadAssets() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        await this.imageCache.loadAll([ // Wartet, bis die asynchrone Operation abgeschlossen ist.
            ASSET_PATHS.backgroundBack, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.backgroundMiddle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.tileSet, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.propsAtlas, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.playerSprite, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.enemyAtlas, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.pickupAtlas, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.uiDoorClosed, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ASSET_PATHS.uiDoorOpen, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ]); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "loop" in dieser Datei.
    loop(timestamp) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const rawDt = (timestamp - this.lastTime) / 1000; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const dt = Math.min(0.05, rawDt); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.lastTime = timestamp; // Speichert Daten in der aktuellen Objektinstanz.

        this.update(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.draw(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

        this._rafId = requestAnimationFrame(this.loop.bind(this)); // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "update" in dieser Datei.
    update(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (!this.level || !this.player) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }

        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (!this.levelCompleted) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            this.player.update(dt, this.input, this.level); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.updateHudAnimation(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.updateSwitch(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.updateEnemies(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.updateCollectibles(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.tryApplyWorldReset(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.camera.follow(this.player, this.level.pixelWidth); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

            // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
            if (this.level.touchesGoalHouse(this.player.getRect())) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
                this.levelCompleted = true; // Speichert Daten in der aktuellen Objektinstanz.
            }
        }

        this.input.endFrame(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
    draw() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.ctx.fillStyle = "#5DC8E8"; // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.

        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (!this.level || !this.player) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }

        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (let i = 0; i < this.parallaxLayers.length; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            this.parallaxLayers[i].draw(this.ctx, this.canvas.width, this.canvas.height, this.camera.x); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }

        this.level.draw(this.ctx, this.camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.drawCollectibles(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.drawEnemies(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.player.draw(this.ctx, this.camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

        this.drawHud(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "updateHudAnimation" in dieser Datei.
    updateHudAnimation(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.hudAnimTime += dt; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "getAnimatedHudFrame" in dieser Datei.
    getAnimatedHudFrame(frames, fallback) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!frames || frames.length === 0) return fallback; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const index = Math.floor(this.hudAnimTime * 10) % frames.length; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        return frames[index]; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "getPulseHudFrame" in dieser Datei.
    getPulseHudFrame(frames, fallback) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!frames || frames.length === 0) return fallback; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const loopLength = frames.length * 2 - 2; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        if (loopLength <= 0) return frames[0]; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const index = Math.floor(this.hudAnimTime * 6) % loopLength; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const pingPongIndex = index < frames.length ? index : loopLength - index; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        return frames[pingPongIndex]; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "drawHudIcon" in dieser Datei.
    drawHudIcon(frame, x, y, alpha = 1) { // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        if (!this.hudSprite) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const source = frame.sx !== undefined // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            ? frame // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            : this.hudSprite.frameAt(frame.col, frame.row); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        const size = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.ctx.save(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.ctx.globalAlpha = alpha; // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
            this.hudSprite.image, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            Math.round(x), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            Math.round(y), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            size, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            size // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.ctx.restore(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "drawHeartsHud" in dieser Datei.
    drawHeartsHud(startX, startY) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const frame = this.getPulseHudFrame(HUD_FRAMES.hearts, HUD_FALLBACK_FRAMES.heart); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const iconStep = iconSize + HUD_LAYOUT.iconGap; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (let i = 0; i < this.player.maxHearts; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            const alpha = i < this.player.hearts ? 1 : 0.25; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "drawDiamondHud" in dieser Datei.
    drawDiamondHud(startX, startY) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const frame = this.getAnimatedHudFrame(HUD_FRAMES.diamondSpin, HUD_FALLBACK_FRAMES.diamond); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.drawHudIcon(frame, startX, startY); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.ctx.fillStyle = "#ffffff"; // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx.font = "24px monospace"; // Speichert Daten in der aktuellen Objektinstanz.
        this.ctx.fillText(String(this.score), startX + iconSize + HUD_LAYOUT.scoreGap, startY + iconSize - 7); // Zeichnet Text auf dem Canvas.
    }

    // Diese Funktion verarbeitet das Verhalten "drawStarsHud" in dieser Datei.
    drawStarsHud(startX, startY) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const idleFrame = HUD_FRAMES.starCoinSpin[0] || HUD_FALLBACK_FRAMES.starCoin; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const spinFrame = this.getAnimatedHudFrame(HUD_FRAMES.starCoinSpin, HUD_FALLBACK_FRAMES.starCoin); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const iconStep = iconSize + HUD_LAYOUT.iconGap; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (let i = 0; i < HUD_LAYOUT.maxStars; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            const collected = i < this.stars; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            const frame = collected ? spinFrame : idleFrame; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            const alpha = collected ? 1 : 0.25; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "drawHud" in dieser Datei.
    drawHud() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.drawHeartsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.heartsY); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.drawStarsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.starsY); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        this.drawDiamondHud(HUD_LAYOUT.leftX, HUD_LAYOUT.diamondsY); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "updateSwitch" in dieser Datei.
    updateSwitch() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const wantsInteract = this.input.wasPressed("KeyE") || this.input.wasPressed("ArrowUp"); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        this.level.tryActivateSwitch(this.player.getRect(), wantsInteract); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "updateEnemies" in dieser Datei.
    updateEnemies(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (const enemy of this.enemies) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            enemy.update(dt, this.level); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.resolveEnemyContact(enemy); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "resolveEnemyContact" in dieser Datei.
    resolveEnemyContact(enemy) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!enemy.alive) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (isStompHit(this.player, enemy)) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            enemy.alive = false; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
            this.player.stompBounce(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            this.score += 25; // Speichert Daten in der aktuellen Objektinstanz.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }

        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (isBodyHit(this.player, enemy)) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            this.player.takeHit(enemy.x); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "updateCollectibles" in dieser Datei.
    updateCollectibles(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const playerRect = this.player.getRect(); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (const item of this.collectibles) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            item.update(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            item.tryCollect(playerRect, (collected) => this.onCollect(collected)); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "onCollect" in dieser Datei.
    onCollect(collected) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (collected.type === COLLECTIBLE_TYPE.diamond) this.score += collected.value; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (collected.type === COLLECTIBLE_TYPE.starCoin) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            this.score += collected.value; // Speichert Daten in der aktuellen Objektinstanz.
            this.stars += 1; // Speichert Daten in der aktuellen Objektinstanz.
        }
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (collected.type === COLLECTIBLE_TYPE.cherry) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
            if (this.player.maxHearts < this.player.hardMaxHearts) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
                this.player.maxHearts += 1; // Speichert Daten in der aktuellen Objektinstanz.
                this.player.hearts = this.player.maxHearts; // Speichert Daten in der aktuellen Objektinstanz.
                return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
            }
            this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + 1); // Speichert Daten in der aktuellen Objektinstanz.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "tryApplyWorldReset" in dieser Datei.
    tryApplyWorldReset() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!this.player.consumeWorldResetRequest()) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.resetWorldState(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "drawEnemies" in dieser Datei.
    drawEnemies() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (const enemy of this.enemies) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            enemy.draw(this.ctx, this.camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "drawCollectibles" in dieser Datei.
    drawCollectibles() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (const item of this.collectibles) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            item.draw(this.ctx, this.camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
    }
}
