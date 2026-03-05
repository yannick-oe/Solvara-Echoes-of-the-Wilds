import { Input } from "./input.js"; // Wir holen die Eingabe-Hilfe für Tastatur.
import { ImageCache } from "./imageCache.js"; // Wir holen den Bild-Cache, damit Bilder nur einmal geladen werden.
import { Camera } from "./camera.js"; // Wir holen die Kamera-Logik.
import { ParallaxLayer } from "./parallax.js"; // Wir holen den Hintergrund-Layer mit Parallax-Effekt.
import { Level } from "./level.js"; // Wir holen die Level-Klasse.
import { Player } from "./player.js"; // Wir holen die Spieler-Klasse.
import { CANVAS_HEIGHT, CANVAS_WIDTH, ASSET_PATHS } from "./constants.js"; // Wir holen gemeinsame Werte und Bild-Pfade.

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
        const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack);
        const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle);

        this.level = new Level(tileset);
        this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY);

        const backScale = CANVAS_HEIGHT / bgBack.height;
        const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height;
        this.parallaxLayers = [
            new ParallaxLayer(bgBack, 0.1, backScale, 0),
            new ParallaxLayer(bgMiddle, 0.3, middleScale, 0),
        ];

        this.lastTime = performance.now();
        this._rafId = requestAnimationFrame(this.loop.bind(this));
    }

    async loadAssets() { // Diese Funktion lädt alle benötigten Bilder.
        await this.imageCache.loadAll([ // Wir geben alle Pfade an den Cache-Lader.
            ASSET_PATHS.backgroundBack, // Pfad zum hinteren Hintergrund.
            ASSET_PATHS.backgroundMiddle, // Pfad zum mittleren Hintergrund.
            ASSET_PATHS.tileSet, // Pfad zum Tileset.
            ASSET_PATHS.playerSprite, // Pfad zum Spieler-Spritesheet.
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
            this.camera.follow(this.player, this.level.pixelWidth); // ...und lassen die Kamera folgen.

            if (this.player.touchesGoal(this.level.goal)) { // Wenn der Spieler das Ziel berührt...
                this.levelCompleted = true; // ...markieren wir das Level als geschafft.
            } // Ende Zielprüfung.
        } // Ende Update bei aktivem Level.

        this.input.endFrame(); // Wir löschen "nur in diesem Frame gedrückt"-Tasten.
    } // Ende von update.

    draw() { // Diese Funktion zeichnet ein komplettes Bild.
        this.ctx.fillStyle = "#5DC8E8"; // Himmel-Farbe wählen.
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Ganze Fläche mit Himmel füllen.

        if (!this.level || !this.player) { // Wenn noch nicht alles geladen ist...
            this.ctx.fillStyle = "#ffffff"; // ...Text-Farbe weiß setzen.
            this.ctx.font = "18px monospace"; // ...Schrift setzen.
            this.ctx.fillText("Loading assets...", 230, 240); // ...Lade-Text zeichnen.
            return; // ...und fertig für dieses Frame.
        } // Ende Ladebildschirm.

        for (let i = 0; i < this.parallaxLayers.length; i++) { // Wir zeichnen jeden Parallax-Layer.
            this.parallaxLayers[i].draw(this.ctx, this.canvas.width, this.canvas.height, this.camera.x); // Layer wird mit Kamera-X verschoben.
        } // Ende Layer-Schleife.

        this.level.draw(this.ctx, this.camera); // Level-Tiles zeichnen.
        this.player.draw(this.ctx, this.camera); // Spieler zeichnen.

        this.drawText(); // Hilfstext und Siegtext zeichnen.
    } // Ende von draw.

    drawText() { // Diese Funktion zeichnet UI-Text.
        this.ctx.fillStyle = "#0d1b2a"; // Dunkle Textfarbe setzen.
        this.ctx.font = "16px monospace"; // Normale UI-Schrift setzen.
        this.ctx.fillText("Move: A/D or Arrow Keys | Jump: Space | Duck: S/ArrowDown", 12, 24); // Steuerungs-Hinweis zeichnen.
        this.ctx.fillText("Fullscreen: F", 12, 46); // Vollbild-Hinweis zeichnen.
        this.ctx.fillText(`Deaths: ${this.player.deathCount}`, 12, 68);

        if (this.player.isRespawning) {
            this.ctx.fillStyle = "#b71c1c";
            this.ctx.fillText("Respawning...", 300, 46);
        }

        if (this.levelCompleted) { // Wenn das Level geschafft wurde...
            this.ctx.fillStyle = "#1b5e20"; // ...grüne Farbe setzen.
            this.ctx.font = "24px monospace"; // ...größere Schrift setzen.
            this.ctx.fillText("Level complete!", 250, 120); // ...Siegtext zeichnen.
        } // Ende Siegtext.
    } // Ende von drawText.
} // Ende der Game-Klasse.
