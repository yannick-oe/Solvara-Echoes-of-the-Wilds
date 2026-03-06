import { Entity } from '../entity.js';

export class Enemy extends Entity {
  constructor(x, y, w, h) {
    super(x, y, w, h);

    this.facingRight = true;
    this.dead        = false;
    this.speed       = 60;
  }

  /** Wird aufgerufen wenn der Player den Gegner von oben trifft. */
  stompDie() {
    this.dead   = true;
    this.active = false;
  }

  /** @param {number} dt @param {import('../../world/tileMap.js').TileMap} tileMap */
  update(dt, tileMap) {}

  draw(ctx, cam, imageCache) {}
}
