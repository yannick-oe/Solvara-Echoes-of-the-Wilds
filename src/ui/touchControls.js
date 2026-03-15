/**
 * touchControls.js
 *
 * Mobiles Steuerungs-Overlay mit Pointer-Events für Multi-Touch.
 * Erstellt DOM-Buttons außerhalb des Canvas; verbindet sie mit dem InputManager.
 *
 * Layout (Landscape):
 *   Links (D-Pad):         Rechts (Aktionen):         Oben rechts:
 *        [▲]                    [↷ Roll]
 *   [◄] [▼] [►]                  [✦ Jump]                  [⏸]
 */

import { GAME_STATES } from '../core/constants.js';

// ─── Größen-Konstanten ────────────────────────────────────────────────────────
const BTN    = 56;  // Standard-Button-Größe (px)
const BTN_SM = 40;  // Pause-Button-Größe (px)

// iOS safe-area-Ausdruck für Buttons die nahe am unteren Bildschirmrand sitzen
const SAI = 'env(safe-area-inset-bottom, 0px)';

// ─── Hilfsfunktionen (exportiert für externe Nutzung) ─────────────────────────

/** Gibt true zurück, wenn das Gerät Touch-Eingaben unterstützt. */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Gibt true zurück, wenn das Gerät als mobiles Layout gilt.
 * Kriterium: Touch-Gerät, dessen längste Displayseite ≤ 900 px beträgt.
 */
export function isMobileLayout() {
  return isTouchDevice() &&
         Math.max(window.screen.width, window.screen.height) <= 900;
}

/** Gibt true zurück, wenn ein mobiles Gerät gerade im Hochformat ist. */
export function isPortraitMobile() {
  return isMobileLayout() && window.innerWidth < window.innerHeight;
}

/**
 * Gibt true zurück, wenn die Touch-Steuerung im angegebenen Spielzustand
 * angezeigt werden soll (mobil + Landscape + PLAYING oder PAUSED).
 * @param {string|null} state
 */
export function shouldShowTouchControls(state) {
  return isMobileLayout() &&
         !isPortraitMobile() &&
         (state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED);
}

// ─── Klasse ───────────────────────────────────────────────────────────────────
export class TouchControls {
  /**
   * @param {HTMLElement}                              container     Spielcontainer (Referenz, ungenutzt für Layout)
   * @param {import('../core/input.js').InputManager}  inputManager
   * @param {() => string}                             getState      Callback → aktueller GAME_STATES-Wert
   */
  constructor(container, inputManager, getState) {
    this._container    = container;
    this._inputManager = inputManager;
    this._getState     = getState;

    this._layer        = null;   // Wrapper-Element (position: fixed, inset: 0)
    this._buttons      = [];     // alle erzeugten Button-Elemente
    this._gameState    = null;

    this._onDocTap     = null;
    this._onResize     = null;
  }

  // ─── Öffentliche API ────────────────────────────────────────────────────────

  /**
   * DOM aufbauen und Event-Listener registrieren.
   * Wird nur ausgeführt wenn isMobileLayout() === true.
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
   * Spielzustand übergeben; aktualisiert die Sichtbarkeit der Controls.
   * Wird einmal pro Frame aus dem GameManager aufgerufen.
   * @param {string} state  GAME_STATES-Wert
   */
  setGameState(state) {
    if (state === this._gameState) return;
    const wasVisible = shouldShowTouchControls(this._gameState);
    this._gameState  = state;
    const isVisible  = shouldShowTouchControls(state);

    // Sticky-Inputs vermeiden: alle gehaltenen Flags freigeben beim Ausblenden
    if (wasVisible && !isVisible) this._clearAllInputFlags();

    this._updateVisibility();
  }

  /** Räumt alle DOM-Elemente und Event-Listener auf. */
  destroy() {
    this._clearAllInputFlags();
    this._layer?.remove();
    this._layer   = null;
    this._buttons = [];
    if (this._onDocTap) document.removeEventListener('touchstart', this._onDocTap);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }

  // ─── Aufbau ─────────────────────────────────────────────────────────────────

  /**
   * Fügt eine <style>-Regel für den gedrückten Button-Zustand in den <head> ein.
   * Wird nur einmal eingefügt (Guard via ID).
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

  /** Erstellt das transparente Wrapper-Layer-Element. */
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

  /**
   * Erstellt alle Steuerungs-Buttons.
   *
   * D-Pad (links):
   *       [▲]          left:74  bottom:139
   *  [◄]  [▼]  [►]    left:10/74/138  bottom:75/11/75
   *
   * Aktionen (rechts):
   *  [↷ Roll]  [✦ Jump]  (beide bottom:11, right:80 und right:14)
   *
   * Pause (oben rechts): top:10, right:10
   */
  _buildButtons() {
    // ── D-Pad ──────────────────────────────────────────────────────────────────
    this._makeBtn('◄', 'dir-left',  'left',  { left: 10,  bottom: 75  });
    this._makeBtn('▲', 'dir-up',    'up',    { left: 74,  bottom: 139 });
    this._makeBtn('▼', 'dir-down',  'down',  { left: 74,  bottom: 11  });
    this._makeBtn('►', 'dir-right', 'right', { left: 138, bottom: 75  });

    // ── Aktionstasten ─────────────────────────────────────────────────────────
    this._makeBtn('↷', 'act-roll',  'roll',  { right: 80, bottom: 11  });
    this._makeBtn('✦', 'act-jump',  'jump',  { right: 14, bottom: 11  });

    // ── Pause ─────────────────────────────────────────────────────────────────
    this._makePauseBtn({ top: 10, right: 10 });
  }

