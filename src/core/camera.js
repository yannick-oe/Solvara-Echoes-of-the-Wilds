import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /** Zentriert die Kamera auf ein Entity. */
  follow(target) {
    this.x = target.x + target.w / 2 - CANVAS_WIDTH  / 2;
    this.y = target.y + target.h / 2 - CANVAS_HEIGHT / 2;
  }

  /** Klemmt die Kamera an die Levelgrenzen – nach follow() aufrufen. */
  clamp(levelWidth, levelHeight) {
    this.x = Math.max(0, Math.min(this.x, levelWidth  - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, levelHeight - CANVAS_HEIGHT));
  }

  /** Setzt den Canvas-Ursprung relativ zur Kameraposition. */
  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}

