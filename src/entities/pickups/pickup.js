// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Class Definition
export class Pickup extends Entity {

  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} w Input parameter.
   * @param {number} h Input parameter.
   * @param {number} frameCount Input parameter.
   * @param {object} frameSec Input parameter.
   */
  constructor(x, y, w, h, frameCount, frameSec) {
    super(x, y, w, h);
    this.collected   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this._frameCount = frameCount;
    this._frameSec   = frameSec;
  }

  /**
   * Handles collect.
   * @param {object} player Input parameter.
   * @param {string} gameState Input parameter.
   */
  collect(player, gameState) {
    this.collected = true;
    this.active    = false;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  update(dt) {
    if (!this.active) return;
    this._frameTimer += dt;
    if (this._frameTimer >= this._frameSec) {
      this._frameTimer -= this._frameSec;
      this._frameIndex  = (this._frameIndex + 1) % this._frameCount;
    }
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, cam, imageCache) {}
}
// #endregion