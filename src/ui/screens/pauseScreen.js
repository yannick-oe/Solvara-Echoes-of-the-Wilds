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
    // Abdunkelung
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Panel-Hintergrund
    ctx.fillStyle = '#0e1a12';
    ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 2;
    ctx.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    // Titel
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#f0c040';
    ctx.font         = 'bold 30px serif';
    ctx.fillText('PAUSE', CANVAS_WIDTH / 2, TITLE_Y);

    // Trennlinie
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 1;
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
        // Auswahlbalken
        ctx.fillStyle = 'rgba(42, 90, 40, 0.45)';
        ctx.fillRect(PANEL_X + 10, y - 17, PANEL_W - 20, 34);
        // Auswahlpfeil links
        ctx.fillStyle = '#f0c040';
        ctx.font      = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('▶', PANEL_X + 18, y);
      }

      ctx.fillStyle = selected ? '#ffffff' : '#c8e8c8';
      ctx.font      = selected ? 'bold 16px monospace' : '15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, CANVAS_WIDTH / 2 + 8, y);
    });

    // Footer-Hinweis
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#506050';
    ctx.textAlign = 'center';
    ctx.fillText('W/S oder ↑/↓ navigieren  •  Space = Auswählen  •  ESC = Weiter', CANVAS_WIDTH / 2, FOOTER_Y);
  }
}
