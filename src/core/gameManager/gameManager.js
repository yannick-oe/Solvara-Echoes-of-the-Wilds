import { gameManagerSetupMethods } from './gameManagerSetupMethods.js';
import { gameManagerUpdateMethods } from './gameManagerUpdateMethods.js';
import { gameManagerRenderMethods } from './gameManagerRenderMethods.js';

export class GameManager {
/** Creates a new instance. @param {*} canvas - Canvas value. @param {*} container - Container value. @returns {void} - Nothing. */
  constructor(canvas, container) {
    this._initCoreState(canvas, container);
    this._initWorldState();
    this._initSessionState();
    this._initUiScreens();
    this._initTouchControls(container);
    this._loop = this._loop.bind(this);
  }
}

Object.assign(
  GameManager.prototype,
  gameManagerSetupMethods,
  gameManagerUpdateMethods,
  gameManagerRenderMethods,
);