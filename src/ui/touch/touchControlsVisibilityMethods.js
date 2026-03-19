// #region Imports
import { GAME_STATES } from '../../core/constants.js';
import {
  isGameplayTouchState,
  isMobileLayout,
  isPortraitMobile,
  isMenuTouchState,
  shouldShowTouchControls,
} from './touchControlsShared.js';

// #endregion
// #region Visibility Methods
export const touchControlsVisibilityMethods = {
/** Sets game State. @param {*} state - State value. @returns {void} - Nothing. */
  setGameState(state) {
    const stateChanged = state !== this._gameState;
    if (stateChanged) this._handleStateChange(state);
    this._updateVisibility();
  },

/** Handles state Change. @param {*} state - State value. @returns {void} - Nothing. */
  _handleStateChange(state) {
    const wasVisible = shouldShowTouchControls(this._gameState);
    this._gameState = state;
    const isVisible = shouldShowTouchControls(state);
    if (wasVisible && !isVisible) this._clearAllInputFlags();
  },

/** Updates visibility. @returns {void} - Nothing. */
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

/** Checks whether landscape Touch Layout. @returns {boolean} - Whether the check passes. */
  _isLandscapeTouchLayout() {
    return isMobileLayout() && !isPortraitMobile();
  },

/** Checks whether show Back Button. @returns {boolean} - Whether the check passes. */
  _shouldShowBackButton() {
    const flags = this._getMobileUiFlags();
    const onStartSub = this._gameState === GAME_STATES.START && flags.startSubOpen;
    const onPauseSub = this._gameState === GAME_STATES.PAUSED && flags.pauseSubOpen;
    return onStartSub || onPauseSub;
  },

/** Sets directional Visibility. @param {*} overlayVisible - Overlay Visible value. @returns {void} - Nothing. */
  _setDirectionalVisibility(overlayVisible) {
    const display = overlayVisible ? 'flex' : 'none';
    for (const btn of this._menuButtons) btn.style.display = display;
  },

/** Sets primary Action Visibility. @param {*} overlayVisible - Overlay Visible value. @returns {void} - Nothing. */
  _setPrimaryActionVisibility(overlayVisible) {
    if (this._jumpBtn) this._jumpBtn.style.display = overlayVisible ? 'flex' : 'none';
  },

/** Sets secondary Action Visibility. @returns {void} - Nothing. */
  _setSecondaryActionVisibility() {
    if (!this._rollBtn) return;
    this._rollBtn.style.display = isGameplayTouchState(this._gameState) ? 'flex' : 'none';
  },

/** Sets utility Visibility. @param {*} showBack - Show Back value. @returns {void} - Nothing. */
  _setUtilityVisibility(showBack) {
    if (this._pauseBtn) this._pauseBtn.style.display = this._shouldShowPauseButton() ? 'flex' : 'none';
    if (this._fullscreenBtn) this._fullscreenBtn.style.display = 'flex';
    if (this._backBtn) this._backBtn.style.display = showBack ? 'flex' : 'none';
  },

/** Checks whether show Pause Button. @returns {boolean} - Whether the check passes. */
  _shouldShowPauseButton() {
    return this._gameState === GAME_STATES.PLAYING || this._gameState === GAME_STATES.PAUSED;
  },

/** Handles sync Primary Action Appearance. @returns {*} - Resulting value. */
  _syncPrimaryActionAppearance() {
    if (!this._menuPrimaryBtn) return;
    if (isMenuTouchState(this._gameState)) return this._setPrimaryButtonText('✦', 'menu confirm');
    this._setPrimaryButtonText('⬆', 'jump');
  },

/** Sets primary Button Text. @param {*} text - Text value. @param {*} label - Label value. @returns {void} - Nothing. */
  _setPrimaryButtonText(text, label) {
    this._menuPrimaryBtn.textContent = text;
    this._menuPrimaryBtn.setAttribute('aria-label', label);
  },

/** Clears all Input Flags. @returns {void} - Nothing. */
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
// #endregion