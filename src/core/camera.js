import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Lässt die Kamera einem Entity folgen und klemmt an Levelgrenzen.
   * @param {{ x: number, y: number, w: number, h: number }} target
   * @param {number} levelWidth
   * @param {number} levelHeight
   */
  follow(target, levelWidth, levelHeight) {
    const cx = target.x + target.w / 2 - CANVAS_WIDTH  / 2;
    const cy = target.y + target.h / 2 - CANVAS_HEIGHT / 2;
    this.x = Math.max(0, Math.min(cx, levelWidth  - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(cy, levelHeight - CANVAS_HEIGHT));
  }

  /** Setzt den Canvas-Ursprung relativ zur Kameraposition. */
  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}
