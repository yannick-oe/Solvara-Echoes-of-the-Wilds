export class Entity {
  /**
   * @param {number} x  Weltkoordinate links
   * @param {number} y  Weltkoordinate oben
   * @param {number} w  Breite in Pixeln
   * @param {number} h  Höhe in Pixeln
   */
  constructor(x, y, w, h) {
    this.x    = x;
    this.y    = y;
    this.w    = w;
    this.h    = h;
    this.velX = 0;
    this.velY = 0;

    /** Inaktive Entities werden aus Listen entfernt. */
    this.active = true;
  }

  /** AABB als flaches Objekt – vermeidet unnötige Objekt-Allocations. */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  /** Achsenparallele Kollisionsabfrage. */
  intersects(other) {
    return (
      this.x         < other.x + other.w &&
      this.x + this.w > other.x           &&
      this.y         < other.y + other.h &&
      this.y + this.h > other.y
    );
  }

  /** @param {number} dt  Delta-Zeit in Sekunden */
  update(dt) {}

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../core/camera.js').Camera} cam
   * @param {import('../core/imageCache.js').ImageCache} imageCache  (Singleton)
   */
  draw(ctx, cam, imageCache) {}
}
