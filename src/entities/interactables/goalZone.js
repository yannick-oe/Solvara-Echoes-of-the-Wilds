import { Entity } from '../entity.js';

const DRAW_W = 48;
const DRAW_H = 64;

/** Berührt der Spieler diese Zone, wird VICTORY ausgelöst. */
export class GoalZone extends Entity {
  /**
   * @param {number} x  Weltkoordinate links
   * @param {number} y  Weltkoordinate oben
   */
  constructor(x, y) {
    super(x, y, 32, 96);
    this.reached = false;
  }

  draw(ctx, _cam, imageCache) {
    const img = imageCache.get('PROP_SIGN');
    // Schild oben auf der Zone anzeigen
    const sx  = this.x + (this.w - DRAW_W) / 2;
    const sy  = this.y;

    if (img) {
      ctx.drawImage(img, sx, sy, DRAW_W, DRAW_H);
    } else {
      // Fallback: grünes Banner
      ctx.fillStyle = '#0b0';
      ctx.fillRect(this.x, this.y, this.w, Math.min(this.h, 8));
    }
  }
}
