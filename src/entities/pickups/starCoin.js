import { Pickup } from './pickup.js';

export class StarCoin extends Pickup {
  /** @param {number} slotIndex  0-2, entspricht HUD-Slot */
  constructor(x, y, slotIndex) {
    super(x, y, 24, 24);
    this.slotIndex = slotIndex;
  }

  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.starCoins[this.slotIndex] = true;
  }

  draw(ctx, cam, imageCache) {
    // TODO: StarCoin-Frames zeichnen
  }
}
