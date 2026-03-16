// #region Imports
import { Pickup } from './pickup.js';
// #endregion

// #region Constants
const FRAME_COUNT = 4;
const FRAME_SEC   = 0.1;
const SIZE        = 45;
// #endregion

// #region Class Definition
export class StarCoin extends Pickup {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} slotIndex Input parameter.
   */
  constructor(x, y, slotIndex) {
    super(x, y, 24, 24, FRAME_COUNT, FRAME_SEC);
    this.slotIndex = slotIndex;
  }

  /**
   * Handles collect.
   * @param {object} player Input parameter.
   * @param {string} gameState Input parameter.
   */
  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.starCoins[this.slotIndex] = true;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`STAR_COIN_${this._frameIndex}`);
    if (!img) return;
    const ox = (this.w - SIZE) / 2;
    const oy = (this.h - SIZE) / 2;
    ctx.drawImage(img, this.x + ox, this.y + oy, SIZE, SIZE);
  }
}
// #endregion