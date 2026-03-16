// #region Imports
import { Pickup } from './pickup.js';
// #endregion

// #region Constants
const FRAME_COUNT = 5;
const FRAME_SEC   = 0.1;
const SIZE        = 24;
// #endregion

// #region Class Definition
export class Gem extends Pickup {

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  constructor(x, y) {
    super(x, y, 20, 20, FRAME_COUNT, FRAME_SEC);
  }

  /**
   * Handles collect.
   * @param {object} player Input parameter.
   * @param {string} gameState Input parameter.
   */
  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.score          += 25;
    gameState.gemsCollected  += 1;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} _cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`GEM_${this._frameIndex}`);
    if (!img) return;
    const ox = (this.w - SIZE) / 2;
    const oy = (this.h - SIZE) / 2;
    ctx.drawImage(img, this.x + ox, this.y + oy, SIZE, SIZE);
  }
}
// #endregion