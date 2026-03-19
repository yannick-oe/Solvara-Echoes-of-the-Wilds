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
    const signature = this._buildVisibilitySignature();
    if (signature === this._visibilitySignature) return;
    this._visibilitySignature = signature;
    const mobileLandscape = this._isLandscapeTouchLayout();
    this._setButtonDisplay(this._layer, mobileLandscape);
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

/** Builds visibility Signature. @returns {string} - Derived text value. */
  _buildVisibilitySignature() {
    const flags = this._getMobileUiFlags();
    return [
      this._gameState,
      this._isLandscapeTouchLayout() ? '1' : '0',
      flags.startSubOpen ? '1' : '0',
      flags.pauseSubOpen ? '1' : '0',
    ].join('|');
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
    for (const btn of this._menuButtons) this._setButtonDisplay(btn, overlayVisible);
  },

/** Sets primary Action Visibility. @param {*} overlayVisible - Overlay Visible value. @returns {void} - Nothing. */
  _setPrimaryActionVisibility(overlayVisible) {
    this._setButtonDisplay(this._jumpBtn, overlayVisible);
  },

/** Sets secondary Action Visibility. @returns {void} - Nothing. */
  _setSecondaryActionVisibility() {
    this._setButtonDisplay(this._rollBtn, isGameplayTouchState(this._gameState));
  },

/** Sets utility Visibility. @param {*} showBack - Show Back value. @returns {void} - Nothing. */
  _setUtilityVisibility(showBack) {
    this._setButtonDisplay(this._pauseBtn, this._shouldShowPauseButton());
    this._setButtonDisplay(this._fullscreenBtn, true);
    this._setButtonDisplay(this._backBtn, showBack);
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
    if (this._primaryText === text && this._primaryLabel === label) return;
    this._primaryText = text;
    this._primaryLabel = label;
    this._menuPrimaryBtn.textContent = text;
    this._menuPrimaryBtn.setAttribute('aria-label', label);
  },

/** Sets button Display. @param {*} btn - Btn value. @param {*} visible - Visible value. @returns {void} - Nothing. */
  _setButtonDisplay(btn, visible) {
    if (!btn) return;
    const next = visible ? 'flex' : 'none';
    if (btn === this._layer) return this._setLayerDisplay(next);
    if (btn.style.display === next) return;
    btn.style.display = next;
  },

/** Sets layer Display. @param {*} next - Next value. @returns {void} - Nothing. */
  _setLayerDisplay(next) {
    if (this._layer.style.display === next) return;
    this._layer.style.display = next === 'none' ? 'none' : 'block';
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
    im.mobileActionPressed = false;
    im.mobileUpActive = false;
    for (const btn of this._buttons) btn.classList.remove('tc-active');
  },
};
// #endregion
