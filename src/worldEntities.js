import { COLLECTIBLE_TYPE, ENEMY_TYPE, GAMEPLAY } from "./constants.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { ENEMY_RECT_FRAMES } from "./worldAtlasConfig.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.

const PICKUP_FRAMES = { // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    [COLLECTIBLE_TYPE.diamond]: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 1, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 18, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 35, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 52, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 69, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    [COLLECTIBLE_TYPE.cherry]: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 87, sy: 3, sw: 15, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 108, sy: 3, sw: 17, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 132, sy: 3, sw: 17, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 156, sy: 3, sw: 15, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 182, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 204, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 227, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    [COLLECTIBLE_TYPE.starCoin]: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 249, sy: 3, sw: 26, sh: 26 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 281, sy: 1, sw: 18, sh: 18 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 316, sy: 2, sw: 28, sh: 29 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 355, sy: 7, sw: 18, sh: 18 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

function rectsOverlap(a, b) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
}

export class Enemy { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
    // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
    constructor(config, spriteImage) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.type = config.type; // Speichert Daten in der aktuellen Objektinstanz.
        this.spawnX = config.x; // Speichert Daten in der aktuellen Objektinstanz.
        this.spawnY = config.y; // Speichert Daten in der aktuellen Objektinstanz.
        this.width = config.width; // Speichert Daten in der aktuellen Objektinstanz.
        this.height = config.height; // Speichert Daten in der aktuellen Objektinstanz.
        this.patrolMin = config.patrolMin; // Speichert Daten in der aktuellen Objektinstanz.
        this.patrolMax = config.patrolMax; // Speichert Daten in der aktuellen Objektinstanz.
        this.speed = config.speed; // Speichert Daten in der aktuellen Objektinstanz.
        this.direction = 1; // Speichert Daten in der aktuellen Objektinstanz.
        this.x = this.spawnX; // Speichert Daten in der aktuellen Objektinstanz.
        this.y = this.spawnY; // Speichert Daten in der aktuellen Objektinstanz.
        this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.gravity = 1700; // Speichert Daten in der aktuellen Objektinstanz.
        this.alive = true; // Speichert Daten in der aktuellen Objektinstanz.
        this.jumpCooldown = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.verticalMin = config.verticalMin ?? this.spawnY; // Speichert Daten in der aktuellen Objektinstanz.
        this.verticalMax = config.verticalMax ?? this.spawnY; // Speichert Daten in der aktuellen Objektinstanz.
        this.spriteImage = spriteImage; // Speichert Daten in der aktuellen Objektinstanz.
        this.animTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.animDuration = 0.12; // Speichert Daten in der aktuellen Objektinstanz.
        this.animFrame = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "reset" in dieser Datei.
    reset() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.x = this.spawnX; // Speichert Daten in der aktuellen Objektinstanz.
        this.y = this.spawnY; // Speichert Daten in der aktuellen Objektinstanz.
        this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.direction = 1; // Speichert Daten in der aktuellen Objektinstanz.
        this.alive = true; // Speichert Daten in der aktuellen Objektinstanz.
        this.jumpCooldown = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.animTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.animFrame = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "getRect" in dieser Datei.
    getRect() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        return { x: this.x, y: this.y, width: this.width, height: this.height }; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "update" in dieser Datei.
    update(dt, level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!this.alive) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.advanceAnimation(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        if (this.type === ENEMY_TYPE.possum) this.updatePossum(dt, level); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.type === ENEMY_TYPE.frog) this.updateFrog(dt, level); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.type === ENEMY_TYPE.eagle) this.updateEagle(dt); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    // Diese Funktion verarbeitet das Verhalten "advanceAnimation" in dieser Datei.
    advanceAnimation(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.animTimer += dt; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.animTimer < this.animDuration) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.animTimer -= this.animDuration; // Speichert Daten in der aktuellen Objektinstanz.
        this.animFrame += 1; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "getActiveFrames" in dieser Datei.
    getActiveFrames() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const sets = ENEMY_RECT_FRAMES[this.type]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        if (!sets) return []; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.type === ENEMY_TYPE.possum) return sets.walk; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.type === ENEMY_TYPE.eagle) return sets.fly; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.type === ENEMY_TYPE.frog) return Math.abs(this.vy) > 30 ? sets.jump : sets.idle; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        return []; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "updatePossum" in dieser Datei.
    updatePossum(dt, level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.vx = this.speed * this.direction; // Speichert Daten in der aktuellen Objektinstanz.
        this.x += this.vx * dt; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround(); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (!this.hasGroundAhead(level)) this.turnAround(); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    // Diese Funktion verarbeitet das Verhalten "updateFrog" in dieser Datei.
    updateFrog(dt, level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.jumpCooldown -= dt; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.jumpCooldown <= 0) this.startHop(); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.vy += this.gravity * dt; // Speichert Daten in der aktuellen Objektinstanz.
        this.x += this.vx * dt; // Speichert Daten in der aktuellen Objektinstanz.
        this.y += this.vy * dt; // Speichert Daten in der aktuellen Objektinstanz.
        this.resolveGround(level); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround(); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    // Diese Funktion verarbeitet das Verhalten "startHop" in dieser Datei.
    startHop() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.jumpCooldown = 1.05; // Speichert Daten in der aktuellen Objektinstanz.
        this.vx = this.speed * this.direction; // Speichert Daten in der aktuellen Objektinstanz.
        this.vy = -520; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "updateEagle" in dieser Datei.
    updateEagle(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.y += this.speed * this.direction * dt; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.y <= this.verticalMin) this.direction = 1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.y + this.height >= this.verticalMax) this.direction = -1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    // Diese Funktion verarbeitet das Verhalten "resolveGround" in dieser Datei.
    resolveGround(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const tileSize = level.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const left = Math.floor(this.x / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const right = Math.floor((this.x + this.width - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
        for (let col = left; col <= right; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
            if (!level.isSolidTile(col, bottom)) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            this.y = bottom * tileSize - this.height; // Speichert Daten in der aktuellen Objektinstanz.
            this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }
    }

    // Diese Funktion verarbeitet das Verhalten "hasGroundAhead" in dieser Datei.
    hasGroundAhead(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        const probeX = this.direction > 0 ? this.x + this.width + 2 : this.x - 2; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const probeY = this.y + this.height + 2; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const col = Math.floor(probeX / level.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const row = Math.floor(probeY / level.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        return level.isSolidTile(col, row); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "turnAround" in dieser Datei.
    turnAround() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.direction *= -1; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.type === ENEMY_TYPE.frog) this.vx = this.speed * this.direction; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
    draw(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (!this.alive) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const x = Math.round(this.x - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const y = Math.round(this.y - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const frames = this.getActiveFrames(); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (!this.spriteImage || !frames.length) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === ENEMY_TYPE.possum) ctx.fillStyle = "#8d6e63"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === ENEMY_TYPE.frog) ctx.fillStyle = "#43a047"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === ENEMY_TYPE.eagle) ctx.fillStyle = "#5c6bc0"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            ctx.fillRect(x, y, this.width, this.height); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }

        const frame = frames[this.animFrame % frames.length]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        ctx.save(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (this.direction < 0 && this.type !== ENEMY_TYPE.eagle) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            ctx.translate(x + this.width, y); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            ctx.scale(-1, 1); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
            ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
                this.spriteImage, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                0, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                0, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                this.width, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                this.height // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        } else { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
                this.spriteImage, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                frame.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                x, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                this.width, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
                this.height // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        }
        ctx.restore(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
}

export class Collectible { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
    // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
    constructor(config, sprite) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.type = config.type; // Speichert Daten in der aktuellen Objektinstanz.
        this.value = config.value; // Speichert Daten in der aktuellen Objektinstanz.
        this.x = config.x; // Speichert Daten in der aktuellen Objektinstanz.
        this.y = config.y; // Speichert Daten in der aktuellen Objektinstanz.
        this.width = config.width; // Speichert Daten in der aktuellen Objektinstanz.
        this.height = config.height; // Speichert Daten in der aktuellen Objektinstanz.
        this.collected = false; // Speichert Daten in der aktuellen Objektinstanz.

        this.sprite = sprite; // Speichert Daten in der aktuellen Objektinstanz.
        this.frames = PICKUP_FRAMES[this.type] || []; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameTimer = Math.random() * 0.3; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameDuration = 0.11; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameIndex = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "reset" in dieser Datei.
    reset() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        this.collected = false; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameIndex = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "update" in dieser Datei.
    update(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (this.collected) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (!this.frames.length) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.frameTimer += dt; // Speichert Daten in der aktuellen Objektinstanz.
        if (this.frameTimer < this.frameDuration) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.frameTimer -= this.frameDuration; // Speichert Daten in der aktuellen Objektinstanz.
        this.frameIndex = (this.frameIndex + 1) % this.frames.length; // Speichert Daten in der aktuellen Objektinstanz.
    }

    // Diese Funktion verarbeitet das Verhalten "getRect" in dieser Datei.
    getRect() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        return { x: this.x, y: this.y, width: this.width, height: this.height }; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    // Diese Funktion verarbeitet das Verhalten "tryCollect" in dieser Datei.
    tryCollect(playerRect, onCollect) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (this.collected) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (!rectsOverlap(this.getRect(), playerRect)) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.collected = true; // Speichert Daten in der aktuellen Objektinstanz.
        onCollect(this); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
    draw(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        if (this.collected) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        const x = Math.round(this.x - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const y = Math.round(this.y - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
        if (!this.sprite || !this.frames.length) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === COLLECTIBLE_TYPE.diamond) ctx.fillStyle = "#4dd0e1"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === COLLECTIBLE_TYPE.starCoin) ctx.fillStyle = "#ffca28"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            if (this.type === COLLECTIBLE_TYPE.cherry) ctx.fillStyle = "#e53935"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
            ctx.fillRect(x, y, this.width, this.height); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.
            return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        }

        const frame = this.frames[this.frameIndex]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const source = frame.sx !== undefined // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
            ? frame // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            : this.sprite.frameAt(frame.col, frame.row); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
        ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
            this.sprite.image, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            source.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            this.width, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            this.height // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
}

export function isStompHit(player, enemy) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!enemy.alive) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height }; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const enemyRect = enemy.getRect(); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    if (!rectsOverlap(playerRect, enemyRect)) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    const playerBottom = player.y + player.height; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const enemyHeadLimit = enemy.y + enemy.height * 0.35; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    return player.vy > 0 && playerBottom <= enemyHeadLimit; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
}

export function isBodyHit(player, enemy) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!enemy.alive) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height }; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    return rectsOverlap(playerRect, enemy.getRect()); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
}

