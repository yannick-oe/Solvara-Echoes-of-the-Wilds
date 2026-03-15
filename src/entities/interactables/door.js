import { Entity } from '../entity.js';

const DRAW_W = 48;
const DRAW_H = 96;

export class Door extends Entity {


  constructor(x, y) {
    super(x, y, 32, 96);

    this.isOpen = false;
  }


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

      ctx.fillStyle = this.isOpen ? '#5a3a1a55' : '#5a3a1a';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
