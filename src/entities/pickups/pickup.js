import { Entity } from '../entity.js';

export class Pickup extends Entity {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.collected  = false;
    this._frameIndex = 0;
  }

  /**
   * Wird aufgerufen wenn der Player kollidiert.
   * Unterklassen rufen super.collect() auf und ändern dann gameState.
   * @param {import('../player.js').Player} player
   * @param {object} gameState
   */
  collect(player, gameState) {
    this.collected = true;
    this.active    = false;
  }

  update(dt) {
    // TODO: Animations-Frame über IntervalManager
  }

  draw(ctx, cam, imageCache) {}
}
