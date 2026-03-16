// #region Imports
import { Entity } from '../entity.js';
// #endregion


// #region Class Definition
export class Enemy extends Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} w Input parameter.
   * @param {number} h Input parameter.
   */
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.facingRight = true;
    this.dead        = false;
    this.speed       = 60;
    this.deathSound  = null;
  }

  /**
   * Handles stomp defeat.
   */
  stompDie() {
    this.dead   = true;
    this.active = false;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   * @param {object} tileMap Input parameter.
   */
  update(dt, tileMap) {}

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, cam, imageCache) {}
}
// #endregion