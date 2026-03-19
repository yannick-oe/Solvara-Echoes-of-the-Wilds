import { makePool } from '../../shared/victoryParticles.js';
import { ATMO_POOL, SPARK_MAX } from './victoryScreenShared.js';
import { victoryScreenUpdateMethods } from './victoryScreenUpdateMethods.js';
import { victoryScreenRenderMethods } from './victoryScreenRenderMethods.js';

export class VictoryScreen {
/** Creates a new instance. @param {object} param1 - Destructured parameter. @returns {void} - Nothing. */
  constructor({ onRestart, onMainMenu }) {
    this._onRestart = onRestart;
    this._onMainMenu = onMainMenu;
    this._data = null;
    this._levelTime = 0;
    this._time = 0;
    this._atmoTimer = 0;
    this._hintBlink = 0;
    this._starPopped = [false, false, false];
    this._particles = makePool(ATMO_POOL + SPARK_MAX * 3);
  }
}

Object.assign(VictoryScreen.prototype, victoryScreenUpdateMethods, victoryScreenRenderMethods);
