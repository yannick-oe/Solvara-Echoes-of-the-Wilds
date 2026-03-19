import { startScreenInputMethods } from './startScreenInputMethods.js';
import { startScreenRenderMethods } from './startScreenRenderMethods.js';

export class StartScreen {
  constructor(onStart) {
    this._onStart = onStart;
    this._selectedCharacter = 'fox';
    this._reset();
  }
}

Object.assign(StartScreen.prototype, startScreenInputMethods, startScreenRenderMethods);
