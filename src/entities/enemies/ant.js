import { Enemy } from './enemy.js';

export class AntEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed = 60;
  }

  update(dt, tileMap) {
    // TODO: Patrouille mit Wand-/Kanten-Umkehr
  }

  draw(ctx, cam, imageCache) {
    // TODO: Ant-Spritesheet zeichnen
  }
}
