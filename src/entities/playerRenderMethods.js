import { BLINK_INTERVAL } from '../config/playerConfig.js';
import { drawDust } from './playerDust.js';
import { DRAW_H, DRAW_OX, DRAW_OY, DRAW_W, FALL_FRAME } from './playerConstants.js';

export const playerRenderMethods = {
  draw(ctx, _cam, imageCache) {
    drawDust(this._dustPool, ctx);
    if (this._shouldSkipDraw()) return;
    const anim = this._animDefs[this.state] ?? this._animDefs.idle;
    const fi = this._getFrameIndex();
    const img = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;
    const flipX = this._shouldFlipSprite();
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;
    if (this._squashScale !== 1.0) return this._drawSquashed(ctx, img, dx, dy, flipX);
    this._drawSprite(ctx, img, dx, dy, flipX, DRAW_H);
  },

  _shouldSkipDraw() {
    if (this.dying || this._invulTimer <= 0) return false;
    return Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0;
  },

  _getFrameIndex() {
    if (this.state === 'fall') return FALL_FRAME;
    if (this.state === 'wallGrab') return this._wallPushOffTimer > 0 ? 1 : 0;
    return this.frameIndex;
  },

  _shouldFlipSprite() {
    if (this.state === 'wallGrab') return this._wallGrabSide < 0;
    return !this.facingRight;
  },

  _drawSquashed(ctx, img, dx, dy, flipX) {
    const squashH = DRAW_H * this._squashScale;
    const squashY = dy + (DRAW_H - squashH);
    this._drawSprite(ctx, img, dx, squashY, flipX, squashH);
  },

  _drawSprite(ctx, img, dx, dy, flipX, drawH) {
    if (!flipX) return ctx.drawImage(img, dx, dy, DRAW_W, drawH);
    ctx.save();
    ctx.translate(dx + DRAW_W, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, DRAW_W, drawH);
    ctx.restore();
  },
};
