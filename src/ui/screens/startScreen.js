import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { currentLang, setLang, t, LANGS } from '../../core/localization.js';
import { imageCache } from '../../core/imageCache.js';
import { audioManager } from '../../core/audioManager.js';

// Reihenfolge der Menüpunkte
const MENU_IDS = ['start', 'options', 'controls', 'credits'];

// Options-Screen: drei Zeilen
const OPTIONS_IDS = ['musicVolume', 'sfxVolume', 'language'];

// Layout-Konstanten (CANVAS_HEIGHT = 480, CY = 240)
const CX            = CANVAS_WIDTH  / 2;
const CY            = CANVAS_HEIGHT / 2;

// Titel (oberhalb des Holzpanels)
const TITLE_Y       = 66;
const SUBTITLE_Y    = 110;

// Holzpanel für das Hauptmenü
const WOOD_W = 420;
const WOOD_H = 240;
const WOOD_X = (CANVAS_WIDTH  - WOOD_W) / 2;   // 150
const WOOD_Y = 148;                              // Panel oben  → unten = 388

// Fußzeile unter dem Hauptmenü-Panel
const FOOTER_Y = WOOD_Y + WOOD_H + 22;           // 410

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
    this._subScreen     = null;  // null | 'options' | 'controls' | 'credits'
    this._optionIndex   = 0;     // aktuell gewählte Zeile im Options-Screen
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
    // Sub-Screen-Navigation
    if (this._subScreen !== null) {
      if (this._subScreen === 'options') {
        this._handleOptionsInput(input);
      } else {
        // Controls / Credits: beliebiger Bestätigungs-/Zurück-Key schließt
        if (input.escPressed || input.enterPressed || input.jumpPressed) {
          this._subScreen = null;
        }
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

    this._prevLeft  = input.left;
    this._prevRight = input.right;

    // Enter / Space → Menüpunkt aktivieren
    if (input.enterPressed || input.jumpPressed) {
      this._activate(MENU_IDS[this._selectedIndex]);
    }
  }

  /** Navigation innerhalb des Options-Screens. */
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

    const row = OPTIONS_IDS[this._optionIndex];

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
        this._toggleLang();
      }
    }

    if (input.escPressed) {
      this._subScreen = null;
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
      case 'options':
        this._subScreen   = 'options';
        this._optionIndex = 0;
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
    // Panel ist statisch – nur Glühwürmchen bewegen sich
    this._drawWoodPanel(ctx, WOOD_X, WOOD_Y, WOOD_W, WOOD_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Optische Zentrierung: jedes Item mittig in seiner Planken-Zone.
    // Trimmleisten: 11px oben/unten; Plankenlinien bei h/4, h/2, 3h/4.
    const s  = WOOD_Y + 11;                         // 159 – Unterkante oberes Trimm
    const p1 = WOOD_Y + Math.floor(WOOD_H / 4);     // 208
    const p2 = WOOD_Y + Math.floor(WOOD_H / 2);     // 268
    const p3 = WOOD_Y + Math.floor(3 * WOOD_H / 4); // 328
    const b  = WOOD_Y + WOOD_H - 11;                // 377 – Oberkante unteres Trimm
    const ZONE_Y = [
      Math.round((s  + p1) / 2),   // 184 – Zone 1
      Math.round((p1 + p2) / 2),   // 238 – Zone 2
      Math.round((p2 + p3) / 2),   // 298 – Zone 3
      Math.round((p3 + b ) / 2),   // 353 – Zone 4
    ];

    MENU_IDS.forEach((id, i) => {
      const y        = ZONE_Y[i];
      const selected = i === this._selectedIndex;

      // Label: einfach lokalisierter Text
      const label = t(id);

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
    ctx.fillText(t('pressEnter'), CX, FOOTER_Y);
    ctx.restore();
  }

  _drawSubPanel(ctx) {
    // Holzpanel – ohne Plankenlinien, Sub-Screens haben eigene Trennstruktur
    this._drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);

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

    if (this._subScreen === 'options') {
      this._drawOptionsContent(ctx);
    } else if (this._subScreen === 'controls') {
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

  _drawOptionsContent(ctx) {
    // Drei Zeilen: Musik-Lautstärke, SFX-Lautstärke, Sprache
    const rowY0   = PANEL_Y + 78;
    const rowStep = 62;

    OPTIONS_IDS.forEach((id, i) => {
      const y        = rowY0 + i * rowStep;
      const selected = i === this._optionIndex;

      // Auswahlbalken
      if (selected) {
        const hl = ctx.createLinearGradient(PANEL_X, y, PANEL_X + PANEL_W, y);
        hl.addColorStop(0,    'rgba(20, 10, 4, 0.00)');
        hl.addColorStop(0.08, 'rgba(20, 10, 4, 0.50)');
        hl.addColorStop(0.92, 'rgba(20, 10, 4, 0.50)');
        hl.addColorStop(1,    'rgba(20, 10, 4, 0.00)');
        ctx.fillStyle = hl;
        ctx.fillRect(PANEL_X, y - 28, PANEL_W, 56);
      }

      // Zeilenbezeichnung
      ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
      ctx.font      = selected ? 'bold 13px monospace' : '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(t(id), PANEL_X + 28, y - 10);

      if (id === 'musicVolume' || id === 'sfxVolume') {
        const vol   = id === 'musicVolume' ? audioManager.musicVolume : audioManager.sfxVolume;
        const steps = 10;
        const barX  = PANEL_X + 28;
        const barW  = PANEL_W - 56;
        const barY  = y + 8;
        const barH  = 10;

        // Schienen-Hintergrund
        ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
        this._rrect(ctx, barX, barY, barW, barH, 4);
        ctx.fill();

        // Füllbalken
        const fillW = Math.round(barW * vol);
        if (fillW > 4) {
          const fillGrd = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
          fillGrd.addColorStop(0,   '#b06020');
          fillGrd.addColorStop(0.5, '#f0a030');
          fillGrd.addColorStop(1,   '#f0c040');
          this._rrect(ctx, barX, barY, fillW, barH, 4);
          ctx.fillStyle = fillGrd;
          ctx.fill();
        }

        // Tick-Markierungen
        ctx.strokeStyle = 'rgba(255,220,120,0.25)';
        ctx.lineWidth   = 1;
        for (let s = 1; s < steps; s++) {
          const tx = barX + Math.round(barW * s / steps);
          ctx.beginPath();
          ctx.moveTo(tx, barY + 2);
          ctx.lineTo(tx, barY + barH - 2);
          ctx.stroke();
        }

        // Knopf / Handle
        const kx = barX + Math.round(barW * vol);
        ctx.fillStyle = selected ? '#f0c040' : '#c8a060';
        ctx.beginPath();
        ctx.arc(kx, barY + barH / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        if (selected) {
          ctx.strokeStyle = 'rgba(240,192,0,0.5)';
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }

        // Prozentwert – rechtsbündig über dem Slider (gleiche Höhe wie Label)
        ctx.fillStyle = selected ? '#fff4c0' : '#d6c7a2';
        ctx.font      = selected ? 'bold 12px monospace' : '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(vol * 100) + '%', PANEL_X + PANEL_W - 28, y - 10);

        // Pfeil-Hinweis wenn selektiert
        if (selected) {
          ctx.fillStyle = 'rgba(240,192,0,0.55)';
          ctx.font      = '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('◄  ►', CX, y + 8 + barH / 2);
        }

      } else if (id === 'language') {
        // Toggle-Anzeige: Sprache rechts, auf gleicher Höhe wie Label
        const langDisplay = currentLang === 'en' ? 'English' : 'Deutsch';
        ctx.save();
        ctx.shadowColor = selected ? 'rgba(240,192,0,0.5)' : 'transparent';
        ctx.shadowBlur  = selected ? 5 : 0;
        ctx.fillStyle   = selected ? '#f0c040' : '#c8b090';
        ctx.font        = selected ? 'bold 15px monospace' : '14px monospace';
        ctx.textAlign   = 'right';
        ctx.fillText('◄ ' + langDisplay + ' ►', PANEL_X + PANEL_W - 28, y - 10);
        ctx.restore();
      }
    });
  }
  _drawControlsContent(ctx) {
    ctx.textBaseline = 'middle';

    // Mittlerer Trennstrich teilt den Inhalt in zwei gleich große Hälften:
    // Obere Hälfte (y 145–257): Block 1 – Bewegung
    // Untere Hälfte (y 257–370): Block 2 – Sonstiges
    const midY = PANEL_Y + 167;   // = 257

    // ── Block 1: Bewegen / Springen / Ducken ─────────────────────────────────
    // Inhalt (56px bei step=28) mittig in 112px-Zone (145–257): Padding = 28px
    const b1Start = PANEL_Y + 83;   // = 173
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
      ctx.fillText(label, PANEL_X + 30, y);

      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, PANEL_X + PANEL_W - 30, y);
    });

    // Mittlere Trennlinie
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.35)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 30,           midY);
    ctx.lineTo(PANEL_X + PANEL_W - 30, midY);
    ctx.stroke();

    // ── Block 2: Hochschauen / Pause ─────────────────────────────────────────
    // Inhalt (28px bei step=28) mittig in 113px-Zone (257–370): Padding = 42px
    const b2Start = PANEL_Y + 210;   // = 300
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
      ctx.fillText(label, PANEL_X + 30, y);

      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, PANEL_X + PANEL_W - 30, y);
    });
  }

  _drawCreditsContent(ctx) {
    ctx.textBaseline = 'middle';

    // ── Block 1: Top – zentriert ─────────────────────────────────────────────
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Design & Programming', CX, PANEL_Y + 80);

    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.45)';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 14px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('Yannick', CX, PANEL_Y + 106);
    ctx.restore();

    // Kurzer zentrierter Trennstrich
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.40)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 120, PANEL_Y + 135);
    ctx.lineTo(PANEL_X + 360, PANEL_Y + 135);
    ctx.stroke();

    // ── Block 2: Zwei Spalten – Pyramiden-Layout ─────────────────────────────
    // Linke Spalte: Pixel Assets  (CX - 95)
    const leftX  = CX - 95;   // = 265
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pixel Assets', leftX, PANEL_Y + 170);

    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.45)';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 14px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('Anismuz', leftX, PANEL_Y + 196);
    ctx.restore();

    // Rechte Spalte: Music – leicht versetzt nach rechts (CX + 115)
    const rightX = CX + 115;  // = 475
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Music', rightX, PANEL_Y + 170);

    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.45)';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 14px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('Pascal Belisle', rightX, PANEL_Y + 196);
    ctx.restore();
  }

  /** Dekorative Holzplakette hinter dem Titeltext. */
  _drawTitleBanner(ctx) {
    const bw = 380;
    const bh = 104;
    const bx = CX - bw / 2;
    const by = TITLE_Y - 42;
    const r  = 6;

    // Weicher Wärmeschein hinter dem Banner (Ambiente)
    const glow = ctx.createRadialGradient(CX, by + bh / 2, 8, CX, by + bh / 2, 230);
    glow.addColorStop(0,    'rgba(220, 155, 35, 0.20)');
    glow.addColorStop(0.45, 'rgba(180,  95, 10, 0.09)');
    glow.addColorStop(1,    'rgba(0,     0,  0, 0.00)');
    ctx.fillStyle = glow;
    ctx.fillRect(bx - 60, by - 32, bw + 120, bh + 64);

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
   * @param {boolean} [drawPlanks=true]  Horizontale Plankenlinien zeichnen (nur Hauptmenü)
   */
  _drawWoodPanel(ctx, x, y, w, h, drawPlanks = true) {
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

    // Horizontale Plankenlinien (nur wenn gewünscht, z.B. Hauptmenü)
    if (drawPlanks) {
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

