import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { currentLang, setLang, t, LANGS } from '../../core/localization.js';
import { imageCache } from '../../core/imageCache.js';

// Reihenfolge der Menüpunkte
const MENU_IDS = ['start', 'language', 'controls', 'credits'];

// Layout-Konstanten (CANVAS_HEIGHT = 480, CY = 240)
const CX            = CANVAS_WIDTH  / 2;
const CY            = CANVAS_HEIGHT / 2;

// Titel (oberhalb des Holzpanels)
const TITLE_Y       = 72;
const SUBTITLE_Y    = 112;

// Holzpanel für das Hauptmenü
const WOOD_W = 420;
const WOOD_H = 240;
const WOOD_X = (CANVAS_WIDTH  - WOOD_W) / 2;   // 150
const WOOD_Y = 136;                              // Panel oben  → unten = 376

// Menüpunkte im Panel
const MENU_START_Y  = WOOD_Y + 40;              // 176
const MENU_STEP     = 42;
const FOOTER_Y      = WOOD_Y + WOOD_H + 22;     // 398

// Sub-Screen-Panel (Steuerung / Credits)
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
    this._drawVignette(ctx);
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
    // Himmels-Gradient als Fallback / Sky-Base
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0,   '#2e5470');
    sky.addColorStop(0.6, '#5a8fa8');
    sky.addColorStop(1,   '#7aac8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Entfernter Waldlayer (camX=0 → kein Scrolling auf Startscreen)
    const bgBack = imageCache.get('BG_FOREST_BACK');
    if (bgBack) {
      const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
      const drawW = Math.ceil(bgBack.naturalWidth * scale);
      ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
    }

    // Näherer Waldlayer
    const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
    if (bgMiddle) {
      const scale = CANVAS_HEIGHT / bgMiddle.naturalHeight;
      const drawW = Math.ceil(bgMiddle.naturalWidth * scale);
      ctx.drawImage(bgMiddle, 0, 0, drawW, CANVAS_HEIGHT);
    }
  }

  _drawTitle(ctx) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Haupttitel mit Leuchteffekt
    ctx.save();
    ctx.shadowColor   = 'rgba(240, 192, 0, 0.70)';
    ctx.shadowBlur    = 18;
    ctx.fillStyle     = '#f0c040';
    ctx.font          = 'bold 46px serif';
    ctx.fillText('Solvara', CX, TITLE_Y);
    ctx.restore();

    // Untertitel (leichter Schatten für Lesbarkeit auf dem Waldhintergrund)
    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur    = 6;
    ctx.fillStyle     = '#d4f0d4';
    ctx.font          = '19px serif';
    ctx.fillText('Echoes of the Wilds', CX, SUBTITLE_Y);
    ctx.restore();
  }

  _drawMenu(ctx) {
    // Holzpanel zeichnen
    this._drawWoodPanel(ctx, WOOD_X, WOOD_Y, WOOD_W, WOOD_H);

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
        // Auswahlbalken (dunkle Holzfärbung)
        ctx.fillStyle = 'rgba(40, 20, 8, 0.40)';
        ctx.fillRect(WOOD_X + 12, y - 16, WOOD_W - 24, 32);
        // Auswahlpfeil
        ctx.save();
        ctx.shadowColor = 'rgba(240,192,0,0.5)';
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = '#f0c040';
        ctx.font        = 'bold 13px monospace';
        ctx.textAlign   = 'left';
        ctx.fillText('▶', WOOD_X + 20, y);
        ctx.restore();
      }

      ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
      ctx.font      = selected ? 'bold 16px monospace' : '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, CX + 8, y);
    });

    // Footer-Hinweis unterhalb des Panels
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur  = 4;
    ctx.font        = '12px monospace';
    ctx.fillStyle   = '#d6c7a2';
    ctx.textAlign   = 'center';
    ctx.fillText(t('pressEnter'), CX, FOOTER_Y);
    ctx.restore();
  }

  _drawSubPanel(ctx) {
    // Holzpanel
    this._drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Panel-Titel
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, PANEL_Y + 32);
    ctx.restore();

    // Trennlinie
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.6)';
    ctx.lineWidth   = 2;
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
    ctx.fillStyle = '#c8b090';
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
      ctx.fillStyle = '#f6e3c3';
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
      ctx.fillStyle = gold ? '#f0c040' : '#f6e3c3';
      ctx.font      = gold ? 'bold 14px monospace' : '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, CX, y);
    });
  }

  // ─── Hilfs-Zeichner ────────────────────────────────────────────────────────

  /**
   * Zeichnet ein abgerundetes Holzpanel mit Schatten und Maserungsgradienten.
   * @param {CanvasRenderingContext2D} ctx
   */
  _drawWoodPanel(ctx, x, y, w, h) {
    const r = 8;

    // Weicher Schlagschatten
    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur    = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 7;
    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();

    // Basis-Holzfarbe
    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();

    // Heller Mitte-Verlauf (simuliert Holzmaserung / Lichteinfall)
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0,    'rgba(190, 130, 65, 0.30)');
    grad.addColorStop(0.35, 'rgba(210, 150, 75, 0.42)');
    grad.addColorStop(0.65, 'rgba(210, 150, 75, 0.42)');
    grad.addColorStop(1,    'rgba(35,  18,  6,  0.38)');
    this._rrect(ctx, x, y, w, h, r);
    ctx.fillStyle = grad;
    ctx.fill();

    // Dunkler Außenrahmen (Holzkante)
    ctx.strokeStyle = '#3b2615';
    ctx.lineWidth   = 3;
    this._rrect(ctx, x, y, w, h, r);
    ctx.stroke();

    // Innere Highlight-Linie (oberste Lichtkante des Holzes)
    ctx.strokeStyle = 'rgba(230, 185, 115, 0.28)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, x + 4, y + 4, w - 8, h - 8, Math.max(r - 3, 2));
    ctx.stroke();
  }

  /** Hilfsmethode: Zeichnet einen abgerundeten Rechteck-Pfad (kein fill/stroke). */
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

  /** Radiale Vignette über das gesamte Canvas. */
  _drawVignette(ctx) {
    const grd = ctx.createRadialGradient(
      CX, CY * 1.05, CANVAS_HEIGHT * 0.22,
      CX, CY,        CANVAS_HEIGHT * 0.82
    );
    grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

