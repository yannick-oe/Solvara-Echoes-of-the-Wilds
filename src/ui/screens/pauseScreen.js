import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { currentLang, setLang, t, LANGS } from '../../core/localization.js';
import { audioManager } from '../../core/audioManager.js';

// ─── Hauptpanel-Geometrie (Pause-Menü) ────────────────────────────────────────
const PANEL_W = 420;
const PANEL_H = 370;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;   // 150
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;   //  55
const CX      = CANVAS_WIDTH  / 2;               // 360

// ─── Subpanel-Geometrie (Options / Steuerung) ─────────────────────────────────
const SUB_W = 480;
const SUB_H = 300;
const SUB_X = (CANVAS_WIDTH  - SUB_W) / 2;       // 120
const SUB_Y = (CANVAS_HEIGHT - SUB_H) / 2;       //  90

// ─── Hauptmenü-Layout ─────────────────────────────────────────────────────────
const PAUSE_ITEMS = ['continue', 'restartLevel', 'options', 'controls', 'mainMenu'];
const ITEM_ZONE_H = 60;
const TITLE_Y     = PANEL_Y + 35;   //  90
const TITLE_SEP_Y = PANEL_Y + 58;   // 113

// Jede der 5 Zeilen sitzt mittig in ihrer 60px-Zone unterhalb des Titeltrennstrichs.
// Zonen-Mittelpunkte: 143, 203, 263, 323, 383
const ZONE_Y = PAUSE_ITEMS.map((_, i) =>
  Math.round(TITLE_SEP_Y + ITEM_ZONE_H * i + ITEM_ZONE_H / 2));

// ─── Options-Zeilen ───────────────────────────────────────────────────────────
const OPTIONS_IDS = ['musicVolume', 'sfxVolume', 'language'];

export class PauseScreen {
  /**
   * @param {{ onResume: Function, onRestart: Function, onBackToStart: Function }} callbacks
   */
  constructor(callbacks) {
    this._onResume      = callbacks.onResume;
    this._onRestart     = callbacks.onRestart;
    this._onBackToStart = callbacks.onBackToStart;
    this._reset();
  }

  _reset() {
    this._selectedIndex = 0;
    this._subScreen     = null;   // null | 'options' | 'controls'
    this._optionIndex   = 0;
    this._prevUp    = false;
    this._prevDown  = false;
    this._prevLeft  = false;
    this._prevRight = false;
  }

  /** Zurücksetzen auf ersten Menüpunkt beim Öffnen. */
  reset() { this._reset(); }

  /**
   * Eingabe verarbeiten – muss jeden Frame im PAUSED-State aufgerufen werden.
   * @param {import('../../core/input.js').InputManager} input
   */
  handleInput(input) {
    if (this._subScreen === 'options') {
      this._handleOptionsInput(input);
      return;
    }
    if (this._subScreen === 'controls') {
      if (input.escPressed || input.enterPressed || input.jumpPressed) {
        this._subScreen = null;
      }
      return;
    }

    // Hauptmenü – ESC = Resume
    if (input.escPressed) {
      this._onResume();
      return;
    }

    const upNow   = input.up;
    const downNow = input.down;
    if (upNow && !this._prevUp) {
      this._selectedIndex =
        (this._selectedIndex - 1 + PAUSE_ITEMS.length) % PAUSE_ITEMS.length;
    }
    if (downNow && !this._prevDown) {
      this._selectedIndex = (this._selectedIndex + 1) % PAUSE_ITEMS.length;
    }
    this._prevUp   = upNow;
    this._prevDown = downNow;

    if (input.jumpPressed || input.enterPressed) {
      this._activate(PAUSE_ITEMS[this._selectedIndex]);
    }
  }

  /** Navigationseingabe im Options-Subscreen. */
  _handleOptionsInput(input) {
    const upNow    = input.up;
    const downNow  = input.down;
    const leftNow  = input.left;
    const rightNow = input.right;

    if (upNow && !this._prevUp) {
      this._optionIndex = (this._optionIndex - 1 + OPTIONS_IDS.length) % OPTIONS_IDS.length;
    }
    if (downNow && !this._prevDown) {
      this._optionIndex = (this._optionIndex + 1) % OPTIONS_IDS.length;
    }
    this._prevUp   = upNow;
    this._prevDown = downNow;

    const row       = OPTIONS_IDS[this._optionIndex];
    const leftEdge  = leftNow  && !this._prevLeft;
    const rightEdge = rightNow && !this._prevRight;
    this._prevLeft  = leftNow;
    this._prevRight = rightNow;

    if (row === 'musicVolume') {
      if (leftEdge)  audioManager.setMusicVolume(audioManager.musicVolume - 0.1);
      if (rightEdge) audioManager.setMusicVolume(audioManager.musicVolume + 0.1);
    } else if (row === 'sfxVolume') {
      if (leftEdge)  audioManager.setSfxVolume(audioManager.sfxVolume - 0.1);
      if (rightEdge) audioManager.setSfxVolume(audioManager.sfxVolume + 0.1);
    } else if (row === 'language') {
      if (leftEdge || rightEdge || input.enterPressed || input.jumpPressed) {
        const next = LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length];
        setLang(next);
      }
    }

