import { Enemy } from './enemy.js';

// Hitbox
const EAGLE_W = 48;
const EAGLE_H = 32;

// Sprite-Zeichengröße (zentriert über Hitbox) – 1,5× für mehr Bedrohungsgefühl
const DRAW_W  = 86;
const DRAW_H  = 56;
const DRAW_OX = (EAGLE_W - DRAW_W) / 2;
const DRAW_OY = (EAGLE_H - DRAW_H) / 2;

// Animations-Frames im Cache (EAGLE_0 … EAGLE_3)
const FRAME_COUNT = 4;
const ANIM_FPS    = 10;

// Patroullen-Tempo
const PATROL_SPEED = 80; // px/s vertikal

export class EagleEnemy extends Enemy {
  /**
   * @param {number} x      Weltkoordinate links (bleibt immer gleich, kein X-Versatz)
   * @param {number} minY   Obere Umkehrstelle (Welt-Y)
   * @param {number} maxY   Untere Umkehrstelle (Welt-Y)
   */
  constructor(x, minY, maxY) {
    super(x, minY, EAGLE_W, EAGLE_H);

    this._minY = minY;
    this._maxY = maxY;
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';

    // Startet nach unten fliegend
    this.velY        = PATROL_SPEED;
    this.velX        = 0;

    this._frameIndex = 0;
    this._frameTimer = 0;
  }

  /**
   * Reine vertikale Patrouille, keine Tile-Kollision erforderlich.
   * @param {number} dt
   */
  update(dt) {
    if (this.dead) return;

    // Vertikale Bewegung
    this.y += this.velY * dt;

    // Richtungswechsel an den Umkehrstellen
    if (this.velY > 0 && this.y >= this._maxY) {
      this.y    = this._maxY;
      this.velY = -PATROL_SPEED;
    } else if (this.velY < 0 && this.y <= this._minY) {
      this.y    = this._minY;
      this.velY = PATROL_SPEED;
    }

    // Animation
    this._frameTimer += dt;
    if (this._frameTimer >= 1 / ANIM_FPS) {
      this._frameTimer -= 1 / ANIM_FPS;
      this._frameIndex  = (this._frameIndex + 1) % FRAME_COUNT;
    }
  }

  /**
   * @param {CanvasRenderingContext2D}                      ctx
   * @param {*}                                            _cam
   * @param {import('../../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`EAGLE_${this._frameIndex}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;

    // Quell-Sprites zeigen den Adler nach LINKS – Flip wenn rechts schauend.
    // Der Adler hat kein facingRight-Wechsel, zeigt aber immer links: kein Flip.
    ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
  }
}
