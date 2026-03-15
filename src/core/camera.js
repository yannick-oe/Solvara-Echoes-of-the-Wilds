import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const PLAYER_SCREEN_Y = CANVAS_HEIGHT * 0.66;

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }


  follow(target) {
    this.x = target.x + target.w / 2 - CANVAS_WIDTH  / 2;
    this.y = target.y + target.h / 2 - PLAYER_SCREEN_Y;
  }


  clamp(levelWidth, levelHeight) {
    this.x = Math.max(0, Math.min(this.x, levelWidth  - CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, levelHeight - CANVAS_HEIGHT));
  }


  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}