    if (input.escPressed) {
      this._subScreen = null;
    }
  }

  _activate(item) {
    switch (item) {
      case 'continue':
        this._onResume();
        break;
      case 'restartLevel':
        this._onRestart();
        break;
      case 'options':
        this._subScreen   = 'options';
        this._optionIndex = 0;
        break;
      case 'controls':
        this._subScreen = 'controls';
        break;
      case 'mainMenu':
        this._onBackToStart();
        break;
    }
  }

  // ─── Zeichnen ────────────────────────────────────────────────────────────────

  /**
   * Pause-Overlay über dem eingefrorenen Spielbild zeichnen.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const now = performance.now() / 1000;

    // Abdunkelung
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this._subScreen !== null) {
      this._drawSubPanel(ctx);
    } else {
      this._drawMainMenu(ctx, now);
    }
  }

  /** Hauptmenü des Pause-Screens. */
  _drawMainMenu(ctx, now) {
    this._drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Titel mit starkem Glow
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.90)';
    ctx.shadowBlur  = 14 + Math.sin(now * 1.8) * 4;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 32px serif';
    ctx.fillText('PAUSE', CX, TITLE_Y);
    ctx.restore();

    // Titeltrennstrich
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.65)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 12, TITLE_SEP_Y);
    ctx.lineTo(PANEL_X + PANEL_W - 12, TITLE_SEP_Y);
    ctx.stroke();

    // Trennlinien zwischen den Menüzeilen
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.20)';
    ctx.lineWidth   = 1;
    for (let i = 1; i < PAUSE_ITEMS.length; i++) {
      const sy = TITLE_SEP_Y + ITEM_ZONE_H * i;
      ctx.beginPath();
      ctx.moveTo(PANEL_X + 8,           sy);
      ctx.lineTo(PANEL_X + PANEL_W - 8, sy);
      ctx.stroke();
    }

    // Menüpunkte
    PAUSE_ITEMS.forEach((id, i) => {
      const y        = ZONE_Y[i];
      const selected = i === this._selectedIndex;

      if (selected) {
        const hl = ctx.createLinearGradient(PANEL_X, y, PANEL_X + PANEL_W, y);
        hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
        hl.addColorStop(0.10, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(0.90, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
        ctx.fillStyle = hl;
        ctx.fillRect(PANEL_X, y - 17, PANEL_W, 34);

        ctx.save();
        ctx.shadowColor = 'rgba(240,192,0,0.55)';
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = '#f0c040';
        ctx.font        = 'bold 13px monospace';
        ctx.textAlign   = 'left';
        ctx.fillText('▶', PANEL_X + 18, y);
        ctx.restore();
      }

      ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
      ctx.font      = selected ? 'bold 16px monospace' : '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t(id), CX, y);
    });
  }

  /** Subpanel (Options oder Steuerung). */
  _drawSubPanel(ctx) {
    // Zweite, leichtere Abdunkelungsebene über dem bereits gedimmten Hintergrund
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this._drawWoodPanel(ctx, SUB_X, SUB_Y, SUB_W, SUB_H, false);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Subpanel-Titel
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, SUB_Y + 32);
    ctx.restore();

    if (this._subScreen === 'options') {
      this._drawOptionsContent(ctx);
    } else {
      this._drawControlsContent(ctx);
    }

    // Footer
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, SUB_Y + SUB_H - 20);
  }

  /** Options-Inhalt: Musik/SFX-Slider + Sprache. */
  _drawOptionsContent(ctx) {
    const rowY0   = SUB_Y + 78;
    const rowStep = 62;

    OPTIONS_IDS.forEach((id, i) => {
      const y        = rowY0 + i * rowStep;
      const selected = i === this._optionIndex;

      // Auswahlbalken
      if (selected) {
        const hl = ctx.createLinearGradient(SUB_X, y, SUB_X + SUB_W, y);
        hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
        hl.addColorStop(0.08, 'rgba(20, 10, 4, 0.50)');
        hl.addColorStop(0.92, 'rgba(20, 10, 4, 0.50)');
        hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
        ctx.fillStyle = hl;
        ctx.fillRect(SUB_X, y - 28, SUB_W, 56);
      }

      // Zeilenbezeichnung (links)
      ctx.fillStyle    = selected ? '#fff4c0' : '#f6e3c3';
      ctx.font         = selected ? 'bold 13px monospace' : '12px monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(t(id), SUB_X + 28, y - 10);

      if (id === 'musicVolume' || id === 'sfxVolume') {
        const vol  = id === 'musicVolume' ? audioManager.musicVolume : audioManager.sfxVolume;
        const barX = SUB_X + 28;
        const barW = SUB_W - 56;
        const barY = y + 8;
        const barH = 10;

        // Prozentwert rechts über dem Slider
        ctx.fillStyle = selected ? '#fff4c0' : '#d6c7a2';
        ctx.font      = selected ? 'bold 12px monospace' : '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(vol * 100) + '%', SUB_X + SUB_W - 28, y - 10);

        // Slider-Schiene
        ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
        this._rrect(ctx, barX, barY, barW, barH, 4);
        ctx.fill();

        // Füllbalken
        const fillW = Math.round(barW * vol);
        if (fillW > 4) {
          const grd = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
          grd.addColorStop(0,   '#b06020');
          grd.addColorStop(0.5, '#f0a030');
          grd.addColorStop(1,   '#f0c040');
          this._rrect(ctx, barX, barY, fillW, barH, 4);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Tick-Markierungen
        ctx.strokeStyle = 'rgba(255,220,120,0.25)';
        ctx.lineWidth   = 1;
        for (let s = 1; s < 10; s++) {
          const tx = barX + Math.round(barW * s / 10);
          ctx.beginPath();
          ctx.moveTo(tx, barY + 2);
          ctx.lineTo(tx, barY + barH - 2);
          ctx.stroke();
        }

        // Knopf
        const kx = barX + Math.round(barW * vol);
        ctx.fillStyle = selected ? '#f0c040' : '#c8a060';
        ctx.beginPath();
        ctx.arc(kx, barY + barH / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        if (selected) {
          ctx.strokeStyle = 'rgba(240,192,0,0.5)';
          ctx.lineWidth   = 1.5;
          ctx.stroke();
          // ◄ ► Hinweis
          ctx.fillStyle = 'rgba(240,192,0,0.55)';
          ctx.font      = '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('◄  ►', CX, barY + barH / 2);
        }

      } else if (id === 'language') {
        const langDisplay = currentLang === 'en' ? 'English' : 'Deutsch';
        ctx.save();
        ctx.shadowColor = selected ? 'rgba(240,192,0,0.5)' : 'transparent';
        ctx.shadowBlur  = selected ? 5 : 0;
        ctx.fillStyle   = selected ? '#f0c040' : '#c8b090';
        ctx.font        = selected ? 'bold 15px monospace' : '14px monospace';
        ctx.textAlign   = 'right';
        ctx.fillText('◄ ' + langDisplay + ' ►', SUB_X + SUB_W - 28, y - 10);
        ctx.restore();
      }
    });
  }

  /** Steuerungsinhalt – identisch mit dem Controls-Screen im Startmenü. */
  _drawControlsContent(ctx) {
    ctx.textBaseline = 'middle';

    const midY    = SUB_Y + 167;
    const b1Start = SUB_Y + 83;
    const b1Step  = 28;
    const b1Rows  = [
      [t('move'),   'Arrow Keys / WASD'],
      [t('jump'),   'Space'],
      [t('crouch'), 'S / ↓'],
    ];

    b1Rows.forEach(([label, keys], i) => {
      const y = b1Start + i * b1Step;
      ctx.fillStyle = '#f6e3c3';
      ctx.font      = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, SUB_X + 30, y);
      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, SUB_X + SUB_W - 30, y);
    });

    // Mittlere Trennlinie
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.35)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(SUB_X + 30,           midY);
    ctx.lineTo(SUB_X + SUB_W - 30,   midY);
    ctx.stroke();

    const b2Start = SUB_Y + 210;
    const b2Step  = 28;
    const b2Rows  = [
      [t('lookUp'), 'W / ↑'],
      [t('pause'),  'ESC'],
    ];

    b2Rows.forEach(([label, keys], i) => {
      const y = b2Start + i * b2Step;
      ctx.fillStyle = '#f6e3c3';
      ctx.font      = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, SUB_X + 30, y);
      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, SUB_X + SUB_W - 30, y);
    });
  }

  // ─── Zeichen-Helfer (Holzpanel) ─────────────────────────────────────────────

  /**
   * Abgerundetes Holzpanel mit Schatten und Maserungsgradient.
   * @param {boolean} [drawPlanks=true]  Interne Plankenlinien zeichnen.
   */
  _drawWoodPanel(ctx, x, y, w, h, drawPlanks = true) {
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

    if (drawPlanks) {
      ctx.strokeStyle = 'rgba(25, 12, 4, 0.18)';
      ctx.lineWidth   = 1;
      for (let i = 1; i <= 3; i++) {
        const py = Math.floor(y + (h / 4) * i);
        ctx.beginPath();
        ctx.moveTo(x + 8,     py);
        ctx.lineTo(x + w - 8, py);
        ctx.stroke();
      }
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
