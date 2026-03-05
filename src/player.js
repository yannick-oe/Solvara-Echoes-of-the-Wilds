import { SpriteSheet } from "./spriteSheet.js"; // Wir holen eine Hilfe, die aus einem großen Bild kleine Bildteile schneiden kann.

export class Player { // Wir bauen eine Vorlage für unseren Spieler.
    constructor(spriteImage, spawnX, spawnY) { // Hier starten wir den Spieler mit Bild und Start-Ort.
        this.spawnX = spawnX; // Das ist die Start-X-Position zum Zurücksetzen.
        this.spawnY = spawnY; // Das ist die Start-Y-Position zum Zurücksetzen.

        this.width = 28; // So breit ist die unsichtbare Trefferbox vom Spieler.
        this.height = 48; // So hoch ist die unsichtbare Trefferbox vom Spieler.

        this.x = spawnX; // Aktuelle X-Position vom Spieler in der Welt.
        this.y = spawnY; // Aktuelle Y-Position vom Spieler in der Welt.

        this.vx = 0; // Aktuelle Geschwindigkeit nach links/rechts.
        this.vy = 0; // Aktuelle Geschwindigkeit nach oben/unten.

        this.moveSpeed = 250; // Wie schnell der Spieler läuft.
        this.jumpForce = 620; // Wie stark der Sprung nach oben ist.
        this.gravity = 1800; // Wie stark die Schwerkraft nach unten zieht.

        this.onGround = false; // Merkt sich, ob der Spieler gerade auf dem Boden steht.
        this.isDucking = false; // Merkt sich, ob der Spieler sich gerade duckt.
        this.facing = 1; // Blickrichtung: 1 = rechts, -1 = links.

        this.sprite = new SpriteSheet(spriteImage, 33, 32); // Wir sagen: ein Frame ist 33x32 Pixel im Spritesheet.
        this.spriteScale = 3; // Wir machen das Sprite 3x größer beim Zeichnen.
        this.drawOffsetX = -37; // Wir verschieben das Bild in X, damit Bild und Trefferbox gut zusammenpassen.
        this.drawOffsetY = 0; // Wir verschieben das Bild in Y, damit Bild und Trefferbox gut zusammenpassen.

        this.animations = { // Hier legen wir fest, welche Bilder zu welcher Bewegung gehören.
            idle: [ // Diese Bilder zeigen den ruhigen Stand.
                { col: 0, row: 0 }, // Erstes Standbild im Sheet.
                { col: 1, row: 0 }, // Zweites Standbild im Sheet.
                { col: 2, row: 0 }, // Drittes Standbild im Sheet.
                { col: 3, row: 0 }, // Viertes Standbild im Sheet.
            ], // Ende der Standbilder.
            walk: [ // Diese Bilder zeigen das Laufen.
                { col: 0, row: 1 }, // Laufbild 1.
                { col: 1, row: 1 }, // Laufbild 2.
                { col: 2, row: 1 }, // Laufbild 3.
                { col: 3, row: 1 }, // Laufbild 4.
                { col: 4, row: 1 }, // Laufbild 5.
                { col: 5, row: 1 }, // Laufbild 6.
            ], // Ende der Laufbilder.
            jump: [{ col: 0, row: 5 }], // Dieses eine Bild nutzen wir fürs Springen.
            fall: [{ col: 1, row: 5 }], // Dieses eine Bild nutzen wir fürs Fallen.
            duck: [ // Diese Bilder zeigen das Ducken.
                { col: 0, row: 3 }, // Erstes Standbild im Sheet.
                { col: 1, row: 3 }, // Zweites Standbild im Sheet.
                { col: 2, row: 3 }, // Drittes Standbild im Sheet.
            ], // Ende der Duck-Bilder.
            hurt: [ // Diese Bilder zeigen das Verletzen.
                { col: 0, row: 4 }, // Erstes Standbild im Sheet.
                { col: 1, row: 4 }, // Zweites Standbild im Sheet.
            ], // Ende der Hurt-Bilder.
        }; // Ende vom Animations-Objekt.

        this.currentAnimationName = "idle"; // Am Anfang soll die Stand-Animation laufen.
        this.currentFramePointer = 0; // Wir starten beim ersten Bild der Animation.
        this.animationTimer = 0; // Diese Zeit zählt, wann wir zum nächsten Bild wechseln.
        this.animationFrameDuration = 0.1; // Alle 0.1 Sekunden wechseln wir das Animationsbild.
    } // Ende vom Konstruktor.

