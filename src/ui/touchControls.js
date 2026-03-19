export {
  isTouchDevice,
  isMobileLayout,
  isPortraitMobile,
  shouldShowTouchControls,
} from './touchControlsShared.js';

import { touchControlsDomMethods } from './touchControlsDomMethods.js';
import { touchControlsVisibilityMethods } from './touchControlsVisibilityMethods.js';

export class TouchControls {
  constructor(container, inputManager, getState, getMobileUiFlags = () => ({ startSubOpen: false, pauseSubOpen: false })) {
    this._container = container;
    this._inputManager = inputManager;
    this._getState = getState;
    this._getMobileUiFlags = getMobileUiFlags;
    this._layer = null;
    this._buttons = [];
    this._gameplayButtons = [];
    this._pauseBtn = null;
    this._fullscreenBtn = null;
    this._backBtn = null;
    this._gameState = null;
    this._onDocTap = null;
    this._onResize = null;
  }
}

Object.assign(TouchControls.prototype, touchControlsDomMethods, touchControlsVisibilityMethods);
