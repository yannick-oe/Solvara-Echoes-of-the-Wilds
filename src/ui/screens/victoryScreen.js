import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { imageCache } from '../../core/imageCache.js';

// ─── Layout (Pixel-Koordinaten, Canvas = 720×480) ─────────────────────────────
const CX      = CANVAS_WIDTH  / 2;   // 360
const CY      = CANVAS_HEIGHT / 2;   // 240
const STAR_CY = 176;   // Y-Mitte der Sternreihe
const PANEL_W = 280;   // Holzpanel-Breite
const PANEL_H = 124;   // Holzpanel-Höhe
const PANEL_X = CX - PANEL_W / 2;   // 220
const PANEL_Y = 236;   // Holzpanel-Oberkante

// Stats-Zeilen: BLOCK_Y = Y-Mitte der ersten Zeile; symmetrisch zu Trennlinien
const BLOCK_Y = 262;
const ROW_H   = 24;
const DIV_Y1  = BLOCK_Y - 12;               // 250 – obere Trennlinie
const DIV_Y2  = BLOCK_Y + 3 * ROW_H + 12;   // 346 – untere Trennlinie

// Hinweis-Positionen
const HINT1_Y = 392;   // primärer Hinweis
const ATMO_Y  = 428;   // atmosphärische Zeile

// ─── Schriften ────────────────────────────────────────────────────────────────
const FONT_TITLE = 'bold 52px serif';
const FONT_LABEL = 'bold 12px monospace';
const FONT_VALUE = 'bold 13px monospace';
const FONT_STAR  = '58px sans-serif';
const FONT_HINT  = '13px monospace';
const FONT_HINT2 = '11px monospace';

// ─── Animations-Zeitstempel (Sekunden ab show()) ───────────────────────────────
const T_TITLE_DUR = 0.55;
const T_STAR_0    = 0.70;
const T_STAR_GAP  = 0.22;
const T_STAR_DUR  = 0.30;
const T_STATS_IN  = T_STAR_0 + 3 * T_STAR_GAP + T_STAR_DUR + 0.20;
const T_STATS_DUR = 0.35;
const T_HINTS_IN  = T_STATS_IN + T_STATS_DUR + 0.10;

// ─── Partikel ─────────────────────────────────────────────────────────────────
const ATMO_POOL = 55;
const ATMO_RATE = 0.14;   // Spawn-Intervall (s)
const SPARK_MAX = 12;     // Funken pro Stern-Pop

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOutBack(x) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeOutQuad(x) { return 1 - (1 - x) * (1 - x); }

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function initAtmoParticle(p) {
  // Goldene Glühwürmchen – verteilt über den gesamten Bildschirm
  p.active  = true;
  p.x       = Math.random() * CANVAS_WIDTH;
  p.y       = CANVAS_HEIGHT * 0.35 + Math.random() * (CANVAS_HEIGHT * 0.72);
  p.vx      = (Math.random() - 0.5) * 14;
  p.vy      = -(10 + Math.random() * 22);
  p.life    = 3.8 + Math.random() * 3.0;
  p.maxLife = p.life;
  p.r       = 1.0 + Math.random() * 1.8;
  p.baseA   = 0.18 + Math.random() * 0.38;
  const c   = Math.random();
  p.color   = c < 0.50 ? '#ffd700' : c < 0.80 ? '#ffe88f' : '#fff3c4';
}

function initSparkParticle(p, cx, cy) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 45 + Math.random() * 88;
  p.active  = true;
  p.x       = cx;
  p.y       = cy;
  p.vx      = Math.cos(angle) * speed;
  p.vy      = Math.sin(angle) * speed - 45;
  p.life    = 0.42 + Math.random() * 0.32;
  p.maxLife = p.life;
  p.r       = 1.6 + Math.random() * 2.8;
  p.baseA   = 1;
  p.color   = Math.random() < 0.55 ? '#ffd700' : '#ffe88f';
}

function makePool(size) {
  const pool = [];
  for (let i = 0; i < size; i++) {
    pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1, r: 2, baseA: 1, color: '#ffd700' });
  }
  return pool;
}

// ─── VictoryScreen ────────────────────────────────────────────────────────────
export class VictoryScreen {
  /**
   * @param {{ onRestart: Function, onMainMenu: Function }} callbacks
   */
  constructor({ onRestart, onMainMenu }) {
    this._onRestart  = onRestart;
    this._onMainMenu = onMainMenu;

    this._data        = null;   // Spielstatistik-Snapshot
    this._levelTime   = 0;
    this._time        = 0;
    this._atmoTimer   = 0;
    this._hintBlink   = 0;
    this._starPopped  = [false, false, false];
    this._particles   = makePool(ATMO_POOL + SPARK_MAX * 3);
  }

