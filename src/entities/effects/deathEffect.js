// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Constants
const FRAME_COUNT = 4;
const ANIM_FPS    = 6;
const FRAME_SCALE = [1.35, 1.0, 0.88, 0.78];
// #endregion

// #region Class Definition
export class DeathEffect extends Entity {

/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @returns {void} - Nothing. */
  constructor(x, y) {
    const W = 56, H = 56;
    super(x - W / 2, y - 10, W, H);
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.done        = false;
  }

/** Handles update. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
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

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
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
// #endregion