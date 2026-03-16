// #region Imports
import { GAME_STATES } from '../core/constants.js';
// #endregion

// #region Constants
const BTN    = 56;
const BTN_SM = 40;
const EDGE = 12;
const GAP = 8;
const TABLET_MAX_DIM = 1400;
const TOUCH_LAYER_STYLE = [
  'position: fixed',
  'inset: 0',
  'z-index: 40',
  'pointer-events: none',
  'user-select: none',
  '-webkit-user-select: none',
  'display: none',
].join('; ');
const BUTTON_CSS_TEMPLATE = `
  position: fixed;
  __POS__;
  width:  __SIZE__px;
  height: __SIZE__px;
  border-radius: 50%;
  background: rgba(22, 14, 6, 0.60);
  border: 2px solid rgba(180, 140, 55, 0.55);
  color: rgba(236, 196, 88, 0.92);
  font-size: __FONT__px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.60), inset 0 0 0 1px rgba(240,200,100,0.10);
  transition: background 0.07s, border-color 0.07s;
`;
// #endregion

// #region Class Definition
/**
 * Handles is touch device.
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Handles is mobile layout.
 */
export function isMobileLayout() {
  if (!isTouchDevice()) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const maxDim = Math.max(window.screen.width, window.screen.height);
  return coarse && noHover && maxDim <= TABLET_MAX_DIM;
}

/**
 * Handles is portrait mobile.
 */
export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

/**
 * Handles should show touch controls.
 * @param {string} state Input parameter.
 */
export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
         !isPortraitMobile() &&
         (state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}
export class TouchControls {

  /**
   * Creates a new instance.
   * @param {object} container Input parameter.
   * @param {object} inputManager Input parameter.
   * @param {string} getState Input parameter.
   * @param {object} getMobileUiFlags Input parameter.
   */
  constructor(container, inputManager, getState, getMobileUiFlags = () => ({ startSubOpen: false, pauseSubOpen: false })) {
    this._container    = container;
    this._inputManager = inputManager;
    this._getState     = getState;
    this._getMobileUiFlags = getMobileUiFlags;

    this._layer        = null;
    this._buttons      = [];
    this._gameplayButtons = [];
    this._pauseBtn = null;
    this._fullscreenBtn = null;
    this._backBtn = null;
    this._gameState    = null;

    this._onDocTap     = null;
    this._onResize     = null;
  }

  /**
   * Handles init.
   */
  init() {
    if (!isMobileLayout()) return;
    this._injectStyles();
    this._buildLayer();
    this._buildButtons();
    this._attachDocTap();
    this._onResize = () => this._updateVisibility();
    window.addEventListener('resize', this._onResize);
  }

  /**
   * Handles set game state.
   * @param {string} state Input parameter.
   */
  setGameState(state) {
    const stateChanged = state !== this._gameState;
    if (stateChanged) {
      const wasVisible = shouldShowTouchControls(this._gameState);
      this._gameState  = state;
      const isVisible  = shouldShowTouchControls(state);
      if (wasVisible && !isVisible) this._clearAllInputFlags();
    }
    this._updateVisibility();
  }

  /**
   * Handles destroy.
   */
  destroy() {
    this._clearAllInputFlags();
    this._layer?.remove();
    this._layer   = null;
    this._buttons = [];
    if (this._onDocTap) document.removeEventListener('touchstart', this._onDocTap);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }

  /**
   * Handles inject styles.
   */
  _injectStyles() {
    if (document.getElementById('tc-styles')) return;
    const s = document.createElement('style');
    s.id = 'tc-styles';
    s.textContent = `
      .tc-btn.tc-active {
        background:   rgba(155, 115, 26, 0.78) !important;
        border-color: rgba(240, 200, 78, 0.95) !important;
        color:        rgba(255, 248, 168, 1.0)  !important;
      }
    `;
    document.head.appendChild(s);
  }

  /**
   * Handles build layer.
   * Append to container to ensure touch overlay enters fullscreen with the game.
   */
  _buildLayer() {
    const el = document.createElement('div');
    el.id = 'touchLayer';
    el.style.cssText = TOUCH_LAYER_STYLE;
    this._container.appendChild(el);
    this._layer = el;
  }

