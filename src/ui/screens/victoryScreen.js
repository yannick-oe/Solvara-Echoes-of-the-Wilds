import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';

// ─── Layout-Anker ─────────────────────────────────────────────────────────────
const CX = CANVAS_WIDTH  / 2;   // 360

// ─── Schriften ────────────────────────────────────────────────────────────────
const FONT_TITLE = 'bold 52px serif';
const FONT_LABEL = 'bold 12px monospace';
const FONT_VALUE = 'bold 13px monospace';
const FONT_STAR  = '58px sans-serif';
const FONT_HINT  = '13px monospace';
const FONT_HINT2 = '11px monospace';

// ─── Animations-Zeitstempel (Sekunden ab show()) ───────────────────────────────
const T_TITLE_DUR = 0.55;   // Titel-Fade-in-Dauer
const T_STAR_0    = 0.70;   // Erster Stern erscheint
const T_STAR_GAP  = 0.22;   // Versatz zwischen Sternen
const T_STAR_DUR  = 0.30;   // Bounce-Dauer pro Stern
const T_STATS_IN  = T_STAR_0 + 3 * T_STAR_GAP + T_STAR_DUR + 0.20;
const T_STATS_DUR = 0.35;
const T_HINTS_IN  = T_STATS_IN + T_STATS_DUR + 0.10;

