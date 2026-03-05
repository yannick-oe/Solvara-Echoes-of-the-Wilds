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
  } // Ende vom Konstruktor.

  async start() { // Diese Funktion startet das Spiel.
    await this.loadAssets(); // Zuerst laden wir alle Bilder.

    const tileset = this.imageCache.get(ASSET_PATHS.tileSet); // Wir holen das Tileset-Bild aus dem Cache.
    const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite); // Wir holen das Spieler-Bild aus dem Cache.
    const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack); // Wir holen das hintere Hintergrund-Bild.
    const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle); // Wir holen das mittlere Hintergrund-Bild.

    this.level = new Level(tileset); // Wir bauen das Level mit dem Tileset.
    this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY); // Wir bauen den Spieler am Spawnpunkt.

    const backScale = CANVAS_HEIGHT / bgBack.height; // Wir rechnen die Größe fürs hintere Bild.
    const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height; // Wir rechnen die Größe fürs mittlere Bild.
    this.parallaxLayers = [ // Hier bauen wir alle Parallax-Layer.
      new ParallaxLayer(bgBack, 0.1, backScale, 0), // Weit hinten: bewegt sich langsam.
      new ParallaxLayer(bgMiddle, 0.3, middleScale, 0), // Näher dran: bewegt sich etwas schneller.
    ]; // Ende der Layer-Liste.

    let self = this; // Wir speichern `this` in `self`, damit es im Callback erhalten bleibt.
    requestAnimationFrame(function (timestamp) { // Wir starten die erste Frame-Funktion.
      self.lastTime = timestamp; // Wir setzen die Startzeit.
      self.loop(timestamp); // Wir springen in die Game-Loop.
    }); // Ende erster requestAnimationFrame.
  } // Ende von start.

  async loadAssets() { // Diese Funktion lädt alle benötigten Bilder.
    await this.imageCache.loadAll([ // Wir geben alle Pfade an den Cache-Lader.
      ASSET_PATHS.backgroundBack, // Pfad zum hinteren Hintergrund.
      ASSET_PATHS.backgroundMiddle, // Pfad zum mittleren Hintergrund.
      ASSET_PATHS.tileSet, // Pfad zum Tileset.
      ASSET_PATHS.playerSprite, // Pfad zum Spieler-Spritesheet.
    ]); // Ende Bildliste.
  } // Ende von loadAssets.

  loop(timestamp) { // Diese Funktion läuft in jedem Frame.
    const rawDt = (timestamp - this.lastTime) / 1000; // Wir rechnen Millisekunden in Sekunden um.
    const dt = Math.min(0.05, rawDt); // Wir begrenzen dt, damit große Sprünge bei Lags nicht alles zerstören.
    this.lastTime = timestamp; // Wir merken uns die neue Zeit für den nächsten Frame.

    this.update(dt); // Wir aktualisieren Spiel-Logik.
    this.draw(); // Wir zeichnen alles auf den Bildschirm.

    let self = this; // Wieder speichern wir `this` als `self` für den Callback.
    requestAnimationFrame(function (nextTimestamp) { // Wir planen den nächsten Frame.
      self.loop(nextTimestamp); // Wir rufen die Loop wieder auf.
    }); // Ende requestAnimationFrame.
  } // Ende von loop.

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

    if (this.levelCompleted) { // Wenn das Level geschafft wurde...
      this.ctx.fillStyle = "#1b5e20"; // ...grüne Farbe setzen.
      this.ctx.font = "24px monospace"; // ...größere Schrift setzen.
      this.ctx.fillText("Level complete!", 250, 120); // ...Siegtext zeichnen.
    } // Ende Siegtext.
  } // Ende von drawText.
} // Ende der Game-Klasse.
