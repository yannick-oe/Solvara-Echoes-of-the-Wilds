import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';

export class StartScreen {
  /** @param {Function} onStart  Callback wenn Spieler startet */
  constructor(onStart) {
    this._onStart = onStart;
  }

  draw(ctx) {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // TODO: Titel, Logo, "Press Space to Start"
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (input.jump) {
      this._onStart();
    }
  }
}