export function getDefaultEnemyLayout(tileSize) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return [ // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        {
            type: ENEMY_TYPE.possum, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 10, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 7.6, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 30, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 20, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            patrolMin: tileSize * 8, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            patrolMax: tileSize * 14, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            speed: 80, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: ENEMY_TYPE.frog, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 39, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 5.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 30, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            patrolMin: tileSize * 36, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            patrolMax: tileSize * 43, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            speed: 110, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: ENEMY_TYPE.eagle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 103, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 2.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 30, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 20, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            speed: 90, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            verticalMin: tileSize * 1.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            verticalMax: tileSize * 5.5, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.
}

export function getDefaultCollectiblesLayout(tileSize) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const size = 18; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    return [ // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
        ...buildDiamondLine(tileSize * 4, tileSize * 6, 7, tileSize * 1.2, size), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ...buildDiamondArc(tileSize * 17, tileSize * 5.8, 6, tileSize * 0.8, size), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ...buildDiamondLine(tileSize * 32, tileSize * 4.3, 5, tileSize * 1.1, size), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: GAMEPLAY.starCoinScore, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 44, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 2.7, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: GAMEPLAY.starCoinScore, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 81, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 6.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: GAMEPLAY.starCoinScore, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 111, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 1.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 24, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        {
            type: COLLECTIBLE_TYPE.cherry, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: 1, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: tileSize * 85, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: tileSize * 8.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: 20, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: 20, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.
}

function buildDiamondLine(startX, y, count, gap, size) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const items = []; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let i = 0; i < count; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        items.push({ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            type: COLLECTIBLE_TYPE.diamond, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: GAMEPLAY.diamondScore, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: startX + i * gap, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: size, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: size, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
    return items; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
}

function buildDiamondArc(startX, startY, count, gap, size) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const items = []; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let i = 0; i < count; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        const wave = Math.sin((i / (count - 1)) * Math.PI) * 26; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        items.push({ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            type: COLLECTIBLE_TYPE.diamond, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            value: GAMEPLAY.diamondScore, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            x: startX + i * gap, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            y: startY - wave, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            width: size, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
            height: size, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
    return items; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
}
