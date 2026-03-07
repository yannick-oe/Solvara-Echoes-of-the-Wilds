import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';

export class GameOverScreen {
  /** @param {Function} onRestart */
  constructor(onRestart) {
    this._onRestart = onRestart;
  }

  draw(ctx) {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // TODO: "Game Over", Score, "Press Space to Retry"
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (input.jumpPressed || input.enterPressed) {
      this._onRestart();
    }
  }
}