    resetToSpawn() { // Diese Funktion setzt den Spieler zurück zum Start.
        this.x = this.spawnX; // X wieder auf Start.
        this.y = this.spawnY; // Y wieder auf Start.
        this.vx = 0; // Keine Bewegung mehr nach links/rechts.
        this.vy = 0; // Keine Bewegung mehr nach oben/unten.
        this.onGround = false; // Bodenstatus zurücksetzen.
        this.currentAnimationName = "idle"; // Animation wieder auf Stand.
        this.currentFramePointer = 0; // Animation wieder beim ersten Bild.
        this.animationTimer = 0; // Animationszeit wieder auf 0.
    } // Ende von resetToSpawn.

    update(dt, input, level) { // Diese Funktion wird jedes Frame aufgerufen und macht die ganze Spieler-Logik.
        let moveX = 0; // Diese Zahl sagt: -1 links, 0 still, 1 rechts.

        if (input.isDown("ArrowLeft") || input.isDown("KeyA")) { // Wenn links gedrückt wird...
            moveX -= 1; // ...dann wollen wir nach links.
        } // Ende linke Eingabe.

        if (input.isDown("ArrowRight") || input.isDown("KeyD")) { // Wenn rechts gedrückt wird...
            moveX += 1; // ...dann wollen wir nach rechts.
        } // Ende rechte Eingabe.

        this.isDucking = this.onGround && (input.isDown("ArrowDown") || input.isDown("KeyS")); // Ducken geht nur, wenn wir am Boden sind und unten gedrückt wird.

        if (!this.isDucking) { // Wenn wir nicht ducken...
            this.vx = moveX * this.moveSpeed; // ...setzen wir Laufgeschwindigkeit.
        } else { // Sonst...
            this.vx = 0; // ...bleiben wir horizontal stehen.
        } // Ende Duck-Entscheidung.

        if (moveX > 0) this.facing = 1; // Wenn wir nach rechts laufen, schauen wir nach rechts.
        if (moveX < 0) this.facing = -1; // Wenn wir nach links laufen, schauen wir nach links.

        if (input.wasPressed("Space") && this.onGround && !this.isDucking) { // Wenn Springen neu gedrückt wurde, wir am Boden sind und nicht ducken...
            this.vy = -this.jumpForce; // ...springen wir nach oben (negativ = hoch).
            this.onGround = false; // Während Sprung sind wir nicht am Boden.
        } // Ende Sprung-Start.

        this.vy += this.gravity * dt; // Schwerkraft zieht jede Frame-Zeit etwas nach unten.

        this.x += this.vx * dt; // Wir bewegen den Spieler erst auf X.
        this.resolveCollisionsX(level); // Danach korrigieren wir X-Kollisionen mit Tiles.

        this.y += this.vy * dt; // Dann bewegen wir den Spieler auf Y.
        this.onGround = false; // Vor Y-Kollision gehen wir erstmal davon aus: nicht am Boden.
        this.resolveCollisionsY(level); // Danach korrigieren wir Y-Kollisionen mit Tiles.

        if (this.y > level.pixelHeight + 220) { // Wenn der Spieler weit unter das Level fällt...
            this.resetToSpawn(); // ...setzen wir ihn wieder an den Start.
        } // Ende Fall-ins-Leere-Check.

        this.updateAnimation(dt, moveX); // Zum Schluss wählen wir die richtige Animation.
    } // Ende von update.