  /**
   * Handles build buttons.
   */
  _buildButtons() {
    const sizes = this._getButtonSizes();
    this._buildDirectionButtons(sizes.main, sizes.step);
    this._buildActionButtons(sizes.main, sizes.step);
    this._buildUtilityButtons(sizes.small, sizes.topStep);
  }

  /**
   * Returns responsive button sizes.
   */
  _getButtonSizes() {
    const smallViewport = window.innerWidth < 740;
    const main = smallViewport ? 52 : BTN;
    const small = smallViewport ? 38 : BTN_SM;
    return { main, small, step: main + GAP, topStep: small + GAP };
  }

  /**
   * Creates directional cluster.
   * @param {number} size Input parameter.
   * @param {number} step Input parameter.
   */
  _buildDirectionButtons(size, step) {
    this._makeBtn('◄', 'dir-left', 'left', { left: EDGE, bottom: EDGE + step }, size, true);
    this._makeBtn('▲', 'dir-up', 'up', { left: EDGE + step, bottom: EDGE + step * 2 }, size, true);
    this._makeBtn('▼', 'dir-down', 'down', { left: EDGE + step, bottom: EDGE }, size, true);
    this._makeBtn('►', 'dir-right', 'right', { left: EDGE + step * 2, bottom: EDGE + step }, size, true);
  }

  /**
   * Creates gameplay action buttons.
   * @param {number} size Input parameter.
   * @param {number} step Input parameter.
   */
  _buildActionButtons(size, step) {
    this._makeBtn('✦', 'act-action', 'roll', { right: EDGE + step, bottom: EDGE }, size, true);
    this._makeBtn('⬆', 'act-jump', 'jump', { right: EDGE, bottom: EDGE }, size, true);
  }

  /**
   * Creates utility buttons for menus and fullscreen.
   * @param {number} size Input parameter.
   * @param {number} topStep Input parameter.
   */
  _buildUtilityButtons(size, topStep) {
    this._makePauseBtn({ top: EDGE, right: EDGE }, size);
    this._makeFullscreenBtn({ top: EDGE, right: EDGE + topStep }, size);
    this._makeBackBtn({ top: EDGE, left: EDGE }, size);
    this._applyHudClearTop(this._pauseBtn);
    this._applyHudClearTop(this._fullscreenBtn);
  }

  /**
   * Overrides the top position of a utility button to sit below the HUD.
   * Uses 16vh so the offset scales proportionally with screen height,
   * clearing the score panel (HUD bottom ≈ 13.75vh) on all device sizes.
   * @param {HTMLElement|null} btn Input parameter.
   */
  _applyHudClearTop(btn) {
    if (btn) btn.style.top = 'calc(16vh + env(safe-area-inset-top, 0px))';
  }

