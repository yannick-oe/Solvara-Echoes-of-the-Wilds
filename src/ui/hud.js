import { CANVAS_WIDTH, STAR_COIN_COUNT } from '../core/constants.js';

// ─── Layout ───────────────────────────────────────────────────────────────────
const PAD         = 10;   // Canvas-Rand
const PANEL_PAD   = 8;    // innerer Abstand im Panel
const HEART_SIZE  = 26;
const HEART_ICON  = '❤';
const COIN_SIZE   = 30;
const COIN_GAP    = 4;
const GEM_SIZE    = 20;
const HUD_FONT    = 'bold 13px monospace';
const SCORE_FONT  = 'bold 12px monospace';

// Animationsgeschwindigkeit Score / Gems (Einheiten/s)
const COUNT_SPEED = 260;
// Pulse-Zyklusdauer (s)
const GEM_PULSE_PERIOD  = 2.6;
const HEART_PULSE_PERIOD = 3.2;

// Partikel-Pool-Größe
const POOL_SIZE = 96;

// ─── Easing ──────────────────────────────────────────────────────────────────
function easeOut(t) { return 1 - (1 - t) ** 2; }

// ─── Partikel initialisieren ─────────────────────────────────────────────────
function initParticle(p, x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 38 + Math.random() * 90;
  p.active = true;
  p.x      = x;
  p.y      = y;
  p.vx     = Math.cos(angle) * speed;
  p.vy     = Math.sin(angle) * speed - 30;
  p.life   = 0.55 + Math.random() * 0.35;
  p.maxLife = p.life;
  p.r      = 1.8 + Math.random() * 3.0;
  p.color  = color;
}

function makePool() {
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1, r: 2, color: '#fff' });
  }
  return pool;
}

export class Hud {
  /**
   * @param {import('../core/imageCache.js').ImageCache} imageCache
   */
  constructor(imageCache) {
    this._imageCache = imageCache;

    // ── Zähler-Animation ──────────────────────────────────────────────────────
    this._displayScore = 0;   // angezeigte (interpolierte) Punktzahl
    this._prevScore    = 0;
    this._displayGems  = 0;   // angezeigte Gem-Anzahl
    this._targetGems   = 0;   // Zielwert (aus gameState)

    // ── Schlag-Animation (Herz + Gem) ─────────────────────────────────────────
    this._heartBump   = 0;  // 0..1 Skalierungswert, zerfällt pro Frame
    this._gemBump     = 0;
    this._heartFlash  = 0;  // 0..1 roter Blitz
    this._heartShakeT = 0;  // Shake-Timer
    this._gemBumpDir  = 1;  // +1 wächst, -1 schrumpft (für Gain-Animation)

    // ── Idle-Loop ─────────────────────────────────────────────────────────────
    this._time = 0;

    // ── Partikel-Pool ─────────────────────────────────────────────────────────
    this._particles = makePool();
  }

  // ─── Öffentliche API ──────────────────────────────────────────────────────

  /** @param {number} dt  Deltazeit (s) */
  update(dt) {
    this._time += dt;

    // Zahlen-Countup
    if (this._displayScore < this._prevScore) {
      this._displayScore = Math.min(
        this._displayScore + COUNT_SPEED * dt * 4,
        this._prevScore,
      );
    }
    if (this._displayGems < this._targetGems) {
      this._displayGems = Math.min(
        this._displayGems + COUNT_SPEED * dt * 0.04,
        this._targetGems,
      );
    }

    // Bump-Zerfall
    this._heartBump   = Math.max(0, this._heartBump   - dt * 5);
    this._gemBump     = Math.max(0, this._gemBump     - dt * 5);
    this._heartFlash  = Math.max(0, this._heartFlash  - dt * 4);
    this._heartShakeT = Math.max(0, this._heartShakeT - dt);

    // Partikel
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 120 * dt;  // sanfte Schwerkraft
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }

  /**
   * HUD-Ereignis auslösen – Animationen + Partikel starten.
   * @param {'damage'|'heal'|'gem'|'starCoin'} event
   * @param {number} screenX  Weltposition → Bildschirmkoordinate X
   * @param {number} screenY
   */
  notify(event, screenX, screenY) {
    switch (event) {
      case 'damage':
        this._heartBump   = 0.28;
        this._heartFlash  = 1.0;
        this._heartShakeT = 0.28;
        this._spawnBurst(screenX, screenY, 8, '#e8344a', '#ff8888');
        break;
      case 'heal':
        this._heartBump  = 0.22;
        this._spawnBurst(screenX, screenY, 8, '#ffd700', '#ffe98f');
        break;
      case 'gem':
        this._gemBump    = 0.30;
        this._targetGems = (this._targetGems || 0) + 1;  // wird von draw() gedeckelt
        this._spawnBurst(screenX, screenY, 10, '#4af', '#aae8ff');
        break;
      case 'starCoin':
        this._spawnBurst(screenX, screenY, 16, '#ffd700', '#ffe98f');
        break;
    }
  }

