import { Enemy } from './enemy.js';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';

// Zeichengröße (etwas größer als Hitbox, zentriert)
const DRAW_W  = 48;
const DRAW_H  = 48;
const DRAW_OX = (32 - DRAW_W) / 2;
const DRAW_OY = 32 - DRAW_H;

// Anzahl ANT-Frames im ImageCache (ANT_0 … ANT_7)
const FRAME_COUNT = 8;
const ANIM_FPS    = 10;

export class AntEnemy extends Enemy {
  /**
   * @param {number} x  Spawn-X (Weltkoordinate links)
   * @param {number} y  Spawn-Y (Weltkoordinate oben)
   */
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed       = 60;
    this.facingRight = true;
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';

    this._frameIndex = 0;
    this._frameTimer = 0;
  }

  /**
   * @param {number}                                 dt
   * @param {import('../../world/tileMap.js').TileMap} tileMap
   */
  update(dt, tileMap) {
    if (this.dead) return;

    // --- Schwerkraft ---
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);

    // --- Horizontale Bewegung ---
    this.velX = this.facingRight ? this.speed : -this.speed;
    this.x   += this.velX * dt;

    // Wandkollision: führende Kante prüfen
    this._resolveWall(tileMap);

    // Kantenerkennung: eine Kachel vor den Füßen schauen
    this._checkEdge(tileMap);

    // --- Vertikale Bewegung ---
    this.y += this.velY * dt;
    this._resolveFloor(tileMap);

    // --- Animation ---
    this._frameTimer += dt;
    if (this._frameTimer >= 1 / ANIM_FPS) {
      this._frameTimer -= 1 / ANIM_FPS;
      this._frameIndex  = (this._frameIndex + 1) % FRAME_COUNT;
    }
  }

  /**
   * @param {CanvasRenderingContext2D}                   ctx
   * @param {*}                                         _cam
   * @param {import('../../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`ANT_${this._frameIndex}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;

    // Die Quell-Sprites zeigen die Ameise nach LINKS – daher kein Flip wenn links,
    // Flip wenn rechts.
    if (!this.facingRight) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // Private Hilfsmethoden
  // ---------------------------------------------------------------------------

  /** Stoppt die Ameise und dreht sie um wenn sie gegen eine Wand läuft. */
  _resolveWall(tileMap) {
    const ts       = TILE_SIZE;
    const topRow   = Math.floor(this.y / ts);
    const botRow   = Math.floor((this.y + this.h - 1) / ts);
    const checkCol = this.facingRight
      ? Math.floor((this.x + this.w - 1) / ts)
      : Math.floor(this.x / ts);

    for (let row = topRow; row <= botRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        // Zurücksetzen an Wandkante
        this.x           = this.facingRight
          ? checkCol * ts - this.w
          : (checkCol + 1) * ts;
        this.facingRight = !this.facingRight;
        return;
      }
    }
  }

  /**
   * Dreht die Ameise um wenn der Boden vor ihr endet.
   * Prüft eine Kachel in Laufrichtung und eine Zeile tiefer.
   */
  _checkEdge(tileMap) {
    const ts         = TILE_SIZE;
    const groundRow  = Math.floor((this.y + this.h) / ts); // Zeile direkt unter Füßen
    const probeCol   = this.facingRight
      ? Math.floor((this.x + this.w) / ts)    // rechte Vorderkante
      : Math.floor((this.x - 1)     / ts);    // linke Vorderkante

    if (!tileMap.isSolid(probeCol, groundRow)) {
      this.facingRight = !this.facingRight;
    }
  }

  /** Einfache Bodenkollision, kein onGround-Tracking nötig. */
  _resolveFloor(tileMap) {
    if (this.velY < 0) return;   // aufsteigend – hier nicht relevant
    const ts       = TILE_SIZE;
    const leftCol  = Math.floor(this.x / ts);
    const rightCol = Math.floor((this.x + this.w - 1) / ts);
    const botRow   = Math.floor((this.y + this.h - 1) / ts);

    for (let col = leftCol; col <= rightCol; col++) {
      if (tileMap.isSolid(col, botRow)) {
        this.y    = botRow * ts - this.h;
        this.velY = 0;
        return;
      }
    }
  }
}
