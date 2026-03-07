import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { currentLang, setLang, t, LANGS } from '../../core/localization.js';

// Reihenfolge der Menüpunkte
const MENU_IDS = ['start', 'language', 'controls', 'credits'];

// Layout-Konstanten (CANVAS_HEIGHT = 480, CY = 240)
const CX            = CANVAS_WIDTH  / 2;
const CY            = CANVAS_HEIGHT / 2;

const TITLE_LINE_Y  = CY - 132;   // 108
const TITLE_Y       = CY - 100;   // 140
const SUBTITLE_Y    = CY - 65;    // 175
const TITLE_LINE2_Y = CY - 42;    // 198

const MENU_START_Y  = CY - 12;    // 228
const MENU_STEP     = 44;
const FOOTER_Y      = MENU_START_Y + MENU_IDS.length * MENU_STEP + 14;

// Sub-Screen-Panel
const PANEL_W = 480;
const PANEL_H = 300;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;   // 120
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;   // 90

export class StartScreen {
  /** @param {Function} onStart  Callback wenn der Spieler startet */
  constructor(onStart) {
    this._onStart = onStart;
    this._reset();
  }

  _reset() {
    this._started       = false;
    this._selectedIndex = 0;
    this._subScreen     = null;  // null | 'controls' | 'credits'
    // Edge-Detect-Zustand für Navigation
    this._prevUp    = false;
    this._prevDown  = false;
    this._prevLeft  = false;
    this._prevRight = false;
  }

  /** Beim erneuten Betreten des START-States alles zurücksetzen. */
  reset() { this._reset(); }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    // Sub-Screen: jeder Bestätigungs- oder Zurück-Key schließt ihn
    if (this._subScreen !== null) {
      if (input.escPressed || input.enterPressed || input.jumpPressed) {
        this._subScreen = null;
      }
      return;
    }

    // ↑/↓ Navigation (Edge-Detect)
    const upNow   = input.up;
    const downNow = input.down;
    if (upNow && !this._prevUp) {
      this._selectedIndex =
        (this._selectedIndex - 1 + MENU_IDS.length) % MENU_IDS.length;
    }
    if (downNow && !this._prevDown) {
      this._selectedIndex = (this._selectedIndex + 1) % MENU_IDS.length;
    }
    this._prevUp   = upNow;
    this._prevDown = downNow;

    // ←/→ togglet Sprache wenn Language-Eintrag ausgewählt (Edge-Detect)
    const leftNow  = input.left;
    const rightNow = input.right;
    if (MENU_IDS[this._selectedIndex] === 'language') {
      if ((leftNow && !this._prevLeft) || (rightNow && !this._prevRight)) {
        this._toggleLang();
      }
    }
    this._prevLeft  = leftNow;
    this._prevRight = rightNow;