  /** Score-Ist-Wert wird gesetzt; Display-Feld holt auf (Countup). */
  syncScore(score) {
    this._prevScore = score;
  }

  /**
   * HUD vollständig zeichnen (Screen-Space).
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ hearts: number, heartsMax: number, score: number, gemsCollected: number, starCoins: boolean[] }} gameState
   */
  draw(ctx, gameState) {
    // Ziel-Score synchron halten (wird jeden Frame gesetzt)
    this._prevScore = gameState.score;
    // Gem-Zielwert aus gameState; displayGems zählt sanft nach oben
    this._targetGems = gameState.gemsCollected;
    if (this._displayGems > gameState.gemsCollected) {
      this._displayGems = gameState.gemsCollected;
    }

    this._drawLeftPanel(ctx, gameState);
    this._drawRightPanel(ctx, gameState);
    this._drawStarCoins(ctx, gameState.starCoins);
    this._drawParticles(ctx);
  }

  // ─── Linkes Panel (❤ × N) ──────────────────────────────────────────────────

  _drawLeftPanel(ctx, gameState) {
    const { hearts } = gameState;
    const shakeX = this._heartShakeT > 0
      ? Math.round(Math.sin(this._time * 62) * 2.5 * (this._heartShakeT / 0.28))
      : 0;

    ctx.save();
    ctx.translate(shakeX, 0);

    // Panel hinter ❤ × N
    const panelW = 92;
    const panelH = 38;
    this._drawPanel(ctx, PAD, PAD, panelW, panelH);

    // Pulsierendes Herz
    const pulse = Math.sin(this._time / HEART_PULSE_PERIOD * Math.PI * 2) * 0.04 + 1;
    const bump  = 1 + this._heartBump;
    const hScale = pulse * bump;
    const hcx = PAD + PANEL_PAD + HEART_SIZE / 2;
    const hcy = PAD + panelH / 2;

    ctx.save();
    ctx.translate(hcx, hcy);
    ctx.scale(hScale, hScale);
    ctx.font      = `bold ${HEART_SIZE}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Roter Blitz
    if (this._heartFlash > 0) {
      ctx.shadowColor = `rgba(255,80,80,${this._heartFlash * 0.9})`;
      ctx.shadowBlur  = 14 * this._heartFlash;
    } else {
      ctx.shadowColor = 'rgba(220,60,60,0.6)';
      ctx.shadowBlur  = 8;
    }
    ctx.fillText(HEART_ICON, 0, 1);
    ctx.restore();

    // × N
    ctx.font      = HUD_FONT;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';
    const textX   = PAD + PANEL_PAD + HEART_SIZE + 4;
    const textY   = PAD + panelH / 2;
    ctx.strokeStyle  = 'rgba(0,0,0,0.75)';
    ctx.lineWidth    = 3;
    ctx.lineJoin     = 'round';
    ctx.strokeText(`×${hearts}`, textX, textY);
    ctx.fillStyle    = '#fff4c0';
    ctx.fillText(`×${hearts}`, textX, textY);

    ctx.restore();
  }

  // ─── Rechtes Panel (SCORE + 💎 × N) ───────────────────────────────────────

  _drawRightPanel(ctx, gameState) {
    const displayScore = Math.round(this._displayScore);
    const displayGems  = Math.floor(this._displayGems);
    const gemImg       = this._imageCache.get('GEM_0');

    const panelW = 148;
    const panelH = 56;
    const panelX = CANVAS_WIDTH - PAD - panelW;
    const panelY = PAD;

    this._drawPanel(ctx, panelX, panelY, panelW, panelH);

    const innerX = panelX + PANEL_PAD;
    const innerR = panelX + panelW - PANEL_PAD;

    ctx.save();
    ctx.textBaseline = 'top';

    // Score-Zeile
    ctx.font         = SCORE_FONT;
    ctx.textAlign    = 'left';
    ctx.strokeStyle  = 'rgba(0,0,0,0.75)';
    ctx.lineWidth    = 3;
    ctx.lineJoin     = 'round';
    const scoreLabel = 'SCORE';
    ctx.strokeText(scoreLabel, innerX, panelY + PANEL_PAD);
    ctx.fillStyle    = '#c8b090';
    ctx.fillText(scoreLabel, innerX, panelY + PANEL_PAD);

    ctx.font         = HUD_FONT;
    ctx.textAlign    = 'right';
    const scoreStr   = String(displayScore).padStart(5, '0');
    ctx.strokeText(scoreStr, innerR, panelY + PANEL_PAD);
    ctx.fillStyle    = '#fff4c0';
    ctx.fillText(scoreStr, innerR, panelY + PANEL_PAD);

    // Gem-Zeile
    const gemRowY  = panelY + PANEL_PAD + 22;
    const gemPulse = Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1;
    const gemBump  = 1 + this._gemBump;
    const gemScale = gemPulse * gemBump;
    const gemIconX = innerX + GEM_SIZE / 2;
    const gemIconY = gemRowY + GEM_SIZE / 2;

    ctx.save();
    ctx.translate(gemIconX, gemIconY);
    ctx.scale(gemScale, gemScale);
    if (gemImg) {
      ctx.drawImage(gemImg, -GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    } else {
      ctx.fillStyle = '#4af';
      ctx.fillRect(-GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    }
    // Glow
    ctx.shadowColor = `rgba(80,200,255,${0.35 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.20})`;
    ctx.shadowBlur  = 8;
    if (gemImg) ctx.drawImage(gemImg, -GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    ctx.restore();

    ctx.font         = HUD_FONT;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    const gemStr     = `×${displayGems}`;
    ctx.strokeStyle  = 'rgba(0,0,0,0.75)';
    ctx.lineWidth    = 3;
    ctx.strokeText(gemStr, innerR, gemRowY + GEM_SIZE / 2);
    ctx.fillStyle    = '#fff4c0';
    ctx.fillText(gemStr, innerR, gemRowY + GEM_SIZE / 2);

    ctx.restore();
  }

  // ─── StarCoin-Leiste (mittig oben) ─────────────────────────────────────────

  _drawStarCoins(ctx, starCoins) {
    const totalW = STAR_COIN_COUNT * COIN_SIZE + (STAR_COIN_COUNT - 1) * COIN_GAP;
    const panelW = totalW + PANEL_PAD * 2;
    const startX = (CANVAS_WIDTH - panelW) / 2;
    this._drawPanel(ctx, startX, PAD, panelW, COIN_SIZE + PANEL_PAD * 2);

    const coinY = PAD + PANEL_PAD;
    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      const cx     = startX + PANEL_PAD + i * (COIN_SIZE + COIN_GAP);
      const img    = this._imageCache.get('STAR_COIN_0');
      const filled = starCoins[i] === true;

      ctx.save();
      if (!filled) ctx.globalAlpha = 0.28;

      if (filled) {
        ctx.shadowColor = 'rgba(255,215,0,0.65)';
        ctx.shadowBlur  = 6;
      }

      if (img) {
        ctx.drawImage(img, cx, coinY, COIN_SIZE, COIN_SIZE);
      } else {
        ctx.beginPath();
        ctx.arc(cx + COIN_SIZE / 2, coinY + COIN_SIZE / 2, COIN_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = filled ? '#ffd700' : '#888';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ─── Partikel ──────────────────────────────────────────────────────────────

  _spawnBurst(sx, sy, count, col1, col2) {
    let spawned = 0;
    for (const p of this._particles) {
      if (!p.active) {
        initParticle(p, sx, sy, Math.random() < 0.5 ? col1 : col2);
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const alpha = Math.max(easeOut(p.life / p.maxLife), 0);
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Panel-Hintergrund ─────────────────────────────────────────────────────

  _drawPanel(ctx, x, y, w, h) {
    const r = 7;
    ctx.save();

    // Schatten
    ctx.shadowColor   = 'rgba(0,0,0,0.50)';
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetY = 2;

    const grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, 'rgba(12, 8, 4, 0.72)');
    grd.addColorStop(1, 'rgba(6,  3, 1, 0.82)');
    ctx.fillStyle = grd;
    this._rrect(ctx, x, y, w, h, r);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;

    // Subtile innere Linie
    ctx.strokeStyle = 'rgba(200,160,80,0.18)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
    ctx.stroke();

    ctx.restore();
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