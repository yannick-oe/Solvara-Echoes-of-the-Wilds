import { Pickup } from './pickup.js';

export class Gem extends Pickup {
  constructor(x, y) {
    super(x, y, 16, 16);
    this.value = 1;
  }

  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.gems += this.value;
  }

  draw(ctx, cam, imageCache) {
    // TODO: Gem-Frames zeichnen
  }
}
