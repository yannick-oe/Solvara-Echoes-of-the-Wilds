import { Enemy } from './enemy.js';

export class FrogEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.isJumping = false;
    this.idleTime  = 0;
  }

  update(dt, tileMap) {
    // TODO: Idle-Pause über IntervalManager, dann Sprungzyklus
  }

  draw(ctx, cam, imageCache) {
    // TODO: Frog idle / jump Sprite zeichnen
  }
}
