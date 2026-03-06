import { SpriteSheet } from "./spriteSheet.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { GAMEPLAY } from "./constants.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.

export class Player { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor(spriteImage, spawnX, spawnY) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.spawnX = spawnX; // Speichert Daten in der aktuellen Objektinstanz.
    this.spawnY = spawnY; // Speichert Daten in der aktuellen Objektinstanz.


    this.width = 28; // Speichert Daten in der aktuellen Objektinstanz.
    this.height = 48; // Speichert Daten in der aktuellen Objektinstanz.

    this.x = spawnX; // Speichert Daten in der aktuellen Objektinstanz.
    this.y = spawnY; // Speichert Daten in der aktuellen Objektinstanz.

    this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.

    this.moveSpeed = 250; // Speichert Daten in der aktuellen Objektinstanz.
    this.jumpForce = 620; // Speichert Daten in der aktuellen Objektinstanz.
    this.gravity = 1800; // Speichert Daten in der aktuellen Objektinstanz.

    this.onGround = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.facing = 1; // Speichert Daten in der aktuellen Objektinstanz.


    this.sprite = new SpriteSheet(spriteImage, 33, 32); // Speichert Daten in der aktuellen Objektinstanz.
    this.spriteScale = 3; // Speichert Daten in der aktuellen Objektinstanz.
    this.drawOffsetX = -37; // Speichert Daten in der aktuellen Objektinstanz.
    this.drawOffsetY = 0; // Speichert Daten in der aktuellen Objektinstanz.

    this.animations = { // Speichert Daten in der aktuellen Objektinstanz.
      idle: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 0, row: 0 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 1, row: 0 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 2, row: 0 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 3, row: 0 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      walk: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 0, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 1, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 2, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 3, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 4, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 5, row: 1 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      jump: [{ col: 0, row: 5 }], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      fall: [{ col: 1, row: 5 }], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      duck: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 0, row: 3 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 1, row: 3 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 2, row: 3 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      hurt: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 0, row: 4 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 1, row: 4 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      climb: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 0, row: 2 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 1, row: 2 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 2, row: 2 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { col: 3, row: 2 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };

    this.currentAnimationName = "idle"; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationFrameDuration = 0.1; // Speichert Daten in der aktuellen Objektinstanz.

    this.deathCount = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.isRespawning = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.respawnDuration = 0.45; // Speichert Daten in der aktuellen Objektinstanz.
    this.respawnTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.

    this.startHearts = GAMEPLAY.startHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.hardMaxHearts = GAMEPLAY.maxHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.maxHearts = this.startHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.hearts = this.startHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.hitInvulnerabilityTime = GAMEPLAY.hitInvulnerabilityTime; // Speichert Daten in der aktuellen Objektinstanz.
    this.hitInvulnerabilityTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.worldResetRequested = false; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "resetToSpawn" in dieser Datei.
  resetToSpawn() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.x = this.spawnX; // Speichert Daten in der aktuellen Objektinstanz.
    this.y = this.spawnY; // Speichert Daten in der aktuellen Objektinstanz.
    this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.onGround = false; // Speichert Daten in der aktuellen Objektinstanz.

    this.currentAnimationName = "idle"; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.

    this.maxHearts = this.startHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.hearts = this.startHearts; // Speichert Daten in der aktuellen Objektinstanz.
    this.hitInvulnerabilityTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "startRespawn" in dieser Datei.
  startRespawn() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.deathCount += 1; // Speichert Daten in der aktuellen Objektinstanz.
    this.isRespawning = true; // Speichert Daten in der aktuellen Objektinstanz.
    this.respawnTimer = this.respawnDuration; // Speichert Daten in der aktuellen Objektinstanz.
    this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentAnimationName = "hurt"; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.worldResetRequested = true; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "updateRespawnTimer" in dieser Datei.
  updateRespawnTimer(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.respawnTimer -= dt; // Speichert Daten in der aktuellen Objektinstanz.
    if (this.respawnTimer > 0) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.isRespawning = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.resetToSpawn(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "getRect" in dieser Datei.
  getRect() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return { x: this.x, y: this.y, width: this.width, height: this.height }; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "updateInvulnerability" in dieser Datei.
  updateInvulnerability(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.hitInvulnerabilityTimer -= dt; // Speichert Daten in der aktuellen Objektinstanz.
    if (this.hitInvulnerabilityTimer < 0) this.hitInvulnerabilityTimer = 0; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
  }

  // Diese Funktion verarbeitet das Verhalten "canTakeHit" in dieser Datei.
  canTakeHit() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.hitInvulnerabilityTimer <= 0 && !this.isRespawning; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "takeHit" in dieser Datei.
  takeHit(hitFromX) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!this.canTakeHit()) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.hearts -= 1; // Speichert Daten in der aktuellen Objektinstanz.
    this.hitInvulnerabilityTimer = this.hitInvulnerabilityTime; // Speichert Daten in der aktuellen Objektinstanz.
    this.vx = hitFromX < this.x ? GAMEPLAY.knockbackX : -GAMEPLAY.knockbackX; // Speichert Daten in der aktuellen Objektinstanz.
    this.vy = -GAMEPLAY.knockbackY; // Speichert Daten in der aktuellen Objektinstanz.
    if (this.hearts > 0) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.startRespawn(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "stompBounce" in dieser Datei.
  stompBounce() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.vy = -this.jumpForce * GAMEPLAY.stompBounceFactor; // Speichert Daten in der aktuellen Objektinstanz.
    this.onGround = false; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "consumeWorldResetRequest" in dieser Datei.
  consumeWorldResetRequest() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!this.worldResetRequested) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.worldResetRequested = false; // Speichert Daten in der aktuellen Objektinstanz.
    return true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "readHorizontalInput" in dieser Datei.
  readHorizontalInput(input) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    let direction = 0; // Erzeugt eine lokale Variable, die sich aendern kann.
    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) direction -= 1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) direction += 1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return direction; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "readJumpInput" in dieser Datei.
  readJumpInput(input) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return ( // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      input.wasPressed("Space") || // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      input.wasPressed("ArrowUp") || // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      input.wasPressed("KeyW") // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "readDuckInput" in dieser Datei.
  readDuckInput(input) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return input.isDown("ArrowDown") || input.isDown("KeyS"); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "updateFacing" in dieser Datei.
  updateFacing(horizontalDirection) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (horizontalDirection > 0) this.facing = 1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (horizontalDirection < 0) this.facing = -1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
  }

