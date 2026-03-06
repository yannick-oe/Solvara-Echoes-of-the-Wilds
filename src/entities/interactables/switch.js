import { Entity } from '../entity.js';

export class Switch extends Entity {
  /**
   * @param {number} x
   * @param {number} y
   * @param {import('./door.js').Door|null} linkedDoor
   */
  constructor(x, y, linkedDoor = null) {
    super(x, y, 16, 24);
    this.activated  = false;
    this.linkedDoor = linkedDoor;
  }

  activate() {
    if (!this.activated) {
      this.activated = true;
      this.linkedDoor?.unlock();
    }
  }

  draw(ctx, cam, imageCache) {
    // TODO: crank-up.png / crank-down.png je nach this.activated
  }
}
