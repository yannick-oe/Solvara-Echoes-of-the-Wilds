import { Pickup } from './pickup.js';

const FRAME_COUNT = 4;
const FRAME_SEC   = 0.1;  // 100 ms pro Frame
const SIZE        = 30;   // Zeichengröße in Weltpixeln

export class StarCoin extends Pickup {
  /**
   * @param {number} x          Weltkoordinate links
   * @param {number} y          Weltkoordinate oben
   * @param {number} slotIndex  0–2, entspricht dem HUD-Slot
   */
  constructor(x, y, slotIndex) {
    super(x, y, 24, 24, FRAME_COUNT, FRAME_SEC);
    this.slotIndex = slotIndex;
  }

  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.starCoins[this.slotIndex] = true;
  }

  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`STAR_COIN_${this._frameIndex}`);
    if (!img) return;
    const ox = (this.w - SIZE) / 2;
    const oy = (this.h - SIZE) / 2;
    ctx.drawImage(img, this.x + ox, this.y + oy, SIZE, SIZE);
  }
}
