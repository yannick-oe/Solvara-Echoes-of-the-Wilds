// #region Class Definition
export class Entity {
  /**
   * Creates a new instance.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} w Input parameter.
   * @param {number} h Input parameter.
   */
  constructor(x, y, w, h) {
    this.x    = x;
    this.y    = y;
    this.w    = w;
    this.h    = h;
    this.velX = 0;
    this.velY = 0;
    this.active = true;
  }

  /**
   * Handles get bounds.
   */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  /**
   * Handles intersects.
   * @param {object} other Input parameter.
   */
  intersects(other) {
    return (
      this.x         < other.x + other.w &&
      this.x + this.w > other.x           &&
      this.y         < other.y + other.h &&
      this.y + this.h > other.y
    );
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  update(dt) {}

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} cam Input parameter.
   * @param {object} imageCache Input parameter.
   */
  draw(ctx, cam, imageCache) {}
}
// #endregion