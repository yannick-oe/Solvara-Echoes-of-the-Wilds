import { Pickup } from './pickup.js';

/** Verstecktes Sammelobjekt – 1 pro Level, kein Pflichtpfad. */
export class Cherry extends Pickup {
  constructor(x, y) {
    super(x, y, 16, 16);
  }

  collect(player, gameState) {
    super.collect(player, gameState);
    gameState.cherryFound = true;
  }

  draw(ctx, cam, imageCache) {
    // TODO: Cherry-Frames zeichnen
  }
}