// ─── Partikel ─────────────────────────────────────────────────────────────────
const ATMO_POOL  = 55;    // atmosphärische schwebende Partikel
const ATMO_RATE  = 0.09;  // Spawn-Intervall (s)
const SPARK_MAX  = 12;    // Funken pro Stern-Pop

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
  p.active  = true;
  p.x       = Math.random() * CANVAS_WIDTH;
  p.y       = CANVAS_HEIGHT + 6;
  p.vx      = (Math.random() - 0.5) * 18;
  p.vy      = -(16 + Math.random() * 28);
  p.life    = 3.5 + Math.random() * 2.5;
  p.maxLife = p.life;
  p.r       = 1.2 + Math.random() * 2.0;
  p.baseA   = 0.22 + Math.random() * 0.42;
  p.color   = Math.random() < 0.72 ? '#ffd700' : '#fff8dc';
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
          const cy = Math.round(CANVAS_HEIGHT * 0.455);
          let spawned = 0;
          for (const p of this._particles) {
            if (!p.active) {
              initSparkParticle(p, cx, cy);
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
    // Vor show(): nur schwarzen Hintergrund zeigen
    if (!this._data) {
      ctx.fillStyle = '#060410';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    // ── Hintergrund ──────────────────────────────────────────────────────────
    const bgGrd = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrd.addColorStop(0,   '#09050f');
    bgGrd.addColorStop(0.5, '#0d0808');
    bgGrd.addColorStop(1,   '#050304');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Warmer goldener Rückleuchtring hinter den Sternen
    const starCY = Math.round(CANVAS_HEIGHT * 0.455);
    const radGrd = ctx.createRadialGradient(CX, starCY, 0, CX, starCY, 210);
    radGrd.addColorStop(0,   'rgba(255,210,0,0.10)');
    radGrd.addColorStop(0.55,'rgba(255,175,0,0.05)');
    radGrd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = radGrd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ── Atmosphärische Partikel (hinter allem Inhalt) ─────────────────────────
    this._drawParticles(ctx);

    // ── Titel ─────────────────────────────────────────────────────────────────
    this._drawTitle(ctx);

    // ── Sternbewertung ────────────────────────────────────────────────────────
    this._drawStars(ctx, starCY);

    // ── Statistiken ───────────────────────────────────────────────────────────
    this._drawStats(ctx);

    // ── Hinweise ──────────────────────────────────────────────────────────────
    this._drawHints(ctx);
  }

  // ─── Privater Zeichencode ─────────────────────────────────────────────────

  _drawTitle(ctx) {
    const tEased = easeOutQuad(Math.min(this._time / T_TITLE_DUR, 1.0));
    const titleY = Math.round(CANVAS_HEIGHT * 0.245);

    ctx.save();
    ctx.globalAlpha = tEased;
    ctx.translate(CX, titleY);
    ctx.scale(0.92 + tEased * 0.08, 0.92 + tEased * 0.08);

    // Pulsierender goldener Glow
    const glow = 0.50 + Math.sin(this._time * 1.8) * 0.16;
    ctx.shadowColor = `rgba(255,215,0,${glow})`;
    ctx.shadowBlur  = 30;

    ctx.font         = FONT_TITLE;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    // Schwarzer Umriss
    ctx.strokeStyle = 'rgba(0,0,0,0.82)';
    ctx.lineWidth   = 5;
    ctx.lineJoin    = 'round';
    ctx.strokeText(t('levelComplete'), 0, 0);

    // Goldener vertikaler Verlauf
    const grad = ctx.createLinearGradient(0, -52, 0, 0);
    grad.addColorStop(0,    '#fffbe0');
    grad.addColorStop(0.45, '#ffd700');
    grad.addColorStop(1,    '#c87c00');
    ctx.fillStyle = grad;
    ctx.fillText(t('levelComplete'), 0, 0);

    ctx.restore();
  }

  _drawStars(ctx, cy) {
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
      ctx.translate(cx, cy);
      ctx.scale(tEased, tEased);

      ctx.font         = FONT_STAR;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      if (filled) {
        const pulse = 0.35 + Math.sin(this._time * 2.0 + i * 0.6) * 0.15;
        ctx.shadowColor = `rgba(255,215,0,${pulse})`;
        ctx.shadowBlur  = 24;
        ctx.fillText('⭐', 0, 0);
      } else {
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = alpha * 0.32;
        ctx.fillStyle   = '#888';
        ctx.fillText('☆', 0, 0);
      }

      ctx.restore();
    }
  }

  _drawStats(ctx) {
    const elapsed = this._time - T_STATS_IN;
    if (elapsed <= 0) return;
    const alpha = easeOutQuad(Math.min(elapsed / T_STATS_DUR, 1.0));

    const blockW = 220;
    const blockX = CX - blockW / 2;    // 250
    const blockR = CX + blockW / 2;    // 470
    const blockY = Math.round(CANVAS_HEIGHT * 0.615);
    const rowH   = 22;

    const rows = [
      [t('livesRemaining'), `×${this._data.hearts}`],
      [t('score'),          String(this._data.score).padStart(5, '0')],
      [t('gems'),           `×${this._data.gems}`],
      [t('time'),           formatTime(this._levelTime)],
    ];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineJoin    = 'round';

    // Trennlinie oben
    const divY1 = blockY - 14;
    ctx.strokeStyle = 'rgba(200,160,80,0.28)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(blockX - 4, divY1);
    ctx.lineTo(blockR + 4, divY1);
    ctx.stroke();

    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows.length; i++) {
      const y = blockY + i * rowH;

      // Label (rechts-bündig zur Mitte)
      ctx.font        = FONT_LABEL;
      ctx.textAlign   = 'right';
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.lineWidth   = 2.5;
      ctx.strokeText(rows[i][0], CX - 8, y);
      ctx.fillStyle   = '#b0956a';
      ctx.fillText(rows[i][0], CX - 8, y);

      // Wert (links-bündig von der Mitte)
      ctx.font        = FONT_VALUE;
      ctx.textAlign   = 'left';
      ctx.strokeText(rows[i][1], CX + 12, y);
      ctx.fillStyle   = '#fff4c0';
      ctx.fillText(rows[i][1], CX + 12, y);
    }

    // Trennlinie unten
    const divY2 = blockY + rows.length * rowH + 6;
    ctx.strokeStyle = 'rgba(200,160,80,0.28)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(blockX - 4, divY2);
    ctx.lineTo(blockR + 4, divY2);
    ctx.stroke();

    ctx.restore();
  }

  _drawHints(ctx) {
    const elapsed = this._time - T_HINTS_IN;
    if (elapsed <= 0) return;
    const fadeIn = easeOutQuad(Math.min(elapsed / 0.4, 1.0));

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin     = 'round';

    // Primärer Hinweis: Enter / Space — pulsiert sanft
    const blink   = 0.62 + Math.sin(this._hintBlink * 2.2) * 0.38;
    const hint1Y  = Math.round(CANVAS_HEIGHT * 0.868);
    ctx.globalAlpha = fadeIn * blink;
    ctx.font        = FONT_HINT;
    ctx.strokeStyle = 'rgba(0,0,0,0.72)';
    ctx.lineWidth   = 3;
    ctx.strokeText(t('continueHint'), CX, hint1Y);
    ctx.fillStyle   = '#fff4c0';
    ctx.fillText(t('continueHint'), CX, hint1Y);

    // Sekundärer Hinweis: ESC → Hauptmenü
    ctx.globalAlpha = fadeIn * 0.50;
    ctx.font        = FONT_HINT2;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth   = 2;
    ctx.strokeText(t('menuHint'), CX, hint1Y + 18);
    ctx.fillStyle   = '#8a7a5a';
    ctx.fillText(t('menuHint'), CX, hint1Y + 18);

    // Atmosphärische Zeile — sehr dezent, atmet langsam
    const atmoPulse = 0.38 + Math.sin(this._time * 0.85) * 0.14;
    ctx.globalAlpha = fadeIn * atmoPulse;
    ctx.font        = FONT_HINT2;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeText(t('nextPathAwaits'), CX, Math.round(CANVAS_HEIGHT * 0.932));
    ctx.fillStyle   = '#7a6840';
    ctx.fillText(t('nextPathAwaits'), CX, Math.round(CANVAS_HEIGHT * 0.932));

    ctx.restore();
  }

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const lifeF = p.life / p.maxLife;
      const a     = p.baseA * (lifeF < 0.25 ? lifeF / 0.25 : 1.0);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.r * 2.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