  // Diese Funktion verarbeitet das Verhalten "applyHorizontalMovement" in dieser Datei.
  applyHorizontalMovement(horizontalDirection, isDucking) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.vx = isDucking ? 0 : horizontalDirection * this.moveSpeed; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "tryJump" in dieser Datei.
  tryJump(jumpPressed, isDucking) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!jumpPressed || !this.onGround || isDucking) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.vy = -this.jumpForce; // Speichert Daten in der aktuellen Objektinstanz.
    this.onGround = false; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "applyGravity" in dieser Datei.
  applyGravity(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.vy += this.gravity * dt; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "moveHorizontally" in dieser Datei.
  moveHorizontally(level, dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.x += this.vx * dt; // Speichert Daten in der aktuellen Objektinstanz.
    this.resolveCollisionsX(level); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "moveVertically" in dieser Datei.
  moveVertically(level, dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const previousBottom = this.y + this.height; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    this.y += this.vy * dt; // Speichert Daten in der aktuellen Objektinstanz.
    this.onGround = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.resolveCollisionsY(level, previousBottom); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.probeGround(level); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "fellOutOfWorld" in dieser Datei.
  fellOutOfWorld(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const killY = level.pixelHeight + level.tileDisplaySize * 2; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    return this.y > killY; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "touchesHazard" in dieser Datei.
  touchesHazard(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return level.rectTouchesHazard(this.x, this.y, this.width, this.height); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "shouldRespawn" in dieser Datei.
  shouldRespawn(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.fellOutOfWorld(level); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "update" in dieser Datei.
  update(dt, input, level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.isRespawning) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.updateRespawnTimer(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    this.updateInvulnerability(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

    const horizontalDirection = this.readHorizontalInput(input); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const jumpPressed = this.readJumpInput(input); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const isDucking = this.onGround && this.readDuckInput(input); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    this.updateFacing(horizontalDirection); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.applyHorizontalMovement(horizontalDirection, isDucking); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.tryJump(jumpPressed, isDucking); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.applyGravity(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.moveHorizontally(level, dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.moveVertically(level, dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    if (this.touchesHazard(level)) this.takeHit(this.x - this.facing * 20); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.shouldRespawn(level)) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.startRespawn(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    this.updateAnimation(dt, horizontalDirection, isDucking); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "resolveCollisionsX" in dieser Datei.
  resolveCollisionsX(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const tileSize = level.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const top = Math.floor(this.y / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.vx > 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      const right = Math.floor((this.x + this.width - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let row = top; row <= bottom; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        if (!level.isSolidTile(right, row)) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.x = right * tileSize - this.width; // Speichert Daten in der aktuellen Objektinstanz.
        this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
        return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      }
    }

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.vx < 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      const left = Math.floor(this.x / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let row = top; row <= bottom; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        if (!level.isSolidTile(left, row)) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.x = (left + 1) * tileSize; // Speichert Daten in der aktuellen Objektinstanz.
        this.vx = 0; // Speichert Daten in der aktuellen Objektinstanz.
        return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      }
    }
  }

  // Diese Funktion verarbeitet das Verhalten "resolveCollisionsY" in dieser Datei.
  resolveCollisionsY(level, previousBottom) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const tileSize = level.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const left = Math.floor(this.x / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const right = Math.floor((this.x + this.width - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.vy > 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = left; col <= right; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        const tileTop = bottom * tileSize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const hitsSolid = level.isSolidTile(col, bottom); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const hitsOneWay = level.isOneWayTile(col, bottom) && previousBottom <= tileTop + 2; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        if (!hitsSolid && !hitsOneWay) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.y = bottom * tileSize - this.height; // Speichert Daten in der aktuellen Objektinstanz.
        this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
        this.onGround = true; // Speichert Daten in der aktuellen Objektinstanz.
        return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      }
    }

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.vy < 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      const top = Math.floor(this.y / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = left; col <= right; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        if (!level.isSolidTile(col, top)) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        this.y = (top + 1) * tileSize; // Speichert Daten in der aktuellen Objektinstanz.
        this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
        return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      }
    }
  }

  // Diese Funktion verarbeitet das Verhalten "probeGround" in dieser Datei.
  probeGround(level) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (this.onGround) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (this.vy < 0) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.

    const tileSize = level.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const feetY = this.y + this.height; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const row = Math.floor(feetY / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const left = Math.floor(this.x / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const right = Math.floor((this.x + this.width - 1) / tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let col = left; col <= right; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      if (!level.isSolidTile(col, row)) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.

      this.y = row * tileSize - this.height; // Speichert Daten in der aktuellen Objektinstanz.
      this.vy = 0; // Speichert Daten in der aktuellen Objektinstanz.
      this.onGround = true; // Speichert Daten in der aktuellen Objektinstanz.
      return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "touchesGoal" in dieser Datei.
  touchesGoal(goal) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return ( // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      this.x < goal.x + goal.width && // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.x + this.width > goal.x && // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.y < goal.y + goal.height && // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.y + this.height > goal.y // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "updateAnimation" in dieser Datei.
  updateAnimation(dt, horizontalDirection, isDucking) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (this.playDuckAnimation(dt, isDucking)) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.exitDuckAnimation(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

    const nextAnimation = this.selectMovementAnimation(horizontalDirection); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    this.changeAnimation(nextAnimation); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.advanceAnimation(dt); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "playDuckAnimation" in dieser Datei.
  playDuckAnimation(dt, isDucking) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!isDucking || !this.onGround) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.currentAnimationName !== "duck") { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.changeAnimation("duck"); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      return true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    this.animationTimer += dt; // Speichert Daten in der aktuellen Objektinstanz.
    if (this.animationTimer < this.animationFrameDuration) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.animationTimer -= this.animationFrameDuration; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentFramePointer = this.currentFramePointer === 1 ? 2 : 1; // Speichert Daten in der aktuellen Objektinstanz.
    if (this.currentFramePointer === 0) this.currentFramePointer = 1; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "exitDuckAnimation" in dieser Datei.
  exitDuckAnimation() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (this.currentAnimationName !== "duck") return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "selectMovementAnimation" in dieser Datei.
  selectMovementAnimation(horizontalDirection) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!this.onGround) return this.vy < 0 ? "jump" : "fall"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (horizontalDirection !== 0) return "walk"; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return "idle"; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "changeAnimation" in dieser Datei.
  changeAnimation(name) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (this.currentAnimationName === name) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.currentAnimationName = name; // Speichert Daten in der aktuellen Objektinstanz.
    this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.animationTimer = 0; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "advanceAnimation" in dieser Datei.
  advanceAnimation(dt) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const frames = this.animations[this.currentAnimationName]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (frames.length <= 1) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.currentFramePointer = 0; // Speichert Daten in der aktuellen Objektinstanz.
      return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    this.animationTimer += dt; // Speichert Daten in der aktuellen Objektinstanz.
    // Diese Funktion verarbeitet das Verhalten "while" in dieser Datei.
    while (this.animationTimer >= this.animationFrameDuration) { // Wiederholt diesen Block, solange die Bedingung wahr ist.
      this.animationTimer -= this.animationFrameDuration; // Speichert Daten in der aktuellen Objektinstanz.
      this.currentFramePointer = (this.currentFramePointer + 1) % frames.length; // Speichert Daten in der aktuellen Objektinstanz.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
  draw(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.hitInvulnerabilityTimer > 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      const flashVisible = Math.floor(this.hitInvulnerabilityTimer * 12) % 2 === 0; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
      if (!flashVisible) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    }

    const currentFrames = this.animations[this.currentAnimationName]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const framePos = currentFrames[this.currentFramePointer]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const frame = this.sprite.frameAt(framePos.col, framePos.row); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const drawX = Math.round(this.x + this.drawOffsetX - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const drawY = Math.round(this.y + this.drawOffsetY - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const drawWidth = frame.sw * this.spriteScale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const drawHeight = frame.sh * this.spriteScale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    ctx.save(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.facing < 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      ctx.translate(drawX + drawWidth, drawY); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      ctx.scale(-1, 1); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      ctx.drawImage(this.sprite.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, drawWidth, drawHeight); // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
    } else { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
        this.sprite.image, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        frame.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        frame.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        frame.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        frame.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        drawX, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        drawY, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        drawWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        drawHeight // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
    ctx.restore(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }
}
