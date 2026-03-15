import { Pickup } from './pickup.js';

const FRAME_COUNT = 5;
const FRAME_SEC   = 0.1;
const SIZE        = 24;

export class Gem extends Pickup {

  constructor(x, y) {
    super(x, y, 20, 20, FRAME_COUNT, FRAME_SEC);
  }

  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.score          += 25;
    gameState.gemsCollected  += 1;
  }

  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`GEM_${this._frameIndex}`);
    if (!img) return;

    const ox = (this.w - SIZE) / 2;
    const oy = (this.h - SIZE) / 2;
    ctx.drawImage(img, this.x + ox, this.y + oy, SIZE, SIZE);
  }
}
