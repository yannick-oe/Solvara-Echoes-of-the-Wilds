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
    // Glühwürmchen-Partikel
    this._fireflies = Array.from({ length: 12 }, () => ({
      x:     Math.random() * CANVAS_WIDTH,
      y:     40 + Math.random() * (CANVAS_HEIGHT - 80),
      vx:    (Math.random() - 0.5) * 22,
      vy:    -3 - Math.random() * 9,
      size:  0.9 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.55 ? '#c8ff9a' : '#eaffb0',
    }));
    this._lastDrawTime = null;
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
    const now = performance.now() / 1000;
    const dt  = this._lastDrawTime !== null
      ? Math.min(now - this._lastDrawTime, 0.05)
      : 0;
    this._lastDrawTime = now;

    // Glühwürmchen-Positionen aktualisieren
    for (const ff of this._fireflies) {
      ff.x = ((ff.x + ff.vx * dt) % CANVAS_WIDTH  + CANVAS_WIDTH)  % CANVAS_WIDTH;
      ff.y = ((ff.y + ff.vy * dt) % CANVAS_HEIGHT + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    }

    this._drawBackground(ctx);
    this._drawFireflies(ctx, now);
    this._drawVignette(ctx);
    this._drawTitle(ctx, now);

    if (this._subScreen !== null) {
      // Titel im Hintergrund abdunkeln, dann Panel obendrauf
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this._drawSubPanel(ctx);
    } else {
      this._drawMenu(ctx, now);
    }
  }

  _drawBackground(ctx) {
    // Himmels-Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0,   '#1e3a52');
    sky.addColorStop(0.5, '#4a7a94');
    sky.addColorStop(1,   '#6a9c7c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Entfernter Waldlayer
    const bgBack = imageCache.get('BG_FOREST_BACK');
    if (bgBack) {
      const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
      const drawW = Math.round(bgBack.naturalWidth * scale);
      ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
    }

    // Näherer Waldlayer – unterer Bereich (Baumkronen-/Büschellinie)
    const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
    if (bgMiddle) {
      const drawH = Math.round(CANVAS_HEIGHT * 0.58);
      const scale = drawH / bgMiddle.naturalHeight;
      const drawW = Math.round(bgMiddle.naturalWidth * scale);
      const drawY = CANVAS_HEIGHT - drawH;
      for (let x = 0; x < CANVAS_WIDTH; x += drawW) {
        ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
      }
    }
  }

  _drawTitle(ctx, now) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Holzplakette hinter dem Titel
    this._drawTitleBanner(ctx);

    // Haupttitel mit pulsierendem Leuchteffekt
    const blur = 12 + Math.sin(now * 2.0) * 4;
    ctx.save();
    ctx.shadowColor   = 'rgba(240, 192, 0, 0.85)';
    ctx.shadowBlur    = blur;
    ctx.fillStyle     = '#f0c040';
    ctx.font          = 'bold 46px serif';
    ctx.fillText('Solvara', CX, TITLE_Y);
    ctx.restore();

    // Untertitel
    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur    = 4;
    ctx.fillStyle     = '#a8d8a8';
    ctx.font          = '19px serif';
    ctx.fillText('Echoes of the Wilds', CX, SUBTITLE_Y);
    ctx.restore();
  }

  _drawMenu(ctx, now) {
    // Schwebendes Panel: sehr sanfte Auf-/Abbewegung (±2px)
    const floatY     = Math.round(Math.sin(now * 0.6) * 2);
    const woodY      = WOOD_Y + floatY;
    const menuStartY = woodY + 40;
    const footerY    = woodY + WOOD_H + 22;

    this._drawWoodPanel(ctx, WOOD_X, woodY, WOOD_W, WOOD_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    MENU_IDS.forEach((id, i) => {
      const y        = menuStartY + i * MENU_STEP;
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
        // Auswahlbalken – horizontaler Gradient für gebogene Holzleisten-Optik
        const hl = ctx.createLinearGradient(WOOD_X, y, WOOD_X + WOOD_W, y);
        hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
        hl.addColorStop(0.12, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(0.88, 'rgba(20, 10, 4, 0.55)');
        hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
        ctx.fillStyle = hl;
        ctx.fillRect(WOOD_X, y - 16, WOOD_W, 32);
        // Auswahlpfeil
        ctx.save();
        ctx.shadowColor = 'rgba(240,192,0,0.6)';
        ctx.shadowBlur  = 8;
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
    ctx.fillText(t('pressEnter'), CX, footerY);
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

  /** Dekorative Holzplakette hinter dem Titeltext. */
  _drawTitleBanner(ctx) {
    const bw = 380;
    const bh = 82;
    const bx = CX - bw / 2;
    const by = TITLE_Y - 34;
    const r  = 6;

    // Schatten
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur    = 18;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#4a2f1a';
    this._rrect(ctx, bx, by, bw, bh, r);
    ctx.fill();
    ctx.restore();

    // Basis-Holz (dunkel)
    ctx.fillStyle = '#4a2f1a';
    this._rrect(ctx, bx, by, bw, bh, r);
    ctx.fill();

    // Gradient: leicht helleres Zentrum
    const g = ctx.createLinearGradient(bx, by, bx, by + bh);
    g.addColorStop(0,    'rgba(22, 10, 3, 0.50)');
    g.addColorStop(0.30, 'rgba(100, 60, 22, 0.38)');
    g.addColorStop(0.70, 'rgba(100, 60, 22, 0.38)');
    g.addColorStop(1,    'rgba(18, 7, 2, 0.58)');
    this._rrect(ctx, bx, by, bw, bh, r);
    ctx.fillStyle = g;
    ctx.fill();

    // Äußerer Rahmen
    ctx.strokeStyle = '#3b2615';
    ctx.lineWidth   = 3;
    this._rrect(ctx, bx, by, bw, bh, r);
    ctx.stroke();

    // Innere Lichtkante
    ctx.strokeStyle = 'rgba(195, 148, 78, 0.28)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, bx + 4, by + 4, bw - 8, bh - 8, Math.max(r - 2, 2));
    ctx.stroke();

    // Eckverzierungen
    const corners = [
      [bx + 7,      by + 7     ],
      [bx + bw - 7, by + 7     ],
      [bx + 7,      by + bh - 7],
      [bx + bw - 7, by + bh - 7],
    ];
    ctx.fillStyle   = '#3b2615';
    ctx.strokeStyle = 'rgba(195, 148, 78, 0.38)';
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

  // ─── Hilfs-Zeichner ────────────────────────────────────────────────────────

  /**
   * Zeichnet ein abgerundetes Holzpanel mit Schatten und Maserungsgradienten.
   * @param {CanvasRenderingContext2D} ctx
   */
  _drawWoodPanel(ctx, x, y, w, h) {
    const r = 8;

    // Schlagschatten (flacher Offset vermeidet Perspektiv-Effekt)
    ctx.save();
    ctx.shadowColor   = 'rgba(0, 0, 0, 0.70)';
    ctx.shadowBlur    = 14;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();

    // Basis-Holz
    ctx.fillStyle = '#7a5433';
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();

    // Holzmaserung – helles Zentrum, dunkle Ober-/Unterkante
    const grain = ctx.createLinearGradient(x, y, x, y + h);
    grain.addColorStop(0,    'rgba(40,  20,  5,  0.60)');
    grain.addColorStop(0.10, 'rgba(195, 138, 68, 0.40)');
    grain.addColorStop(0.50, 'rgba(215, 158, 82, 0.46)');
    grain.addColorStop(0.90, 'rgba(125, 76,  30, 0.34)');
    grain.addColorStop(1,    'rgba(25,  12,  3,  0.68)');
    this._rrect(ctx, x, y, w, h, r);
    ctx.fillStyle = grain;
    ctx.fill();

    // Dunkles Trimband oben
    ctx.fillStyle = 'rgba(28, 14, 4, 0.52)';
    ctx.fillRect(x + r, y, w - r * 2, 11);

    // Dunkles Trimband unten
    ctx.fillStyle = 'rgba(28, 14, 4, 0.58)';
    ctx.fillRect(x + r, y + h - 11, w - r * 2, 11);

    // Horizontale Plankenlinien
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.20)';
    ctx.lineWidth   = 1;
    const planks = 3;
    for (let i = 1; i <= planks; i++) {
      const py = Math.floor(y + (h / (planks + 1)) * i);
      ctx.beginPath();
      ctx.moveTo(x + 8,     py);
      ctx.lineTo(x + w - 8, py);
      ctx.stroke();
    }

    // Äußerer Rahmen
    ctx.strokeStyle = '#3b2615';
    ctx.lineWidth   = 4;
    this._rrect(ctx, x, y, w, h, r);
    ctx.stroke();

    // Innere Highlight-Linie
    ctx.strokeStyle = 'rgba(220, 175, 100, 0.22)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(r - 3, 2));
    ctx.stroke();

    // Eckverzierungen (kleine Rauten)
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

  /** Glühwürmchen hinter dem Panel, über dem Hintergrund. */
  _drawFireflies(ctx, now) {
    for (const ff of this._fireflies) {
      const alpha = 0.22 + Math.abs(Math.sin(now * 1.5 + ff.phase)) * 0.48;
      const glow  = 4   + Math.sin(now * 2.3 + ff.phase) * 2.5;
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, alpha);
      ctx.shadowColor = ff.color;
      ctx.shadowBlur  = glow * 3;
      ctx.fillStyle   = ff.color;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
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

