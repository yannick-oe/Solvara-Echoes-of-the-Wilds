import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { audioManager } from '../../core/audioManager.js';

const PANEL_W = 420;
const PANEL_H = 370;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;

const TITLE_Y      = PANEL_Y + 40;
const DIVIDER_Y    = PANEL_Y + 66;
const MENU_START_Y = PANEL_Y + 100;
const MENU_STEP    = 46;
const FOOTER_Y     = PANEL_Y + PANEL_H - 22;

// Reihenfolge der Menüpunkte
const ITEMS = ['resume', 'restart', 'backToStart', 'music', 'sfx'];

// Statische Labels, oder Funktion für dynamische Werte (Audio-Toggles)
const LABELS = {
  resume:      'Weiter spielen',
  restart:     'Level neu starten',
  backToStart: 'Zum Startbildschirm',
  music:       () => `Musik:  ${audioManager.musicEnabled ? 'AN' : 'AUS'}`,
  sfx:         () => `SFX:    ${audioManager.sfxEnabled   ? 'AN' : 'AUS'}`,
};

export class PauseScreen {
  /**
   * @param {{ onResume: Function, onRestart: Function, onBackToStart: Function }} callbacks
   */
  constructor(callbacks) {
    this._onResume      = callbacks.onResume;
    this._onRestart     = callbacks.onRestart;
    this._onBackToStart = callbacks.onBackToStart;

    this._selectedIndex = 0;

    // Edge-Detect-Zustand für ↑/↓-Navigation (verhindert Scrollen beim Gedrückthalten)
    this._prevUp   = false;
    this._prevDown = false;
  }

  /** Zurücksetzen auf ersten Menüpunkt beim Öffnen des Menüs. */
  reset() {
    this._selectedIndex = 0;
    this._prevUp        = false;
    this._prevDown      = false;
  }

  /**
   * Eingabe verarbeiten – muss jeden Frame aufgerufen werden solange PAUSED aktiv ist.
   * @param {import('../../core/input.js').InputManager} input
   */
  handleInput(input) {
    // ESC → sofort Resume ohne Menü-Auswahl
    if (input.escPressed) {
      this._onResume();
      return;
    }

    // ↑/W – Edge-Detect: nur beim ersten Frame nach dem Drücken reagieren
    const upNow   = input.up;
    const downNow = input.down;

    if (upNow && !this._prevUp) {
      this._selectedIndex =
        (this._selectedIndex - 1 + ITEMS.length) % ITEMS.length;
    }
    if (downNow && !this._prevDown) {
      this._selectedIndex = (this._selectedIndex + 1) % ITEMS.length;
    }

    this._prevUp   = upNow;
    this._prevDown = downNow;

    // Space oder Enter (beide One-Shot) → aktiven Menüpunkt ausführen
    if (input.jumpPressed || input.enterPressed) {
      this._activate(ITEMS[this._selectedIndex]);
    }
  }

  _activate(item) {
    switch (item) {
      case 'resume':
        this._onResume();
        break;
      case 'restart':
        this._onRestart();
        break;
      case 'backToStart':
        this._onBackToStart();
        break;
      case 'music':
        audioManager.setMusicEnabled(!audioManager.musicEnabled);
        break;
      case 'sfx':
        audioManager.sfxEnabled = !audioManager.sfxEnabled;
        break;
    }
  }

