// #region Imports
import { Pickup } from './pickup.js';
// #endregion

// #region Constants
const FRAME_COUNT = 7;
const FRAME_SEC   = 0.1;
const SIZE        = 34;
// #endregion

// #region Class Definition
export class Cherry extends Pickup {
/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @returns {void} - Nothing. */
  constructor(x, y) {
    super(x, y, 20, 20, FRAME_COUNT, FRAME_SEC);
  }

/** Handles collect. @param {*} player - Player value. @param {*} gameState - Current game state. @returns {void} - Nothing. */
  collect(player, gameState) {
    super.collect(player, gameState);

    gameState.hearts = Math.min(gameState.hearts + 1, gameState.heartsMax);
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} _cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get(`CHERRY_${this._frameIndex}`);
    if (!img) return;
    const ox = (this.w - SIZE) / 2;
    const oy = (this.h - SIZE) / 2;
    ctx.drawImage(img, this.x + ox, this.y + oy, SIZE, SIZE);
  }
}
// #endregion