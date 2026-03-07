import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';

export class VictoryScreen {
  /** @param {Function} onRestart */
  constructor(onRestart) {
    this._onRestart = onRestart;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ gems: number, starCoins: boolean[] }} gameState
   */
  draw(ctx, gameState) {
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // TODO: "Level Clear!", Gems, StarCoin-Übersicht, "Press Space"
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (input.jumpPressed || input.enterPressed) {
      this._onRestart();
    }
  }
}