  /**
   * Pause-Panel über das eingefrorene Spielbild zeichnen.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const now = performance.now() / 1000;

    // Abdunkelung
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Holzpanel
    this._drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Titel mit pulsierendem Glow
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.65)';
    ctx.shadowBlur  = 12 + Math.sin(now * 1.8) * 3;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 30px serif';
    ctx.fillText('PAUSE', CANVAS_WIDTH / 2, TITLE_Y);
    ctx.restore();

    // Trennlinie
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.60)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 20, DIVIDER_Y);
    ctx.lineTo(PANEL_X + PANEL_W - 20, DIVIDER_Y);
    ctx.stroke();

    // Menüpunkte
    ITEMS.forEach((item, i) => {
      const y        = MENU_START_Y + i * MENU_STEP;
      const selected = i === this._selectedIndex;
      const rawLabel = LABELS[item];
      const label    = typeof rawLabel === 'function' ? rawLabel() : rawLabel;

      if (selected) {
        // Gradient-Auswahlbalken (Holzoptik)
        const hl = ctx.createLinearGradient(PANEL_X, y, PANEL_X + PANEL_W, y);
        hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
        hl.addColorStop(0.10, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(0.90, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
        ctx.fillStyle = hl;
        ctx.fillRect(PANEL_X, y - 17, PANEL_W, 34);

        // Auswahlpfeil
        ctx.save();
        ctx.shadowColor = 'rgba(240,192,0,0.55)';
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = '#f0c040';
        ctx.font        = 'bold 14px monospace';
        ctx.textAlign   = 'left';
        ctx.fillText('▶', PANEL_X + 18, y);
        ctx.restore();
      }

      ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
      ctx.font      = selected ? 'bold 16px monospace' : '15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, CANVAS_WIDTH / 2 + 8, y);
    });

    // Footer-Hinweis
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText('W/S oder ↑/↓  •  Space/Enter = Auswählen  •  ESC = Weiter', CANVAS_WIDTH / 2, FOOTER_Y);
  }

  // ─── Zeichen-Helfer (Holzpanel) ─────────────────────────────────────────────

  _drawWoodPanel(ctx, x, y, w, h) {
    const r = 8;

    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.70)';
    ctx.shadowBlur    = 14;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();

    const grain = ctx.createLinearGradient(x, y, x, y + h);
    grain.addColorStop(0,    'rgba(40,  20,  5,  0.60)');
    grain.addColorStop(0.10, 'rgba(195, 138, 68, 0.40)');
    grain.addColorStop(0.50, 'rgba(215, 158, 82, 0.46)');
    grain.addColorStop(0.90, 'rgba(125, 76,  30, 0.34)');
    grain.addColorStop(1,    'rgba(25,  12,  3,  0.68)');
    this._rrect(ctx, x, y, w, h, r);
    ctx.fillStyle = grain;
    ctx.fill();

    ctx.fillStyle = 'rgba(28, 14, 4, 0.52)';
    ctx.fillRect(x + r, y, w - r * 2, 10);
    ctx.fillStyle = 'rgba(28, 14, 4, 0.58)';
    ctx.fillRect(x + r, y + h - 10, w - r * 2, 10);

    ctx.strokeStyle = 'rgba(25, 12, 4, 0.18)';
    ctx.lineWidth   = 1;
    for (let i = 1; i <= 3; i++) {
      const py = Math.floor(y + (h / 4) * i);
      ctx.beginPath();
      ctx.moveTo(x + 8,     py);
      ctx.lineTo(x + w - 8, py);
      ctx.stroke();
    }

    ctx.strokeStyle = '#3b2615';
    ctx.lineWidth   = 4;
    this._rrect(ctx, x, y, w, h, r);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(220, 175, 100, 0.22)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(r - 3, 2));
    ctx.stroke();

    const corners = [
      [x + 7,     y + 7    ],
      [x + w - 7, y + 7    ],
      [x + 7,     y + h - 7],
      [x + w - 7, y + h - 7],
    ];
    ctx.fillStyle   = '#4a2f1a';
    ctx.strokeStyle = 'rgba(220, 175, 100, 0.40)';
    ctx.lineWidth   = 1;
    for (const [ox, oy] of corners) {
      ctx.beginPath();
      ctx.moveTo(ox,     oy - 4);
      ctx.lineTo(ox + 4, oy);
      ctx.lineTo(ox,     oy + 4);
      ctx.lineTo(ox - 4, oy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  _rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
  }
}