    // Enter / Space → Menüpunkt aktivieren
    if (input.enterPressed || input.jumpPressed) {
      this._activate(MENU_IDS[this._selectedIndex]);
    }
  }

  _toggleLang() {
    const next = LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length];
    setLang(next);
  }

  _activate(id) {
    switch (id) {
      case 'start':
        if (this._started) return;
        this._started = true;
        this._onStart();
        break;
      case 'language':
        this._toggleLang();
        break;
      case 'controls':
        this._subScreen = 'controls';
        break;
      case 'credits':
        this._subScreen = 'credits';
        break;
    }
  }

  // ─── Zeichnen ──────────────────────────────────────────────────────────────

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    this._drawBackground(ctx);
    this._drawTitle(ctx);

    if (this._subScreen !== null) {
      // Titel im Hintergrund abdunkeln, dann Panel obendrauf
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this._drawSubPanel(ctx);
    } else {
      this._drawMenu(ctx);
    }
  }

  _drawBackground(ctx) {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 2;
    ctx.strokeRect(24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48);
  }

  _drawTitle(ctx) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Obere Zierlinie
    ctx.fillStyle = '#2a5a28';
    ctx.fillRect(CX - 220, TITLE_LINE_Y, 440, 2);

    // Haupttitel
    ctx.fillStyle = '#f0c040';
    ctx.font      = 'bold 42px serif';
    ctx.fillText('Solvara', CX, TITLE_Y);

    // Untertitel
    ctx.fillStyle = '#a8d8a8';
    ctx.font      = '20px serif';
    ctx.fillText('Echoes of the Wilds', CX, SUBTITLE_Y);

    // Untere Zierlinie
    ctx.fillStyle = '#2a5a28';
    ctx.fillRect(CX - 220, TITLE_LINE2_Y, 440, 2);
  }

  _drawMenu(ctx) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    MENU_IDS.forEach((id, i) => {
      const y        = MENU_START_Y + i * MENU_STEP;
      const selected = i === this._selectedIndex;

      // Label dynamisch aufbauen
      let label;
      if (id === 'language') {
        const langName = currentLang === 'en' ? 'English' : 'Deutsch';
        label = t('language') + ':  ' + langName;
      } else {
        label = t(id);
      }

      if (selected) {
        // Auswahlbalken
        ctx.fillStyle = 'rgba(42, 90, 40, 0.35)';
        ctx.fillRect(CX - 185, y - 17, 370, 34);
        // Auswahlpfeil
        ctx.fillStyle = '#f0c040';
        ctx.font      = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('▶', CX - 175, y);
      }

      ctx.fillStyle = selected ? '#ffffff' : '#a8d8a8';
      ctx.font      = selected ? 'bold 17px monospace' : '15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, CX + 8, y);
    });

    // Footer-Hinweis
    ctx.font      = '12px monospace';
    ctx.fillStyle = '#4a6a4a';
    ctx.textAlign = 'center';
    ctx.fillText(t('pressEnter'), CX, FOOTER_Y);
  }

  _drawSubPanel(ctx) {
    // Panel-Hintergrund
    ctx.fillStyle = '#0e1a12';
    ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 2;
    ctx.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Panel-Titel ('controls' / 'credits' sind gültige Lokalisierungsschlüssel)
    ctx.fillStyle = '#f0c040';
    ctx.font      = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, PANEL_Y + 32);

    // Trennlinie
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 20, PANEL_Y + 55);
    ctx.lineTo(PANEL_X + PANEL_W - 20, PANEL_Y + 55);
    ctx.stroke();

    if (this._subScreen === 'controls') {
      this._drawControlsContent(ctx);
    } else {
      this._drawCreditsContent(ctx);
    }

    // Footer
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#506050';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, PANEL_Y + PANEL_H - 20);
  }

  _drawControlsContent(ctx) {
    const rows = [
      [t('move'),   'Arrow Keys / WASD'],
      [t('jump'),   'Space / W / ↑'],
      [t('crouch'), 'S / ↓'],
      [t('lookUp'), 'W / ↑'],
      [t('pause'),  'ESC'],
    ];

    const rowY0   = PANEL_Y + 80;
    const rowStep = 33;

    rows.forEach(([label, keys], i) => {
      const y = rowY0 + i * rowStep;
      ctx.fillStyle = '#c8e8c8';
      ctx.font      = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, PANEL_X + 30, y);
      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, PANEL_X + PANEL_W - 30, y);
    });
  }

  _drawCreditsContent(ctx) {
    const lines = [
      { text: t('creditsDev'),    gold: false },
      { text: 'Yannick',          gold: true  },
      { text: '',                 gold: false },
      { text: t('creditsAssets'), gold: false },
      { text: 'Game Asset Pack',  gold: true  },
    ];

    const lineY0   = PANEL_Y + 88;
    const lineStep = 30;

    lines.forEach(({ text, gold }, i) => {
      if (!text) return;
      const y = lineY0 + i * lineStep;
      ctx.fillStyle = gold ? '#f0c040' : '#a8d8a8';
      ctx.font      = gold ? 'bold 14px monospace' : '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, CX, y);
    });
  }
}

