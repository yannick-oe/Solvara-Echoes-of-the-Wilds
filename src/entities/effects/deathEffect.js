import { Entity } from '../entity.js';

const FRAME_COUNT = 4;
const ANIM_FPS    = 6;   // 4 Frames × 1/6 s ≈ 0,67 s sichtbar

// Skalierung pro Frame: Frame 0 ploppt auf, dann blendet der Effekt aus
const FRAME_SCALE = [1.35, 1.0, 0.88, 0.78];

/** Einmaliger Tod-Effekt – Entity wird nach dem letzten Frame inaktiv. */
export class DeathEffect extends Entity {
  /**
   * @param {number} x  Weltkoordinate Mitte-X des gestorbenen Gegners
   * @param {number} y  Weltkoordinate oben des gestorbenen Gegners
   */
  constructor(x, y) {
    // Effekt zentriert über der Spawn-Position, etwas größer und leicht nach oben versetzt
    const W = 56, H = 56;
    super(x - W / 2, y - 10, W, H);
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.done        = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (this.done) return;

    this._frameTimer += dt;
    if (this._frameTimer >= 1 / ANIM_FPS) {
      this._frameTimer -= 1 / ANIM_FPS;
      this._frameIndex++;
      if (this._frameIndex >= FRAME_COUNT) {
        this.done   = true;
        this.active = false;
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D}                   ctx
   * @param {*}                                         _cam
   * @param {import('../../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    if (this.done) return;
    const img = imageCache.get(`DEATH_EFFECT_${this._frameIndex}`);
    if (!img) return;

    const scale = FRAME_SCALE[this._frameIndex] ?? 1;
    const drawW = this.w * scale;
    const drawH = this.h * scale;
    const drawX = this.x + (this.w - drawW) / 2;
    const drawY = this.y + (this.h - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}

