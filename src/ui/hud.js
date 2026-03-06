import { PLAYER_MAX_HEARTS, STAR_COIN_COUNT } from '../core/constants.js';

export class Hud {
  constructor(imageCache) {
    this._imageCache = imageCache;
  }

  /**
   * Zeichnet HUD immer im Screen-Space (vor camera.applyTransform).
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ hearts: number, heartsMax: number, gems: number, starCoins: boolean[] }} gameState
   */
  draw(ctx, gameState) {
    this._drawHearts(ctx, gameState.hearts, gameState.heartsMax);
    this._drawGems(ctx, gameState.gems);
    this._drawStarCoins(ctx, gameState.starCoins);
  }

  _drawHearts(ctx, hearts, heartsMax) {
    // TODO: Herz-Icons in der linken oberen Ecke (max 5)
  }

  _drawGems(ctx, gems) {
    // TODO: Gem-Icon + Zähler
  }

  _drawStarCoins(ctx, starCoins) {
    // TODO: 3 StarCoin-Slots (gefüllt / leer)
  }
}
