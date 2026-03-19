// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
// #endregion

// #region Constants
const PLAYER_SCREEN_Y = CANVAS_HEIGHT * 0.66;
// #endregion

// #region Class Definition
export class Camera {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {
    this.x = 0;
    this.y = 0;
  }

/** Handles follow. @param {*} target - Target value. @returns {void} - Nothing. */
  follow(target) {
    this.x = target.x + target.w / 2 - CANVAS_WIDTH  / 2;
    this.y = target.y + target.h / 2 - PLAYER_SCREEN_Y;
  }

/** Handles clamp. @param {*} levelWidth - Level Width value. @param {*} levelHeight - Level Height value. @returns {void} - Nothing. */
  clamp(levelWidth, levelHeight) {
    this.x = Math.max(0, Math.min(this.x, levelWidth  - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, levelHeight - CANVAS_HEIGHT));
  }

/** Applies transform. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}
// #endregion