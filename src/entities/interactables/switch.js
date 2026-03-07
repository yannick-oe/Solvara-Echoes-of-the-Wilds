import { Entity } from '../entity.js';

const DRAW_W = 32;
const DRAW_H = 32;

export class Switch extends Entity {
  /**
   * @param {number} x
   * @param {number} y
   * @param {import('./door.js').Door|null} linkedDoor
   */
  constructor(x, y, linkedDoor = null) {
    super(x, y, 24, 24);
    this.activated  = false;
    this.linkedDoor = linkedDoor;
  }

  /**
   * Aktiviert den Schalter wenn noch nicht aktiv.
   * Gibt true zurück bei erstmaliger Aktivierung.
   */
  activate() {
    if (!this.activated) {
      this.activated = true;
      this.linkedDoor?.unlock();
      return true;
    }
    return false;
  }

  draw(ctx, _cam, imageCache) {
    const imgKey = this.activated ? 'PROP_CRANK_DOWN' : 'PROP_CRANK_UP';
    const img    = imageCache.get(imgKey);
    const ox     = (this.w - DRAW_W) / 2;
    const oy     = (this.h - DRAW_H) / 2;

    if (img) {
      ctx.drawImage(img, this.x + ox, this.y + oy, DRAW_W, DRAW_H);
    } else {
      ctx.fillStyle = this.activated ? '#4a8' : '#fa0';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
