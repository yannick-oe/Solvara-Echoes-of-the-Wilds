// #region Class Definition
export class Entity {
/** Creates a new instance. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {void} - Nothing. */
  constructor(x, y, w, h) {
    this.x    = x;
    this.y    = y;
    this.w    = w;
    this.h    = h;
    this.velX = 0;
    this.velY = 0;
    this.active = true;
  }

/** Gets bounds. @returns {*} - Resulting value. */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

/** Handles intersects. @param {*} other - Other value. @returns {number} - Computed numeric value. */
  intersects(other) {
    return (
      this.x         < other.x + other.w &&
      this.x + this.w > other.x           &&
      this.y         < other.y + other.h &&
      this.y + this.h > other.y
    );
  }

/** Handles update. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  update(dt) {}

/** Handles draw. @param {*} ctx - Ctx value. @param {*} cam - Cam value. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
  draw(ctx, cam, imageCache) {}
}
// #endregion