  // ─── Button-Fabrik ──────────────────────────────────────────────────────────

  /**
   * Erstellt einen Button, verbindet ihn mit einer InputManager-Aktion und
   * hängt ihn an das Layer.
   *
   * @param {string} label   Angezeigtes Symbol
   * @param {string} id      Eindeutige CSS-ID (ohne Präfix)
   * @param {string} action  InputManager-Flag-Name ('left','right','up','down','jump','roll')
   * @param {object} pos     Positionsobjekt {top?, right?, bottom?, left?} – Werte in px
   */
  _makeBtn(label, id, action, pos) {
    const btn = this._createEl(label, id, pos, BTN, /* withSAI */ true);
    const im  = this._inputManager;

    const onDown = e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');

      if (action === 'jump') {
        if (!im.jump) im.jumpPressed = true;
        im.jump = true;
      } else if (action === 'roll') {
        im.rollPressed = true;                // einmaliges Frame-Flag
      } else {
        im[action] = true;                    // left | right | up | down
        // Mobile Up: mobileUpActive setzen für kontextsensitiven LookUp in player.js
        if (action === 'up') im.mobileUpActive = true;
      }
    };

    const onUp = () => {
      btn.classList.remove('tc-active');
      if (action === 'jump') {
        im.jump = false;
      } else if (action !== 'roll') {
        im[action] = false;                   // sustained flags zurücksetzen
        if (action === 'up') im.mobileUpActive = false;
      }
      // rollPressed ist ein Frame-Flag → kein explizites Reset nötig
    };

    btn.addEventListener('pointerdown',        onDown);
    btn.addEventListener('pointerup',          onUp);
    btn.addEventListener('pointercancel',      onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu',        e => e.preventDefault());

    this._layer.appendChild(btn);
    this._buttons.push(btn);
  }

  /** Pause-Button mit eigenem Handling für das pausePressed-Frame-Flag. */
  _makePauseBtn(pos) {
    const btn = this._createEl('⏸', 'act-pause', pos, BTN_SM, /* withSAI */ false);
    const im  = this._inputManager;

    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('tc-active');
      im.pausePressed = true;               // Frame-Flag
    });

    const onUp = () => btn.classList.remove('tc-active');
    btn.addEventListener('pointerup',          onUp);
    btn.addEventListener('pointercancel',      onUp);
    btn.addEventListener('lostpointercapture', onUp);
    btn.addEventListener('contextmenu',        e => e.preventDefault());

    this._layer.appendChild(btn);
    this._buttons.push(btn);
  }

  /**
   * Erstellt ein Button-DOM-Element mit Inline-Styling.
   *
   * @param {string}  label    Buttonbeschriftung
   * @param {string}  id       ID-Suffix (wird zu „tc-<id>")
   * @param {object}  pos      Positionswerte (px)
   * @param {number}  size     Breite/Höhe in px
   * @param {boolean} withSAI  true → bottom-Wert wird mit safe-area-inset kombiniert
   */
  _createEl(label, id, pos, size, withSAI = false) {
    const btn = document.createElement('button');
    btn.id        = `tc-${id}`;
    btn.className = 'tc-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', id.replace(/-/g, ' '));

    // Positionierungs-CSS zusammensetzen
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

  // ─── Sichtbarkeit  ──────────────────────────────────────────────────────────

  /** Zeigt oder versteckt das Layer je nach aktuellem Spielzustand + Orientierung. */
  _updateVisibility() {
    if (!this._layer) return;
    this._layer.style.display = shouldShowTouchControls(this._gameState) ? 'block' : 'none';
  }

  /**
   * Setzt alle durch Touch gehaltenen Input-Flags zurück.
   * Verhindert „sticky" Eingaben wenn die Touch-Controls ausgeblendet werden.
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

  // ─── Tap-to-Confirm ─────────────────────────────────────────────────────────

  /**
   * Registriert einen globalen touchstart-Listener, der in Nicht-Gameplay-States
   * (START, GAMEOVER, VICTORY) einen Tap auf enterPressed abbildet.
   *
   * Das erlaubt dem Nutzer:
   *   - Startmenü: Tippen → Spiel starten (Standard-Auswahl = „Spiel starten")
   *   - Game-Over-Screen: Tippen → Neustart
   *   - Victory-Screen: Tippen → Weiter
   */
  _attachDocTap() {
    this._onDocTap = e => {
      const state = this._getState();
      // In Gameplay-States und Loading handhaben die eigenen Buttons die Eingabe
      if (state === GAME_STATES.PLAYING  ||
          state === GAME_STATES.PAUSED   ||
          state === GAME_STATES.LOADING) return;
      // Taps auf tc-Buttons selbst ignorieren
      if (e.target.classList.contains('tc-btn')) return;
      this._inputManager.enterPressed = true;
    };
    document.addEventListener('touchstart', this._onDocTap, { passive: true });
  }
}

