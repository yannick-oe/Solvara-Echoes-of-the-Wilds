import { GAME_STATES } from '../core/constants.js';

const BTN    = 56;
const BTN_SM = 40;

const SAI = 'env(safe-area-inset-bottom, 0px)';

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileLayout() {
  return isTouchDevice() &&
         Math.max(window.screen.width, window.screen.height) <= 900;
}

export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
         !isPortraitMobile() &&
         (state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}

export class TouchControls {


  constructor(container, inputManager, getState) {
    this._container    = container;
    this._inputManager = inputManager;
    this._getState     = getState;

    this._layer        = null;
    this._buttons      = [];
    this._gameState    = null;

    this._onDocTap     = null;
    this._onResize     = null;
  }





  init() {
    if (!isMobileLayout()) return;
    this._injectStyles();
    this._buildLayer();
    this._buildButtons();
    this._attachDocTap();
    this._onResize = () => this._updateVisibility();
    window.addEventListener('resize', this._onResize);
  }



  setGameState(state) {
    if (state === this._gameState) return;
    const wasVisible = shouldShowTouchControls(this._gameState);
    this._gameState  = state;
    const isVisible  = shouldShowTouchControls(state);


    if (wasVisible && !isVisible) this._clearAllInputFlags();

    this._updateVisibility();
  }


  destroy() {
    this._clearAllInputFlags();
    this._layer?.remove();
    this._layer   = null;
    this._buttons = [];
    if (this._onDocTap) document.removeEventListener('touchstart', this._onDocTap);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }





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


  _buildLayer() {
    const el = document.createElement('div');
    el.id    = 'touchLayer';
    el.style.cssText = [
      'position: fixed',
      'inset: 0',
      'z-index: 20',
      'pointer-events: none',
      'user-select: none',
      '-webkit-user-select: none',
      'display: none',
    ].join('; ');
    document.body.appendChild(el);
    this._layer = el;
  }



  _buildButtons() {

    this._makeBtn('◄', 'dir-left',  'left',  { left: 10,  bottom: 75  });
    this._makeBtn('▲', 'dir-up',    'up',    { left: 74,  bottom: 139 });
    this._makeBtn('▼', 'dir-down',  'down',  { left: 74,  bottom: 11  });
    this._makeBtn('►', 'dir-right', 'right', { left: 138, bottom: 75  });


    this._makeBtn('↷', 'act-roll',  'roll',  { right: 80, bottom: 11  });
    this._makeBtn('✦', 'act-jump',  'jump',  { right: 14, bottom: 11  });


    this._makePauseBtn({ top: 10, right: 10 });
  }





  _makeBtn(label, id, action, pos) {
    const btn = this._createEl(label, id, pos, BTN,  true);
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
  }


  _makePauseBtn(pos) {
    const btn = this._createEl('⏸', 'act-pause', pos, BTN_SM,  false);
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
  }



  _createEl(label, id, pos, size, withSAI = false) {
    const btn = document.createElement('button');
    btn.id        = `tc-${id}`;
    btn.className = 'tc-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', id.replace(/-/g, ' '));


    const posCSS = Object.entries(pos).map(([k, v]) => {
      if (k === 'bottom' && withSAI) {
        return `bottom: calc(${v}px + ${SAI})`;
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




  _updateVisibility() {
    if (!this._layer) return;
    this._layer.style.display = shouldShowTouchControls(this._gameState) ? 'block' : 'none';
  }



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
