import { GAME_STATES } from '../../core/constants.js';
import {
  BTN, BTN_SM, BUTTON_CSS_TEMPLATE, EDGE, GAP, TOUCH_LAYER_STYLE,
  isMenuTouchState, isMobileLayout,
} from './touchControlsShared.js';

export const touchControlsDomMethods = {
  init() {
    if (!isMobileLayout()) return;
    this._injectStyles();
    this._buildLayer();
    this._buildButtons();
    this._gameState = this._getState();
    this._updateVisibility();
    this._attachDocTap();
    this._onResize = () => this._updateVisibility();
    window.addEventListener('resize', this._onResize);
  },

  destroy() {
    this._clearAllInputFlags();
    this._layer?.remove();
    this._layer = null;
    this._buttons = [];
    if (this._onDocTap) document.removeEventListener('touchstart', this._onDocTap);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  },

  _injectStyles() {
    if (document.getElementById('tc-styles')) return;
    const s = document.createElement('style');
    s.id = 'tc-styles';
    s.textContent = `
      .tc-btn {
        position: fixed;
        isolation: isolate;
      }
      .tc-btn::before,
      .tc-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
      }
      .tc-btn::before {
        inset: 1px;
        background:
          linear-gradient(180deg, rgba(255, 247, 223, 0.12), rgba(255, 247, 223, 0.03) 26%, rgba(255, 247, 223, 0.00) 54%),
          radial-gradient(circle at 50% 18%, rgba(255, 221, 157, 0.10), rgba(255, 221, 157, 0.00) 58%);
        box-shadow:
          inset 0 1px 0 rgba(255, 247, 223, 0.12),
          inset 0 -8px 10px rgba(0, 0, 0, 0.12);
        opacity: 0.95;
      }
      .tc-btn::after {
        inset: -4px;
        border: 1px solid rgba(228, 190, 108, 0.14);
        box-shadow:
          0 0 16px rgba(216, 161, 78, 0.09),
          inset 0 0 8px rgba(255, 233, 173, 0.06);
        opacity: 0.90;
      }
      [id^='tc-dir-'] {
        border-color: rgba(214, 180, 114, 0.52) !important;
      }
      [id^='tc-act-'] {
        border-color: rgba(224, 189, 112, 0.58) !important;
      }
      #tc-act-jump,
      #tc-act-action {
        box-shadow:
          0 12px 26px rgba(0,0,0,0.26),
          0 0 18px rgba(198, 151, 75, 0.12),
          inset 0 1px 0 rgba(255, 243, 212, 0.16),
          inset 0 -10px 16px rgba(0,0,0,0.14) !important;
      }
      #tc-act-pause,
      #tc-act-fullscreen,
      #tc-act-back {
        background:
          radial-gradient(circle at 30% 26%, rgba(255, 234, 194, 0.08), rgba(214, 166, 86, 0.04) 18%, rgba(24, 18, 15, 0.14) 56%, rgba(8, 7, 8, 0.18)) !important;
        border-color: rgba(204, 168, 96, 0.48) !important;
      }
      .tc-btn.tc-active {
        background:
          radial-gradient(circle at 30% 24%, rgba(255, 237, 202, 0.18), rgba(220, 176, 92, 0.12) 20%, rgba(44, 30, 16, 0.26) 60%, rgba(11, 8, 8, 0.28)) !important;
        border-color: rgba(248, 220, 146, 0.96) !important;
        color: rgba(255, 247, 214, 1.0) !important;
        text-shadow: 0 0 14px rgba(255, 234, 181, 0.34);
        transform: translateY(1px) scale(0.97);
        box-shadow:
          0 12px 28px rgba(0,0,0,0.28),
          0 0 24px rgba(226, 171, 83, 0.22),
          inset 0 1px 0 rgba(255, 246, 219, 0.22),
          inset 0 -10px 14px rgba(0,0,0,0.18) !important;
      }
      .tc-btn.tc-active::before {
        opacity: 1;
        background:
          linear-gradient(180deg, rgba(255, 247, 223, 0.18), rgba(255, 247, 223, 0.06) 30%, rgba(255, 247, 223, 0.00) 58%),
          radial-gradient(circle at 50% 16%, rgba(255, 223, 163, 0.14), rgba(255, 223, 163, 0.00) 58%);
      }
      .tc-btn.tc-active::after {
        border-color: rgba(248, 220, 146, 0.28);
        box-shadow:
          0 0 20px rgba(226, 171, 83, 0.18),
          inset 0 0 10px rgba(255, 236, 186, 0.08);
      }
    `;
    document.head.appendChild(s);
  },

  _buildLayer() {
    const el = document.createElement('div');
    el.id = 'touchLayer';
    el.style.cssText = TOUCH_LAYER_STYLE;
    this._container.appendChild(el);
    this._layer = el;
  },

  _buildButtons() {
    const sizes = this._getButtonSizes();
    this._buildDirectionButtons(sizes.main, sizes.dpadStep);
    this._buildActionButtons(sizes.main, sizes.actionStep);
    this._buildUtilityButtons(sizes.small, sizes.topStep);
  },

  _getButtonSizes() {
    const smallViewport = window.innerWidth < 740;
    const main = smallViewport ? 54 : BTN;
    const small = smallViewport ? 38 : BTN_SM;
    return {
      main,
      small,
      actionStep: Math.round(main * 0.88),
      dpadStep: Math.round(main * 0.80),
      topStep: small + GAP,
    };
  },

  _buildDirectionButtons(size, step) {
    this._makeDirectionBtn('◄', 'dir-left', 'left', { left: EDGE, bottom: EDGE + step }, size);
    this._makeDirectionBtn('▲', 'dir-up', 'up', { left: EDGE + step, bottom: EDGE + step * 2 }, size);
    this._makeDirectionBtn('▼', 'dir-down', 'down', { left: EDGE + step, bottom: EDGE }, size);
    this._makeDirectionBtn('►', 'dir-right', 'right', { left: EDGE + step * 2, bottom: EDGE + step }, size);
  },

  _buildActionButtons(size, step) {
    this._rollBtn = this._makeActionBtn('✦', 'act-action', 'roll', { right: EDGE + step, bottom: EDGE + Math.round(step * 0.54) }, size);
    this._jumpBtn = this._makeActionBtn('⬆', 'act-jump', 'jump', { right: EDGE, bottom: EDGE }, size);
    this._menuPrimaryBtn = this._jumpBtn;
  },

  _buildUtilityButtons(size, topStep) {
    this._makePauseBtn({ top: EDGE, right: EDGE }, size);
    this._makeFullscreenBtn({ top: EDGE, right: EDGE + topStep }, size);
    this._makeBackBtn({ top: EDGE, left: EDGE }, size);
    this._applyHudClearTop(this._pauseBtn);
    this._applyHudClearTop(this._fullscreenBtn);
  },

  _applyHudClearTop(btn) {
    if (btn) btn.style.top = 'calc(16vh + env(safe-area-inset-top, 0px))';
  },

  _makeDirectionBtn(label, id, action, pos, size = BTN, withSAI = true) {
    const btn = this._createEl(label, id, pos, size, withSAI);
    const onDown = e => this._handleDirectionDown(e, btn, action);
    const onUp = () => this._handleDirectionUp(btn, action);
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn, { gameplay: true, menu: true });
  },

  _makeActionBtn(label, id, action, pos, size = BTN, withSAI = true) {
    const btn = this._createEl(label, id, pos, size, withSAI);
    const onDown = e => this._handleActionDown(e, btn, action);
    const onUp = () => this._handleActionUp(btn, action);
    this._attachPressHandlers(btn, onDown, onUp);
    this._registerBtn(btn, { gameplay: true });
    return btn;
  },

  _handleDirectionDown(e, btn, action) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    this._setDirectionDown(this._inputManager, action);
  },

  _handleDirectionUp(btn, action) {
    btn.classList.remove('tc-active');
    this._setDirectionUp(this._inputManager, action);
  },

  _handleActionDown(e, btn, action) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    if (isMenuTouchState(this._gameState)) return this._setMenuConfirmDown();
    if (action === 'jump') return this._setJumpDown(this._inputManager);
    if (action === 'roll') this._setRollDown(this._inputManager);
  },

  _handleActionUp(btn, action) {
    btn.classList.remove('tc-active');
    if (isMenuTouchState(this._gameState)) return;
    if (action === 'jump') this._setJumpUp(this._inputManager);
  },

  _setMenuConfirmDown() {
    this._inputManager.enterPressed = true;
  },

  _setJumpDown(im) {
    if (!im.jump) im.jumpPressed = true;
    im.jump = true;
  },

  _setRollDown(im) {
    im.rollPressed = true;
  },

  _setDirectionDown(im, action) {
    im[action] = true;
    if (action === 'up') im.mobileUpActive = true;
  },

  _setJumpUp(im) {
    im.jump = false;
  },

  _setDirectionUp(im, action) {
    im[action] = false;
    if (action === 'up') im.mobileUpActive = false;
  },

  _attachPressHandlers(btn, onDown, onUp) {
    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  },

  _registerBtn(btn, groups = {}) {
    this._layer.appendChild(btn);
    this._buttons.push(btn);
    if (groups.gameplay) this._gameplayButtons.push(btn);
    if (groups.menu) this._menuButtons.push(btn);
  },

  _makePauseBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⚙', 'act-pause', pos, size, true);
    this._attachUtilityHandlers(btn, e => this._setSignalPressed(e, btn, 'pausePressed'));
    this._registerBtn(btn);
    this._pauseBtn = btn;
  },

  _makeFullscreenBtn(pos, size = BTN_SM) {
    const btn = this._createEl('⛶', 'act-fullscreen', pos, size, true);
    this._attachUtilityHandlers(btn, e => this._handleFullscreenDown(e, btn));
    this._registerBtn(btn);
    this._fullscreenBtn = btn;
  },

  _makeBackBtn(pos, size = BTN_SM) {
    const btn = this._createEl('↩', 'act-back', pos, size, true);
    this._attachUtilityHandlers(btn, e => this._setSignalPressed(e, btn, 'backPressed'));
    this._registerBtn(btn);
    this._backBtn = btn;
  },

  _attachUtilityHandlers(btn, onDown) {
    const onUp = () => btn.classList.remove('tc-active');
    this._attachPressHandlers(btn, onDown, onUp);
  },

  _setSignalPressed(e, btn, flag) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    this._inputManager[flag] = true;
  },

  _handleFullscreenDown(e, btn) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('tc-active');
    this._toggleFullscreen();
  },

  _toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) return this._exitFullscreen();
    this._enterFullscreen();
  },

  _enterFullscreen() {
    const req = this._container.requestFullscreen ?? this._container.webkitRequestFullscreen;
    req?.call(this._container)?.catch?.(() => {});
  },

  _exitFullscreen() {
    const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
    exit?.call(document)?.catch?.(() => {});
  },

  _createEl(label, id, pos, size, withSAI = false) {
    const btn = document.createElement('button');
    btn.id = `tc-${id}`;
    btn.className = 'tc-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', id.replace(/-/g, ' '));
    this._applyButtonStyles(btn, pos, size, withSAI);
    return btn;
  },

  _applyButtonStyles(btn, pos, size, withSAI) {
    const posCSS = this._buildPositionCss(pos, withSAI);
    btn.style.cssText = this._buttonCssText(posCSS, size);
  },

  _buttonCssText(posCSS, size) {
    const fontSize = Math.round(size * 0.42);
    return BUTTON_CSS_TEMPLATE
      .replaceAll('__POS__', posCSS)
      .replaceAll('__SIZE__', String(size))
      .replaceAll('__FONT__', String(fontSize));
  },

  _buildPositionCss(pos, withSAI) {
    return Object.entries(pos).map(([k, v]) => this._positionRule(k, v, withSAI)).join('; ');
  },

  _positionRule(key, value, withSAI) {
    if (!withSAI) return `${key}: ${value}px`;
    if (key === 'bottom') return `bottom: calc(${value}px + env(safe-area-inset-bottom, 0px))`;
    if (key === 'top') return `top: calc(${value}px + env(safe-area-inset-top, 0px))`;
    if (key === 'left') return `left: calc(${value}px + env(safe-area-inset-left, 0px))`;
    if (key === 'right') return `right: calc(${value}px + env(safe-area-inset-right, 0px))`;
    return `${key}: ${value}px`;
  },

  _attachDocTap() {
    this._onDocTap = e => {
      const state = this._getState();
      if (state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED || state === GAME_STATES.LOADING) return;
      if (state === GAME_STATES.START && this._isLandscapeTouchLayout()) return;
      if (e.target.classList.contains('tc-btn')) return;
      this._inputManager.enterPressed = true;
    };
    document.addEventListener('touchstart', this._onDocTap, { passive: true });
  },
};
