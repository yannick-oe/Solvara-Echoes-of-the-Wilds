import { Entity } from '../entity.js';

export class Enemy extends Entity {
  constructor(x, y, w, h) {
    super(x, y, w, h);

    this.facingRight = true;
    this.dead        = false;
    this.speed       = 60;
    this.deathSound  = null;
  }


  stompDie() {
    this.dead   = true;
    this.active = false;
  }


  update(dt, tileMap) {}

  draw(ctx, cam, imageCache) {}
}
