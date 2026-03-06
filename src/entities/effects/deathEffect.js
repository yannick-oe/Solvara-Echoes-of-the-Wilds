import { Entity } from '../entity.js';

/** Einmaliger Tod-Effekt – wird aus der Entity-Liste entfernt sobald done=true. */
export class DeathEffect extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);
    this._frameIndex  = 0;
    this._totalFrames = 4;
    this.done         = false;
  }

  update(dt) {
    // TODO: Frames über IntervalManager durchlaufen, done=true nach letztem Frame
  }

  draw(ctx, cam, imageCache) {
    // TODO: enemy-death-N.png zeichnen
  }
}