  /**
   * Handles make btn.
   * @param {string} label Input parameter.
   * @param {string} id Input parameter.
   * @param {object} action Input parameter.
   * @param {object} pos Input parameter.
   */
  _makeBtn(label, id, action, pos, size = BTN, withSAI = true) {
    const btn = this._createEl(label, id, pos, size, withSAI);
    const onDown = e => this._handleGameplayDown(e, btn, action);
    const onUp = () => this._handleGameplayUp(btn, action);
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn, true);
  }

  /**
   * Handles gameplay pointer down behavior.
   * @param {PointerEvent} e Input parameter.
   * @param {HTMLElement} btn Input parameter.
   * @param {string} action Input parameter.
   */
  _handleGameplayDown(e, btn, action) {
    const im = this._inputManager;
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    if (action === 'jump') return this._setJumpDown(im);
    if (action === 'roll') return this._setRollDown(im);
    this._setDirectionDown(im, action);
  }

  /**
   * Handles gameplay pointer up behavior.
   * @param {HTMLElement} btn Input parameter.
   * @param {string} action Input parameter.
   */
  _handleGameplayUp(btn, action) {
    const im = this._inputManager;
    btn.classList.remove('tc-active');
    if (action === 'jump') return this._setJumpUp(im);
    if (action === 'roll') return;
    this._setDirectionUp(im, action);
  }

  /**
   * Handles set jump down.
   * @param {object} im Input parameter.
   */
  _setJumpDown(im) {
    if (!im.jump) im.jumpPressed = true;
    im.jump = true;
  }

  /**
   * Handles set roll down.
   * @param {object} im Input parameter.
   */
  _setRollDown(im) {
    im.rollPressed = true;
  }

  /**
   * Handles set direction down.
   * @param {object} im Input parameter.
   * @param {string} action Input parameter.
   */
  _setDirectionDown(im, action) {
    im[action] = true;
    if (action === 'up') im.mobileUpActive = true;
  }

  /**
   * Handles set jump up.
   * @param {object} im Input parameter.
   */
  _setJumpUp(im) {
    im.jump = false;
  }

  /**
   * Handles set direction up.
   * @param {object} im Input parameter.
   * @param {string} action Input parameter.
   */
  _setDirectionUp(im, action) {
    im[action] = false;
    if (action === 'up') im.mobileUpActive = false;
  }

  /**
   * Attaches standard pointer handlers.
   * @param {HTMLElement} btn Input parameter.
   * @param {Function} onDown Input parameter.
   * @param {Function} onUp Input parameter.
   */
  _attachPressHandlers(btn, onDown, onUp) {
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * Registers a button in the layer and internal collections.
   * @param {HTMLElement} btn Input parameter.
   * @param {boolean} gameplayButton Input parameter.
   */
  _registerBtn(btn, gameplayButton = false) {
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    if (gameplayButton) this._gameplayButtons.push(btn);
  }

  /**
   * Handles make pause btn.
   * @param {object} pos Input parameter.
   */
  _makePauseBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⚙', 'act-pause', pos, size, true);
    const onDown = e => this._setSignalPressed(e, btn, 'pausePressed');
    const onUp = () => btn.classList.remove('tc-active');
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn);
    this._pauseBtn = btn;
  }

  /**
   * Creates the dedicated mobile fullscreen button.
   * @param {object} pos Input parameter.
   */
  _makeFullscreenBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⛶', 'act-fullscreen', pos, size, true);
    const onDown = e => this._handleFullscreenDown(e, btn);
    const onUp = () => btn.classList.remove('tc-active');
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn);
    this._fullscreenBtn = btn;
  }

  /**
   * Creates the mobile-only touch back button for subpanels.
   * @param {object} pos Input parameter.
   */
  _makeBackBtn(pos, size = BTN_SM) {
    const btn = this._createEl('↩', 'act-back', pos, size, true);
    const onDown = e => this._setSignalPressed(e, btn, 'backPressed');
    const onUp = () => btn.classList.remove('tc-active');
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn);
    this._backBtn = btn;
  }

  /**
   * Sets a single-press input flag.
   * @param {PointerEvent} e Input parameter.
   * @param {HTMLElement} btn Input parameter.
   * @param {string} flag Input parameter.
   */
  _setSignalPressed(e, btn, flag) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    this._inputManager[flag] = true;
  }

  /**
   * Handles fullscreen button down behavior.
   * @param {PointerEvent} e Input parameter.
   * @param {HTMLElement} btn Input parameter.
   */
  _handleFullscreenDown(e, btn) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    this._toggleFullscreen();
  }

  /**
   * Toggles fullscreen: enters when not in fullscreen, exits when already in fullscreen.
   * Supports both standard and webkit-prefixed APIs.
   */
  _toggleFullscreen() {
    const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (inFs) {
      const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
      exit?.call(document)?.catch?.(() => {});
    } else {
      const req = this._container.requestFullscreen ?? this._container.webkitRequestFullscreen;
      req?.call(this._container)?.catch?.(() => {});
    }
  }

  /**
   * Handles create el.
   * @param {string} label Input parameter.
   * @param {string} id Input parameter.
   * @param {object} pos Input parameter.
   * @param {number} size Input parameter.
   * @param {object} withSAI Input parameter.
   */
  _createEl(label, id, pos, size, withSAI = false) {
    const btn = document.createElement('button');
    btn.id = `tc-${id}`;
    btn.className = 'tc-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', id.replace(/-/g, ' '));
    this._applyButtonStyles(btn, pos, size, withSAI);
    return btn;
  }

  /**
   * Applies full inline button style string.
   * @param {HTMLElement} btn Input parameter.
   * @param {object} pos Input parameter.
   * @param {number} size Input parameter.
   * @param {boolean} withSAI Input parameter.
   */
  _applyButtonStyles(btn, pos, size, withSAI) {
    const posCSS = this._buildPositionCss(pos, withSAI);
    btn.style.cssText = this._buttonCssText(posCSS, size);
  }

  /**
   * Returns full button css text.
   * @param {string} posCSS Input parameter.
   * @param {number} size Input parameter.
   */
  _buttonCssText(posCSS, size) {
    const fontSize = Math.round(size * 0.42);
    return BUTTON_CSS_TEMPLATE
      .replaceAll('__POS__', posCSS)
      .replaceAll('__SIZE__', String(size))
      .replaceAll('__FONT__', String(fontSize));
  }

  /**
   * Builds positional CSS with optional safe area offsets.
   * @param {object} pos Input parameter.
   * @param {boolean} withSAI Input parameter.
   */
  _buildPositionCss(pos, withSAI) {
    return Object.entries(pos)
      .map(([k, v]) => this._positionRule(k, v, withSAI))
      .join('; ');
  }

  /**
   * Builds a single CSS position rule.
   * @param {string} key Input parameter.
   * @param {number} value Input parameter.
   * @param {boolean} withSAI Input parameter.
   */
  _positionRule(key, value, withSAI) {
    if (!withSAI) return `${key}: ${value}px`;
    if (key === 'bottom') return `bottom: calc(${value}px + env(safe-area-inset-bottom, 0px))`;
    if (key === 'top') return `top: calc(${value}px + env(safe-area-inset-top, 0px))`;
    if (key === 'left') return `left: calc(${value}px + env(safe-area-inset-left, 0px))`;
    if (key === 'right') return `right: calc(${value}px + env(safe-area-inset-right, 0px))`;
    return `${key}: ${value}px`;
  }

  /**
   * Handles update visibility.
   */
  _updateVisibility() {
    if (!this._layer) return;
    const mobileLandscape = this._isLandscapeTouchLayout();
    this._layer.style.display = mobileLandscape ? 'block' : 'none';
    if (!mobileLandscape) return;
    const gameplayVisible = shouldShowTouchControls(this._gameState);
    const showBack = this._shouldShowBackButton();
    this._setGameplayVisibility(gameplayVisible);
    this._setUtilityVisibility(gameplayVisible, showBack);
  }

  /**
   * Returns true when touch controls should be in landscape layout.
   */
  _isLandscapeTouchLayout() {
    return isMobileLayout() && !isPortraitMobile();
  }

  /**
   * Returns whether back button should be visible.
   */
  _shouldShowBackButton() {
    const flags = this._getMobileUiFlags();
    const onStartSub = this._gameState === GAME_STATES.START && flags.startSubOpen;
    const onPauseSub = this._gameState === GAME_STATES.PAUSED && flags.pauseSubOpen;
    return onStartSub || onPauseSub;
  }

  /**
   * Applies gameplay button visibility.
   * @param {boolean} gameplayVisible Input parameter.
   */
  _setGameplayVisibility(gameplayVisible) {
    const display = gameplayVisible ? 'flex' : 'none';
    for (const btn of this._gameplayButtons) btn.style.display = display;
    if (this._pauseBtn) this._pauseBtn.style.display = display;
  }

  /**
   * Applies utility button visibility.
   * @param {boolean} _gameplayVisible Input parameter.
   * @param {boolean} showBack Input parameter.
   */
  _setUtilityVisibility(_gameplayVisible, showBack) {
    if (this._fullscreenBtn) this._fullscreenBtn.style.display = 'flex';
    if (this._backBtn) this._backBtn.style.display = showBack ? 'flex' : 'none';
  }

  /**
   * Handles clear all input flags.
   */
  _clearAllInputFlags() {
    const im = this._inputManager;
    im.left         = false;
    im.right        = false;
    im.up           = false;
    im.down         = false;
    im.jump         = false;
    im.mobileUpActive = false;
    for (const btn of this._buttons) btn.classList.remove('tc-active');
  }

  /**
   * Handles attach doc tap.
   */
  _attachDocTap() {
    this._onDocTap = e => {
      const state = this._getState();

      if (state === GAME_STATES.PLAYING  ||
          state === GAME_STATES.PAUSED   ||
          state === GAME_STATES.LOADING) return;

      if (e.target.classList.contains('tc-btn')) return;
      this._inputManager.enterPressed = true;
    };
    document.addEventListener('touchstart', this._onDocTap, { passive: true });
  }
}
// #endregion