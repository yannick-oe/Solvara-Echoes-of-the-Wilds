// #region Imports
import { startScreenInputMethods } from './startScreenInputMethods.js';
import { startScreenRenderMethods } from './startScreenRenderMethods.js';

// #endregion
// #region Class Definition
export class StartScreen {
/** Creates a new instance. @param {*} onStart - On Start value. @returns {void} - Nothing. */
  constructor(onStart) {
    this._onStart = onStart;
    this._selectedCharacter = 'fox';
    this._reset();
  }
}

Object.assign(StartScreen.prototype, startScreenInputMethods, startScreenRenderMethods);
// #endregion