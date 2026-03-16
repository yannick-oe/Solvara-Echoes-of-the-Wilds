// #region Imports
import { GAME_STATES } from '../core/constants.js';
// #endregion

// #region Constants
const BTN    = 56;
const BTN_SM = 40;
const EDGE = 12;
const GAP = 8;
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
  return isTouchDevice() &&
         Math.max(window.screen.width, window.screen.height) <= 900;
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
    if (state === this._gameState) return;
    const wasVisible = shouldShowTouchControls(this._gameState);
    this._gameState  = state;
    const isVisible  = shouldShowTouchControls(state);
    if (wasVisible && !isVisible) this._clearAllInputFlags();
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
   */
  _buildLayer() {
    const el = document.createElement('div');
    el.id    = 'touchLayer';
    el.style.cssText = [
      'position: fixed',
      'inset: 0',
      'z-index: 40',
      'pointer-events: none',
      'user-select: none',
      '-webkit-user-select: none',
      'display: none',
    ].join('; ');
    document.body.appendChild(el);
    this._layer = el;
  }

  /**
   * Handles build buttons.
   */
  _buildButtons() {
    const main = window.innerWidth < 740 ? 52 : BTN;
    const small = window.innerWidth < 740 ? 38 : BTN_SM;
    const step = main + GAP;
    const topStep = small + GAP;

    this._makeBtn('◄', 'dir-left',  'left',  { left: EDGE,            bottom: EDGE + step }, main, true);
    this._makeBtn('▲', 'dir-up',    'up',    { left: EDGE + step,     bottom: EDGE + (step * 2) }, main, true);
    this._makeBtn('▼', 'dir-down',  'down',  { left: EDGE + step,     bottom: EDGE }, main, true);
    this._makeBtn('►', 'dir-right', 'right', { left: EDGE + (step * 2), bottom: EDGE + step }, main, true);

    this._makeBtn('↷', 'act-roll',  'roll',  { right: EDGE + step,    bottom: EDGE }, main, true);
    this._makeBtn('✦', 'act-jump',  'jump',  { right: EDGE,           bottom: EDGE }, main, true);

    this._makePauseBtn({ top: EDGE, right: EDGE }, small);
    this._makeFullscreenBtn({ top: EDGE, right: EDGE + topStep }, small);
    this._makeBackBtn({ top: EDGE, left: EDGE }, small);
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
    const im  = this._inputManager;
    const onDown = e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');
      if (action === 'jump') {
        if (!im.jump) im.jumpPressed = true;
        im.jump = true;
      } else if (action === 'roll') {
        im.rollPressed = true;
      } else {
        im[action] = true;
        if (action === 'up') im.mobileUpActive = true;
      }
    };
    const onUp = () => {
      btn.classList.remove('tc-active');
      if (action === 'jump') {
        im.jump = false;
      } else if (action !== 'roll') {
        im[action] = false;
        if (action === 'up') im.mobileUpActive = false;
      }
    };
    btn.addEventListener('pointerdown',        onDown);
    btn.addEventListener('pointerup',          onUp);
    btn.addEventListener('pointercancel',      onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu',        e => e.preventDefault());
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    this._gameplayButtons.push(btn);
  }

  /**
   * Handles make pause btn.
   * @param {object} pos Input parameter.
   */
  _makePauseBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⚙', 'act-pause', pos, size, true);
    const im  = this._inputManager;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');
      im.pausePressed = true;
    });
    const onUp = () => btn.classList.remove('tc-active');
    btn.addEventListener('pointerup',          onUp);
    btn.addEventListener('pointercancel',      onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu',        e => e.preventDefault());
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    this._pauseBtn = btn;
  }

  /**
   * Creates the dedicated mobile fullscreen button.
   * @param {object} pos Input parameter.
   */
  _makeFullscreenBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⛶', 'act-fullscreen', pos, size, true);
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');
      this._requestFullscreen();
    });
    const onUp = () => btn.classList.remove('tc-active');
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    this._fullscreenBtn = btn;
  }

  /**
   * Creates the mobile-only touch back button for subpanels.
   * @param {object} pos Input parameter.
   */
  _makeBackBtn(pos, size = BTN_SM) {
    const btn = this._createEl('↩', 'act-back', pos, size, true);
    const im = this._inputManager;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');
      im.backPressed = true;
    });
    const onUp = () => btn.classList.remove('tc-active');
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    this._backBtn = btn;
  }

  /**
   * Requests fullscreen on the game container when supported.
   */
  _requestFullscreen() {
    const req = this._container.requestFullscreen ?? this._container.webkitRequestFullscreen;
    req?.call(this._container)?.catch?.(() => {});
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
    btn.id        = `tc-${id}`;
    btn.className = 'tc-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', id.replace(/-/g, ' '));
    const posCSS = Object.entries(pos).map(([k, v]) => {
      if (withSAI && k === 'bottom') {
        return `bottom: calc(${v}px + env(safe-area-inset-bottom, 0px))`;
      }
      if (withSAI && k === 'top') {
        return `top: calc(${v}px + env(safe-area-inset-top, 0px))`;
      }
      if (withSAI && k === 'left') {
        return `left: calc(${v}px + env(safe-area-inset-left, 0px))`;
      }
      if (withSAI && k === 'right') {
        return `right: calc(${v}px + env(safe-area-inset-right, 0px))`;
      }
      return `${k}: ${v}px`;
    }).join('; ');
    btn.style.cssText = `
      position: fixed;
      ${posCSS};
      width:  ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(22, 14, 6, 0.60);
      border: 2px solid rgba(180, 140, 55, 0.55);
      color: rgba(236, 196, 88, 0.92);
      font-size: ${Math.round(size * 0.42)}px;
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
    return btn;
  }

  /**
   * Handles update visibility.
   */
  _updateVisibility() {
    if (!this._layer) return;

    const mobileLandscape = isMobileLayout() && !isPortraitMobile();
    this._layer.style.display = mobileLandscape ? 'block' : 'none';
    if (!mobileLandscape) return;

    const gameplayVisible = shouldShowTouchControls(this._gameState);
    const flags = this._getMobileUiFlags();
    const showBack = (this._gameState === GAME_STATES.START && flags.startSubOpen)
      || (this._gameState === GAME_STATES.PAUSED && flags.pauseSubOpen);

    for (const btn of this._gameplayButtons) {
      btn.style.display = gameplayVisible ? 'flex' : 'none';
    }

    if (this._pauseBtn) {
      this._pauseBtn.style.display = gameplayVisible ? 'flex' : 'none';
    }
    if (this._fullscreenBtn) {
      this._fullscreenBtn.style.display = 'flex';
    }
    if (this._backBtn) {
      this._backBtn.style.display = showBack ? 'flex' : 'none';
    }
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