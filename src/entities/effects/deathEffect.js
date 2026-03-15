import { Entity } from '../entity.js';

const FRAME_COUNT = 4;
const ANIM_FPS    = 6;

const FRAME_SCALE = [1.35, 1.0, 0.88, 0.78];

export class DeathEffect extends Entity {


  constructor(x, y) {

    const W = 56, H = 56;
    super(x - W / 2, y - 10, W, H);
    this._frameIndex = 0;
    this._frameTimer = 0;
    this.done        = false;
  }


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
