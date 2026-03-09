import { Entity } from '../entity.js';

// Sichtgröße der Tür (Prop-Sprite)
const DRAW_W = 48;
const DRAW_H = 96;  // ~2 Kachelhöhen

export class Door extends Entity {
  /**
   * @param {number} x  Weltkoordinate links (Hitbox)
   * @param {number} y  Weltkoordinate oben  (Hitbox)
   */
  constructor(x, y) {
    super(x, y, 32, 96);
    /** Tür ist nur passierbar + aktiv wenn ein Schalter sie geöffnet hat. */
    this.isOpen = false;
  }

  /** Wird vom verknüpften Schalter aufgerufen. */
  unlock() {
    this.isOpen = true;
  }

  draw(ctx, _cam, imageCache) {
    const imgKey = this.isOpen ? 'PROP_DOOR_OPENED' : 'PROP_DOOR';
    const img    = imageCache.get(imgKey);
    const ox     = (this.w - DRAW_W) / 2;

    if (img) {
      ctx.drawImage(img, this.x + ox, this.y, DRAW_W, DRAW_H);
    } else {
      // Fallback: farbiges Rechteck
      ctx.fillStyle = this.isOpen ? '#5a3a1a55' : '#5a3a1a';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