    resolveCollisionsX(level) { // Diese Funktion stoppt den Spieler bei Wänden links/rechts.
        const tileSize = level.tileDisplaySize; // So groß ist ein Tile auf dem Bildschirm.

        const left = Math.floor(this.x / tileSize); // Linke Tile-Spalte von der Spielerbox.
        const right = Math.floor((this.x + this.width - 1) / tileSize); // Rechte Tile-Spalte von der Spielerbox.
        const top = Math.floor(this.y / tileSize); // Obere Tile-Reihe von der Spielerbox.
        const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Untere Tile-Reihe von der Spielerbox.

        for (let row = top; row <= bottom; row++) { // Wir prüfen jede berührte Reihe.
            for (let col = left; col <= right; col++) { // Wir prüfen jede berührte Spalte.
                if (!level.isSolidTile(col, row)) continue; // Wenn Tile nicht fest ist, überspringen wir es.

                if (this.vx > 0) { // Wenn wir nach rechts laufen und eine Wand treffen...
                    this.x = col * tileSize - this.width; // ...setzen wir den Spieler direkt links vor die Wand.
                } else if (this.vx < 0) { // Wenn wir nach links laufen und eine Wand treffen...
                    this.x = (col + 1) * tileSize; // ...setzen wir den Spieler direkt rechts neben die Wand.
                } // Ende Richtungskorrektur.

                this.vx = 0; // Nach Wandtreffer stoppen wir X-Geschwindigkeit.
            } // Ende Spalten-Schleife.
        } // Ende Reihen-Schleife.
    } // Ende von resolveCollisionsX.

    resolveCollisionsY(level) { // Diese Funktion stoppt den Spieler bei Boden/Decke.
        const tileSize = level.tileDisplaySize;

        const left = Math.floor(this.x / tileSize);
        const right = Math.floor((this.x + this.width - 1) / tileSize);

        // --- Fall / Bodencheck (vy >= 0) ---
        if (this.vy >= 0) {
            // WICHTIG: hier bewusst OHNE -1, damit wir den Tile direkt unter den Füßen erwischen
            const bottomRow = Math.floor((this.y + this.height) / tileSize);

            for (let col = left; col <= right; col++) {
                if (!level.isSolidTile(col, bottomRow)) continue;

                this.y = bottomRow * tileSize - this.height;
                this.vy = 0;
                this.onGround = true;
                return;
            }
            return;
        }

        // --- Sprung / Deckencheck (vy < 0) ---
        const topRow = Math.floor(this.y / tileSize);

        for (let col = left; col <= right; col++) {
            if (!level.isSolidTile(col, topRow)) continue;

            this.y = (topRow + 1) * tileSize;
            this.vy = 0;
            return;
        }
    }

    touchesGoal(goal) { // Diese Funktion prüft, ob Spieler und Ziel-Rechteck sich berühren.
        return ( // Wir geben true oder false zurück.
            this.x < goal.x + goal.width && // Spieler ist links vom rechten Rand vom Ziel.
            this.x + this.width > goal.x && // Spieler ist rechts vom linken Rand vom Ziel.
            this.y < goal.y + goal.height && // Spieler ist über dem unteren Rand vom Ziel.
            this.y + this.height > goal.y // Spieler ist unter dem oberen Rand vom Ziel.
        ); // Ende Rückgabe.
    } // Ende von touchesGoal.

