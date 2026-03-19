import { GAME_STATES } from '../core/constants.js';
import { isMobileLayout, isPortraitMobile, shouldShowTouchControls } from './touchControlsShared.js';

export const touchControlsVisibilityMethods = {
  setGameState(state) {
    const stateChanged = state !== this._gameState;
    if (stateChanged) this._handleStateChange(state);
    this._updateVisibility();
  },

  _handleStateChange(state) {
    const wasVisible = shouldShowTouchControls(this._gameState);
    this._gameState = state;
    const isVisible = shouldShowTouchControls(state);
    if (wasVisible && !isVisible) this._clearAllInputFlags();
  },

  _updateVisibility() {
    if (!this._layer) return;
    const mobileLandscape = this._isLandscapeTouchLayout();
    this._layer.style.display = mobileLandscape ? 'block' : 'none';
    if (!mobileLandscape) return;
    const gameplayVisible = shouldShowTouchControls(this._gameState);
    const showBack = this._shouldShowBackButton();
    this._setGameplayVisibility(gameplayVisible);
    this._setUtilityVisibility(gameplayVisible, showBack);
  },

  _isLandscapeTouchLayout() {
    return isMobileLayout() && !isPortraitMobile();
  },

  _shouldShowBackButton() {
    const flags = this._getMobileUiFlags();
    const onStartSub = this._gameState === GAME_STATES.START && flags.startSubOpen;
    const onPauseSub = this._gameState === GAME_STATES.PAUSED && flags.pauseSubOpen;
    return onStartSub || onPauseSub;
  },

  _setGameplayVisibility(gameplayVisible) {
    const display = gameplayVisible ? 'flex' : 'none';
    for (const btn of this._gameplayButtons) btn.style.display = display;
    if (this._pauseBtn) this._pauseBtn.style.display = display;
  },

  _setUtilityVisibility(_gameplayVisible, showBack) {
    if (this._fullscreenBtn) this._fullscreenBtn.style.display = 'flex';
    if (this._backBtn) this._backBtn.style.display = showBack ? 'flex' : 'none';
  },

  _clearAllInputFlags() {
    const im = this._inputManager;
    im.left = false;
    im.right = false;
    im.up = false;
    im.down = false;
    im.jump = false;
    im.mobileUpActive = false;
    for (const btn of this._buttons) btn.classList.remove('tc-active');
  },
};
