import { GAME_STATES } from '../../core/constants.js';
import {
  isGameplayTouchState,
  isMobileLayout,
  isPortraitMobile,
  isMenuTouchState,
  shouldShowTouchControls,
} from './touchControlsShared.js';

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
    const overlayVisible = shouldShowTouchControls(this._gameState);
    const showBack = this._shouldShowBackButton();
    this._setDirectionalVisibility(overlayVisible);
    this._setPrimaryActionVisibility(overlayVisible);
    this._setSecondaryActionVisibility();
    this._setUtilityVisibility(showBack);
    this._syncPrimaryActionAppearance();
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

  _setDirectionalVisibility(overlayVisible) {
    const display = overlayVisible ? 'flex' : 'none';
    for (const btn of this._menuButtons) btn.style.display = display;
  },

  _setPrimaryActionVisibility(overlayVisible) {
    if (this._jumpBtn) this._jumpBtn.style.display = overlayVisible ? 'flex' : 'none';
  },

  _setSecondaryActionVisibility() {
    if (!this._rollBtn) return;
    this._rollBtn.style.display = isGameplayTouchState(this._gameState) ? 'flex' : 'none';
  },

  _setUtilityVisibility(showBack) {
    if (this._pauseBtn) this._pauseBtn.style.display = this._shouldShowPauseButton() ? 'flex' : 'none';
    if (this._fullscreenBtn) this._fullscreenBtn.style.display = 'flex';
    if (this._backBtn) this._backBtn.style.display = showBack ? 'flex' : 'none';
  },

  _shouldShowPauseButton() {
    return this._gameState === GAME_STATES.PLAYING || this._gameState === GAME_STATES.PAUSED;
  },

  _syncPrimaryActionAppearance() {
    if (!this._menuPrimaryBtn) return;
    if (isMenuTouchState(this._gameState)) return this._setPrimaryButtonText('✦', 'menu confirm');
    this._setPrimaryButtonText('⬆', 'jump');
  },

  _setPrimaryButtonText(text, label) {
    this._menuPrimaryBtn.textContent = text;
    this._menuPrimaryBtn.setAttribute('aria-label', label);
  },

  _clearAllInputFlags() {
    const im = this._inputManager;
    im.left = false;
    im.right = false;
    im.up = false;
    im.down = false;
    im.jump = false;
    im.enterPressed = false;
    im.rollPressed = false;
    im.mobileUpActive = false;
    for (const btn of this._buttons) btn.classList.remove('tc-active');
  },
};
