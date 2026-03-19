// #region Imports
import { Entity } from '../entity.js';
// #endregion

// #region Class Definition
export class Pickup extends Entity {

/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} frameCount - Frame Count value. @param {*} frameSec - Frame Sec value. @returns {void} - Nothing. */
  constructor(x, y, w, h, frameCount, frameSec) {
    super(x, y, w, h);
    this.collected   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this._frameCount = frameCount;
    this._frameSec   = frameSec;
  }

/** Handles collect. @param {*} player - Player value. @param {*} gameState - Current game state. @returns {void} - Nothing. */
  collect(player, gameState) {
    this.collected = true;
    this.active    = false;
  }

/** Handles update. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  update(dt) {
    if (!this.active) return;
    this._frameTimer += dt;
    if (this._frameTimer >= this._frameSec) {
      this._frameTimer -= this._frameSec;
      this._frameIndex  = (this._frameIndex + 1) % this._frameCount;
    }
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, cam, imageCache) {}
}
// #endregion