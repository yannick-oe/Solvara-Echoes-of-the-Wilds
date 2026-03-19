import { makePool } from '../victoryParticles.js';
import { ATMO_POOL, SPARK_MAX } from './victoryScreenShared.js';
import { victoryScreenUpdateMethods } from './victoryScreenUpdateMethods.js';
import { victoryScreenRenderMethods } from './victoryScreenRenderMethods.js';

export class VictoryScreen {
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
