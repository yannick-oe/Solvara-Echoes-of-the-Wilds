// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './core/constants.js';
import { GameManager }               from './core/gameManager/gameManager.js';
// #endregion

/**
 * Handles init.
 */
// #region Public Methods
/** Handles init. @returns {void} - Nothing. */
function init() {
  const container = document.getElementById('gameContainer');
  const canvas    = document.getElementById('gameCanvas');
  canvas.width  = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const game = new GameManager(canvas, container);
  game.start();
}
document.addEventListener('DOMContentLoaded', init);
// #endregion