  /**
   * Muss direkt vor dem Wechsel in den VICTORY-State aufgerufen werden.
   * Speichert die finalen Spielstatistiken und setzt die Animation zurück.
   * @param {{ hearts: number, heartsMax: number, score: number, gemsCollected: number, starCoins: boolean[] }} gameState
   * @param {number} levelTime  Levelzeit in Sekunden
   */
  show(gameState, levelTime) {
    this._data = {
      hearts:   gameState.hearts,
      score:    gameState.score,
      gems:     gameState.gemsCollected,
      starCoins: [...gameState.starCoins],
    };
    this._levelTime  = levelTime ?? 0;
    this._time       = 0;
    this._atmoTimer  = 0;
    this._hintBlink  = 0;
    this._starPopped = [false, false, false];
    for (const p of this._particles) p.active = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this._data) return;
    this._time      += dt;
    this._hintBlink += dt;
    this._atmoTimer += dt;

    // Atmosphärenpartikel periodisch spawnen
    if (this._atmoTimer >= ATMO_RATE) {
      this._atmoTimer = 0;
      for (const p of this._particles) {
        if (!p.active) { initAtmoParticle(p); break; }
      }
    }

    // Stern-Funken beim ersten Pop (nur wenn Stern gesammelt)
    for (let i = 0; i < 3; i++) {
      const tStart = T_STAR_0 + i * T_STAR_GAP;
      if (!this._starPopped[i] && this._time >= tStart + 0.06) {
        this._starPopped[i] = true;
        if (this._data.starCoins[i]) {
          const cx = Math.round(CX + (i - 1) * 90);
          let spawned = 0;
          for (const p of this._particles) {
            if (!p.active) {
              initSparkParticle(p, cx, STAR_CY);
              if (++spawned >= SPARK_MAX) break;
            }
          }
        }
      }
    }

