// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
// #endregion

// #region Constants
const PLAYER_SCREEN_Y = CANVAS_HEIGHT * 0.66;
// #endregion

// #region Class Definition
export class Camera {
  /**
   * Creates a new instance.
   */
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Handles follow.
   * @param {object} target Input parameter.
   */
  follow(target) {
    this.x = target.x + target.w / 2 - CANVAS_WIDTH  / 2;
    this.y = target.y + target.h / 2 - PLAYER_SCREEN_Y;
  }

  /**
   * Handles clamp.
   * @param {number} levelWidth Input parameter.
   * @param {number} levelHeight Input parameter.
   */
  clamp(levelWidth, levelHeight) {
    this.x = Math.max(0, Math.min(this.x, levelWidth  - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, levelHeight - CANVAS_HEIGHT));
  }

  /**
   * Handles apply transform.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}
// #endregion