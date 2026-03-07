import { Entity } from '../entity.js';

const FRAME_COUNT = 4;
const ANIM_FPS    = 8;   // Effekt dauert ~0,5 s

/** Einmaliger Tod-Effekt – Entity wird nach dem letzten Frame inaktiv. */
export class DeathEffect extends Entity {
  /**
   * @param {number} x  Weltkoordinate Mitte-X des gestorbenen Gegners
   * @param {number} y  Weltkoordinate oben des gestorbenen Gegners
   */
  constructor(x, y) {
    // Effekt zentriert über der Spawn-Position
    super(x - 16, y, 32, 32);
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
    ctx.drawImage(img, this.x, this.y, this.w, this.h);
  }
}
