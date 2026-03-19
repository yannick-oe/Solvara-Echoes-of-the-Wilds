// #region Imports
import { Entity } from '../entity.js';
// #endregion


// #region Class Definition
export class Enemy extends Entity {
/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {void} - Nothing. */
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.facingRight = true;
    this.dead        = false;
    this.speed       = 60;
    this.deathSound  = null;
  }

/** Handles stomp Die. @returns {void} - Nothing. */
  stompDie() {
    this.dead   = true;
    this.active = false;
  }

/** Handles update. @param {*} dt - Frame delta time. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
  update(dt, tileMap) {}

/** Handles draw. @param {*} ctx - Ctx value. @param {*} cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, cam, imageCache) {}
}
// #endregion