    updateAnimation(dt, moveX) { // Diese Funktion entscheidet, welches Bild gerade gezeigt werden soll.
        let nextAnimationName = "idle"; // Standard ist: ruhig stehen.
        if (!this.onGround) { // Wenn wir nicht am Boden sind...
            nextAnimationName = this.vy < 0 ? "jump" : "fall"; // ...zeigen wir Sprung oder Fallen.
        } else if (this.isDucking) { // Wenn wir am Boden sind und ducken...
            nextAnimationName = "duck"; // ...zeigen wir Duck-Bild.
        } else if (moveX !== 0) { // Wenn wir laufen...
            nextAnimationName = "walk"; // ...zeigen wir Lauf-Bilder.
        } // Ende Zustandswahl.

        if (nextAnimationName !== this.currentAnimationName) { // Wenn Zustand sich geändert hat...
            this.currentAnimationName = nextAnimationName; // ...neue Animation setzen.
            this.currentFramePointer = 0; // ...bei erstem Bild starten.
            this.animationTimer = 0; // ...Zeit-Zähler zurücksetzen.
        } // Ende Wechselcheck.

        const currentFrames = this.animations[this.currentAnimationName]; // Wir holen alle Bilder der aktuellen Animation.
        if (currentFrames.length <= 1) { // Wenn es nur ein Bild gibt...
            this.currentFramePointer = 0; // ...bleiben wir immer auf diesem Bild.
            return; // ...und sind fertig.
        } // Ende Ein-Bild-Fall.

        this.animationTimer += dt; // Wir zählen Zeit hoch.
        while (this.animationTimer >= this.animationFrameDuration) { // Solange genug Zeit für einen Bildwechsel da ist...
            this.animationTimer -= this.animationFrameDuration; // ...ziehen wir eine Bild-Zeit ab.
            this.currentFramePointer = (this.currentFramePointer + 1) % currentFrames.length; // ...gehen wir zum nächsten Bild (und springen am Ende zurück).
        } // Ende Bildwechsel-Schleife.
    } // Ende von updateAnimation.

    draw(ctx, camera) { // Diese Funktion malt den Spieler auf den Bildschirm.
        const currentFrames = this.animations[this.currentAnimationName]; // Wir holen Bilder der aktuellen Animation.
        const framePos = currentFrames[this.currentFramePointer]; // Wir nehmen das aktuelle Bild.
        const frame = this.sprite.frameAt(framePos.col, framePos.row); // Wir holen die genaue Position im Spritesheet.

        const drawX = Math.round(this.x + this.drawOffsetX - camera.x); // Wir rechnen Welt-X in Bildschirm-X um.
        const drawY = Math.round(this.y + this.drawOffsetY - camera.y); // Wir rechnen Welt-Y in Bildschirm-Y um.

        const drawWidth = frame.sw * this.spriteScale; // Das ist die gezeichnete Breite.
        const drawHeight = frame.sh * this.spriteScale; // Das ist die gezeichnete Höhe.

        ctx.save(); // Wir speichern den Zeichen-Zustand, damit Spiegeln nichts kaputt macht.
        if (this.facing < 0) { // Wenn der Spieler nach links schaut...
            ctx.translate(drawX + drawWidth, drawY); // ...verschieben wir den Nullpunkt zum Spiegeln.
            ctx.scale(-1, 1); // ...spiegeln wir horizontal.
            ctx.drawImage(this.sprite.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, drawWidth, drawHeight); // ...und zeichnen das Bild gespiegelt.
        } else { // Wenn der Spieler nach rechts schaut...
            ctx.drawImage( // ...zeichnen wir normal.
                this.sprite.image, // Das große Spritesheet-Bild.
                frame.sx, // Start-X vom kleinen Bild im Spritesheet.
                frame.sy, // Start-Y vom kleinen Bild im Spritesheet.
                frame.sw, // Breite vom kleinen Bild im Spritesheet.
                frame.sh, // Höhe vom kleinen Bild im Spritesheet.
                drawX, // Ziel-X auf dem Canvas.
                drawY, // Ziel-Y auf dem Canvas.
                drawWidth, // Ziel-Breite auf dem Canvas.
                drawHeight // Ziel-Höhe auf dem Canvas.
            ); // Ende vom normalen Zeichnen.
        } // Ende Richtungs-Entscheidung.
        ctx.restore(); // Wir stellen den alten Zeichen-Zustand wieder her.
    } // Ende von draw.
} // Ende der Player-Klasse.
