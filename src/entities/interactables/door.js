import { Entity } from '../entity.js';

export class Door extends Entity {
  constructor(x, y) {
    super(x, y, 32, 48);
    this.open = false;
  }

  unlock() {
    this.open = true;
  }

  draw(ctx, cam, imageCache) {
    // TODO: door.png / door-opened.png je nach this.open
  }
}