    // Partikel simulieren
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 18 * dt;   // sehr leichte Auftriebsdämpfung
      p.life -= dt;
      if (p.life <= 0 || p.y < -20) p.active = false;
    }
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (!this._data) return;
    if (this._time < 0.5) return;   // Mindest-Anzeigezeit
    if (input.jumpPressed || input.enterPressed) {
      this._onRestart();
    } else if (input.escPressed) {
      this._onMainMenu();
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    // Vor show(): Himmelshintergrund ohne Inhalt
    if (!this._data) {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#2a4a62');
      sky.addColorStop(1, '#7aac8c');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    this._drawBackground(ctx);
    this._drawParticles(ctx);
    this._drawVignette(ctx);
    this._drawTitle(ctx);
    this._drawStars(ctx);
    this._drawStatsPanel(ctx);
    this._drawHints(ctx);
  }

  // ─── Hintergrund ─────────────────────────────────────────────────────────────

  _drawBackground(ctx) {
    // Warmer Tageshimmel (etwas heller und goldener als Hauptmenü)
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0,   '#2a4a62');
    sky.addColorStop(0.5, '#5a8aa4');
    sky.addColorStop(1,   '#7aac8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Hinterer Waldlayer
    const bgBack = imageCache.get('BG_FOREST_BACK');
    if (bgBack) {
      const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
      const drawW = Math.round(bgBack.naturalWidth * scale);
      ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
    }

    // Vorderer Waldlayer (unterer Bereich)
    const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
    if (bgMiddle) {
      const drawH = Math.round(CANVAS_HEIGHT * 0.55);
      const scale = drawH / bgMiddle.naturalHeight;
      const drawW = Math.round(bgMiddle.naturalWidth * scale);
      const drawY = CANVAS_HEIGHT - drawH;
      for (let x = 0; x < CANVAS_WIDTH; x += drawW) {
        ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
      }
    }

    // Warmes Sonnenlicht-Overlay: strahlt von oben ein
    const sun = ctx.createRadialGradient(CX, -20, 0, CX, 60, 380);
    sun.addColorStop(0,    'rgba(255,235,130,0.22)');
    sun.addColorStop(0.55, 'rgba(255,210,80,0.08)');
    sun.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  _drawVignette(ctx) {
    // Sanfte radiale Vignette — weicher als Game Over
    const grd = ctx.createRadialGradient(
      CX, CY * 1.0, CANVAS_HEIGHT * 0.20,
      CX, CY,       CANVAS_HEIGHT * 0.82,
    );
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // ─── Titel ────────────────────────────────────────────────────────────────────

  _drawTitle(ctx) {
    const tEased = easeOutQuad(Math.min(this._time / T_TITLE_DUR, 1.0));

    ctx.save();
    ctx.globalAlpha = tEased;
    ctx.translate(CX, 118);
    ctx.scale(0.92 + tEased * 0.08, 0.92 + tEased * 0.08);

    // Helles pulsierendes Sonnenglow
    const glow = 0.72 + Math.sin(this._time * 1.6) * 0.12;
    ctx.shadowColor = `rgba(255,228,60,${glow})`;
    ctx.shadowBlur  = 36;

    ctx.font         = FONT_TITLE;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    // Leichter dunkler Umriss für Kontrast auf hellem Hintergrund
    ctx.strokeStyle = 'rgba(50,25,0,0.75)';
    ctx.lineWidth   = 5;
    ctx.lineJoin    = 'round';
    ctx.strokeText(t('levelComplete'), 0, 0);

    // Heller goldener Verlauf: oben fast weiß → goldgelb → bernstein
    const grad = ctx.createLinearGradient(0, -52, 0, 0);
    grad.addColorStop(0,    '#fffce8');
    grad.addColorStop(0.35, '#ffe44d');
    grad.addColorStop(1,    '#d48a00');
    ctx.fillStyle = grad;
    ctx.fillText(t('levelComplete'), 0, 0);

    ctx.restore();
  }

  // ─── Sternbewertung ───────────────────────────────────────────────────────────

  _drawStars(ctx) {
    // Warmer Lichtschein hinter der Sternreihe
    const bloom = ctx.createRadialGradient(CX, STAR_CY, 0, CX, STAR_CY, 170);
    bloom.addColorStop(0,    'rgba(255,220,60,0.16)');
    bloom.addColorStop(0.55, 'rgba(255,185,40,0.06)');
    bloom.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const spacing = 90;
    for (let i = 0; i < 3; i++) {
      const tStart = T_STAR_0 + i * T_STAR_GAP;
      const tRaw   = Math.max(0, Math.min((this._time - tStart) / T_STAR_DUR, 1.0));
      if (tRaw <= 0) continue;

      const filled = this._data.starCoins[i] === true;
      const tEased = filled ? easeOutBack(tRaw) : easeOutQuad(tRaw);
      const alpha  = Math.min(tRaw * 2.8, 1.0);
      const cx     = Math.round(CX + (i - 1) * spacing);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, STAR_CY);
      ctx.scale(tEased, tEased);

      ctx.font         = FONT_STAR;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      if (filled) {
        const pulse = 0.55 + Math.sin(this._time * 2.0 + i * 0.5) * 0.18;
        ctx.shadowColor = `rgba(255,220,0,${pulse})`;
        ctx.shadowBlur  = 28;
        ctx.fillText('⭐', 0, 0);
      } else {
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = alpha * 0.28;
        ctx.fillStyle   = '#b0a080';
        ctx.fillText('☆', 0, 0);
      }

      ctx.restore();
    }
  }

  // ─── Statistiken auf Holzpanel ────────────────────────────────────────────────

  _drawStatsPanel(ctx) {
    const elapsed = this._time - T_STATS_IN;
    if (elapsed <= 0) return;
    const alpha = easeOutQuad(Math.min(elapsed / T_STATS_DUR, 1.0));

    const rows = [
      [t('livesRemaining'), `×${this._data.hearts}`],
      [t('score'),          String(this._data.score).padStart(5, '0')],
      [t('gems'),           `×${this._data.gems}`],
      [t('time'),           formatTime(this._levelTime)],
    ];

    ctx.save();
    ctx.globalAlpha = alpha;

    // Holzpanel (Hauptrahmen)
    this._drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    ctx.lineJoin = 'round';

    // Obere Trennlinie — mittig im Panel, symmetrisch zu BLOCK_Y
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14,           DIV_Y1);
    ctx.lineTo(PANEL_X + PANEL_W - 14,  DIV_Y1);
    ctx.stroke();

    // Statistikzeilen (genau 12 px Abstand von jeder Trennlinie)
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows.length; i++) {
      const y = BLOCK_Y + i * ROW_H;

      // Label (rechts-bündig zur Canvas-Mitte)
      ctx.font        = FONT_LABEL;
      ctx.textAlign   = 'right';
      ctx.strokeStyle = 'rgba(20,10,2,0.70)';
      ctx.lineWidth   = 2.5;
      ctx.strokeText(rows[i][0], CX - 10, y);
      ctx.fillStyle   = '#d8b882';
      ctx.fillText(rows[i][0], CX - 10, y);

      // Wert (links-bündig von der Canvas-Mitte)
      ctx.font        = FONT_VALUE;
      ctx.textAlign   = 'left';
      ctx.strokeText(rows[i][1], CX + 14, y);
      ctx.fillStyle   = '#fff8e0';
      ctx.fillText(rows[i][1], CX + 14, y);
    }

    // Untere Trennlinie
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14,           DIV_Y2);
    ctx.lineTo(PANEL_X + PANEL_W - 14,  DIV_Y2);
    ctx.stroke();

    ctx.restore();
  }

  // ─── Hinweise ─────────────────────────────────────────────────────────────────

  _drawHints(ctx) {
    const elapsed = this._time - T_HINTS_IN;
    if (elapsed <= 0) return;
    const fadeIn = easeOutQuad(Math.min(elapsed / 0.4, 1.0));

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin     = 'round';

    // Primärer Hinweis: pulsierend, cremegold auf dunklem Schatten
    const blink = 0.62 + Math.sin(this._hintBlink * 2.2) * 0.38;
    ctx.globalAlpha = fadeIn * blink;
    ctx.font        = FONT_HINT;
    ctx.strokeStyle = 'rgba(30,15,3,0.72)';
    ctx.lineWidth   = 3;
    ctx.strokeText(t('continueHint'), CX, HINT1_Y);
    ctx.fillStyle   = '#fff8d8';
    ctx.fillText(t('continueHint'), CX, HINT1_Y);

    // ESC-Hinweis: dezent, warmes Braun
    ctx.globalAlpha = fadeIn * 0.45;
    ctx.font        = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.55)';
    ctx.lineWidth   = 2;
    ctx.strokeText(t('menuHint'), CX, HINT1_Y + 16);
    ctx.fillStyle   = '#c8aa70';
    ctx.fillText(t('menuHint'), CX, HINT1_Y + 16);

    // Atmosphärische Zeile: sehr ruhig atmend
    const atmoPulse = 0.35 + Math.sin(this._time * 0.85) * 0.14;
    ctx.globalAlpha = fadeIn * atmoPulse;
    ctx.font        = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.45)';
    ctx.strokeText(t('nextPathAwaits'), CX, ATMO_Y);
    ctx.fillStyle   = '#a89258';
    ctx.fillText(t('nextPathAwaits'), CX, ATMO_Y);

    ctx.restore();
  }

  // ─── Partikel ─────────────────────────────────────────────────────────────────

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const lifeF = p.life / p.maxLife;
      // Sanftes Ein- und Ausblenden
      const a = p.baseA * (lifeF < 0.25 ? lifeF / 0.25 : lifeF > 0.85 ? (1 - lifeF) / 0.15 : 1.0);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.r * 3.0;   // Firefly-Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Holzpanel (visuell identisch mit Hauptmenü-Stil) ─────────────────────────

  _drawWoodPanel(ctx, x, y, w, h) {
    const r = 8;

    // Schlagschatten
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.65)';
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

    // Holzmaserung: helles Zentrum, dunkle Ränder
    const grain = ctx.createLinearGradient(x, y, x, y + h);
    grain.addColorStop(0,    'rgba(40,  20,  5,  0.60)');
    grain.addColorStop(0.10, 'rgba(195, 138, 68, 0.40)');
    grain.addColorStop(0.50, 'rgba(215, 158, 82, 0.46)');
    grain.addColorStop(0.90, 'rgba(125, 76,  30, 0.34)');
    grain.addColorStop(1,    'rgba(25,  12,  3,  0.68)');
    this._rrect(ctx, x, y, w, h, r);
    ctx.fillStyle = grain;
    ctx.fill();

    // Dunkle Trimbänder oben und unten
    ctx.fillStyle = 'rgba(28,14,4,0.50)';
    ctx.fillRect(x + r, y,          w - r * 2, 11);
    ctx.fillRect(x + r, y + h - 11, w - r * 2, 11);

    // Äußerer Rahmen
    ctx.strokeStyle = '#3b2615';
    ctx.lineWidth   = 4;
    this._rrect(ctx, x, y, w, h, r);
    ctx.stroke();

    // Innere Highlight-Linie
    ctx.strokeStyle = 'rgba(220,175,100,0.22)';
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
    ctx.strokeStyle = 'rgba(220,175,100,0.40)';
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

