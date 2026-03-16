// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { imageCache } from '../../core/imageCache.js';
import { drawWoodPanel } from '../canvasUtils.js';
import {

  easeOutBack, easeOutQuad, formatTime,
  makePool, initAtmoParticle, initSparkParticle,
} from '../victoryParticles.js';
// #endregion

// #region Constants
const CX      = CANVAS_WIDTH  / 2;
const CY      = CANVAS_HEIGHT / 2;
const STAR_CY = 176;
const PANEL_W = 280;
const PANEL_H = 124;
const PANEL_X = CX - PANEL_W / 2;
const PANEL_Y = 236;
const BLOCK_Y = 262;
const ROW_H   = 24;
const DIV_Y1  = BLOCK_Y - 12;
const DIV_Y2  = BLOCK_Y + 3 * ROW_H + 12;
const HINT1_Y = 392;
const ATMO_Y  = 428;
const FONT_TITLE = 'bold 52px serif';
const FONT_LABEL = 'bold 12px monospace';
const FONT_VALUE = 'bold 13px monospace';
const FONT_STAR  = '58px sans-serif';
const FONT_HINT  = '13px monospace';
const FONT_HINT2 = '11px monospace';
const T_TITLE_DUR = 0.55;
const T_STAR_0    = 0.70;
const T_STAR_GAP  = 0.22;
const T_STAR_DUR  = 0.30;
const T_STATS_IN  = T_STAR_0 + 3 * T_STAR_GAP + T_STAR_DUR + 0.20;
const T_STATS_DUR = 0.35;
const T_HINTS_IN  = T_STATS_IN + T_STATS_DUR + 0.10;
const ATMO_POOL = 55;
const ATMO_RATE = 0.14;
const SPARK_MAX = 12;
// #endregion

// #region Class Definition
export class VictoryScreen {

  /**
   * Creates a new instance.
   * @param {object} param1 Composite input parameter.
   * @param {object} onMainMenu } Input parameter.
   */
  constructor({ onRestart, onMainMenu }) {
    this._onRestart  = onRestart;
    this._onMainMenu = onMainMenu;

    this._data        = null;
    this._levelTime   = 0;
    this._time        = 0;
    this._atmoTimer   = 0;
    this._hintBlink   = 0;
    this._starPopped  = [false, false, false];
    this._particles   = makePool(ATMO_POOL + SPARK_MAX * 3);
  }

  /**
   * Shows the victory screen with the provided gameplay data.
   * @param {object}  gameState  - Current game state (hearts, score, gems, starCoins)
   * @param {number}  levelTime  - Elapsed level time in seconds
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

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  update(dt) {
    if (!this._data) return;
    this._tickTimers(dt);
    this._spawnAtmoParticleIfDue();
    for (let i = 0; i < 3; i++) this._updateStarPop(i);
    this._tickParticles(dt);
  }

  /**
   * Advances victory screen timers.
   * @param {number} dt Input parameter.
   */
  _tickTimers(dt) {
    this._time += dt;
    this._hintBlink += dt;
    this._atmoTimer += dt;
  }

  /**
   * Spawns one atmospheric particle when spawn timer reaches rate.
   */
  _spawnAtmoParticleIfDue() {
    if (this._atmoTimer < ATMO_RATE) return;
    this._atmoTimer = 0;
    for (const p of this._particles) {
      if (!p.active) { initAtmoParticle(p, CANVAS_WIDTH, CANVAS_HEIGHT); break; }
    }
  }

  /**
   * Triggers star pop/spark once when timeline reaches star slot.
   * @param {number} i Input parameter.
   */
  _updateStarPop(i) {
    const tStart = T_STAR_0 + i * T_STAR_GAP;
    if (this._starPopped[i] || this._time < tStart + 0.06) return;
    this._starPopped[i] = true;
    if (this._data.starCoins[i]) this._spawnStarSparks(i);
  }

  /**
   * Spawns sparkle burst for a collected star coin.
   * @param {number} i Input parameter.
   */
  _spawnStarSparks(i) {
    const cx = Math.round(CX + (i - 1) * 90);
    let spawned = 0;
    for (const p of this._particles) {
      if (!p.active) {
        initSparkParticle(p, cx, STAR_CY);
        if (++spawned >= SPARK_MAX) break;
      }
    }
  }

  /**
   * Updates all active particles and deactivates expired ones.
   * @param {number} dt Input parameter.
   */
  _tickParticles(dt) {
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 18 * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y < -20) p.active = false;
    }
  }

  /**
   * Handles handle input.
   * @param {object} input Input parameter.
   */
  handleInput(input) {
    if (!this._data) return;
    if (this._time < 0.5) return;
    if (input.pausePressed)              this._onMainMenu();
    if (input.jumpPressed || input.enterPressed) this._onRestart();
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  draw(ctx) {
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

  /**
   * Handles draw background.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawBackground(ctx) {
    this._drawSkyGradient(ctx);
    this._drawBackgroundBackLayer(ctx);
    this._drawBackgroundMiddleLayer(ctx);
    this._drawSunGlow(ctx);
  }

  /**
   * Draws sky gradient backdrop.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSkyGradient(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#2a4a62');
    sky.addColorStop(0.5, '#5a8aa4');
    sky.addColorStop(1, '#7aac8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Draws far forest background layer.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawBackgroundBackLayer(ctx) {
    const bgBack = imageCache.get('BG_FOREST_BACK');
    if (!bgBack) return;
    const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
    const drawW = Math.round(bgBack.naturalWidth * scale);
    ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
  }

  /**
   * Draws repeating middle forest layer.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawBackgroundMiddleLayer(ctx) {
    const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
    if (!bgMiddle) return;
    const drawH = Math.round(CANVAS_HEIGHT * 0.55);
    const scale = drawH / bgMiddle.naturalHeight;
    const drawW = Math.round(bgMiddle.naturalWidth * scale);
    const drawY = CANVAS_HEIGHT - drawH;
    for (let x = 0; x < CANVAS_WIDTH; x += drawW) ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
  }

  /**
   * Draws soft sun glow over background.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSunGlow(ctx) {
    const sun = ctx.createRadialGradient(CX, -20, 0, CX, 60, 380);
    sun.addColorStop(0, 'rgba(255,235,130,0.22)');
    sun.addColorStop(0.55, 'rgba(255,210,80,0.08)');
    sun.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Handles draw vignette.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawVignette(ctx) {
    const grd = ctx.createRadialGradient(
      CX, CY * 1.0, CANVAS_HEIGHT * 0.20,
      CX, CY,       CANVAS_HEIGHT * 0.82,
    );
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Handles draw title.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawTitle(ctx) {
    const tEased = easeOutQuad(Math.min(this._time / T_TITLE_DUR, 1.0));
    const label = t('levelComplete');
    ctx.save();
    this._setupTitleTransform(ctx, tEased);
    this._drawTitleStroke(ctx, label);
    this._drawTitleFill(ctx, label);
    ctx.restore();
  }

  /** Configures transform/shadow state for title rendering. */
  _setupTitleTransform(ctx, tEased) {
    ctx.globalAlpha = tEased;
    ctx.translate(CX, 118);
    ctx.scale(0.92 + tEased * 0.08, 0.92 + tEased * 0.08);
    const glow = 0.72 + Math.sin(this._time * 1.6) * 0.12;
    ctx.shadowColor = `rgba(255,228,60,${glow})`;
    ctx.shadowBlur = 36;
    ctx.font = FONT_TITLE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
  }

  /** Draws title outline pass. */
  _drawTitleStroke(ctx, label) {
    ctx.strokeStyle = 'rgba(50,25,0,0.75)';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText(label, 0, 0);
  }

  /** Draws title gradient fill pass. */
  _drawTitleFill(ctx, label) {
    const grad = ctx.createLinearGradient(0, -52, 0, 0);
    grad.addColorStop(0, '#fffce8');
    grad.addColorStop(0.35, '#ffe44d');
    grad.addColorStop(1, '#d48a00');
    ctx.fillStyle = grad;
    ctx.fillText(label, 0, 0);
  }

  /**
   * Handles draw stars.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawStars(ctx) {
    this._drawStarsBloom(ctx);
    for (let i = 0; i < 3; i++) this._drawSingleStar(ctx, i);
  }

  /**
   * Draws soft bloom behind stars.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawStarsBloom(ctx) {
    const bloom = ctx.createRadialGradient(CX, STAR_CY, 0, CX, STAR_CY, 170);
    bloom.addColorStop(0, 'rgba(255,220,60,0.16)');
    bloom.addColorStop(0.55, 'rgba(255,185,40,0.06)');
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Draws one animated star slot.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} i Input parameter.
   */
  _drawSingleStar(ctx, i) {
    const tStart = T_STAR_0 + i * T_STAR_GAP;
    const tRaw = Math.max(0, Math.min((this._time - tStart) / T_STAR_DUR, 1.0));
    if (tRaw <= 0) return;
    const filled = this._data.starCoins[i] === true;
    const tEased = filled ? easeOutBack(tRaw) : easeOutQuad(tRaw);
    const alpha = Math.min(tRaw * 2.8, 1.0);
    const cx = Math.round(CX + (i - 1) * 90);
    this._drawStarGlyph(ctx, i, cx, alpha, tEased, filled);
  }

  /**
   * Draws one star glyph with filled/empty style.
   */
  _drawStarGlyph(ctx, i, cx, alpha, tEased, filled) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, STAR_CY);
    ctx.scale(tEased, tEased);
    ctx.font = FONT_STAR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (filled) this._drawFilledStar(ctx, i);
    else this._drawEmptyStar(ctx, alpha);
    ctx.restore();
  }

  /** Draws glowing filled star glyph. */
  _drawFilledStar(ctx, i) {
    const pulse = 0.55 + Math.sin(this._time * 2.0 + i * 0.5) * 0.18;
    ctx.shadowColor = `rgba(255,220,0,${pulse})`;
    ctx.shadowBlur  = 28;
    ctx.fillText('⭐', 0, 0);
  }

  /** Draws dim empty star glyph. */
  _drawEmptyStar(ctx, alpha) {
    ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = '#b0a080';
    ctx.fillText('☆', 0, 0);
  }

  /**
   * Handles draw stats panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawStatsPanel(ctx) {
    const elapsed = this._time - T_STATS_IN;
    if (elapsed <= 0) return;
    const alpha = easeOutQuad(Math.min(elapsed / T_STATS_DUR, 1.0));
    ctx.save();
    ctx.globalAlpha = alpha;
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    this._drawStatsTopDivider(ctx);
    this._drawStatsRows(ctx, this._buildStatsRows());
    this._drawStatsBottomDivider(ctx);
    ctx.restore();
  }

  /** Builds formatted stats rows for panel rendering. */
  _buildStatsRows() {
    return [
      [t('livesRemaining'), `×${this._data.hearts}`],
      [t('score'), String(this._data.score).padStart(5, '0')],
      [t('gems'), `×${this._data.gems}`],
      [t('time'), formatTime(this._levelTime)],
    ];
  }

  /** Draws top stats divider line. */
  _drawStatsTopDivider(ctx) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14, DIV_Y1);
    ctx.lineTo(PANEL_X + PANEL_W - 14, DIV_Y1);
    ctx.stroke();
  }

  /** Draws bottom stats divider line. */
  _drawStatsBottomDivider(ctx) {
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14, DIV_Y2);
    ctx.lineTo(PANEL_X + PANEL_W - 14, DIV_Y2);
    ctx.stroke();
  }

  /** Draws all rows in the stats panel. */
  _drawStatsRows(ctx, rows) {
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows.length; i++) this._drawStatsRow(ctx, rows[i], BLOCK_Y + i * ROW_H);
  }

  /** Draws one stats row label/value pair. */
  _drawStatsRow(ctx, row, y) {
    ctx.font = FONT_LABEL;
    ctx.textAlign = 'right';
    ctx.strokeStyle = 'rgba(20,10,2,0.70)';
    ctx.lineWidth = 2.5;
    ctx.strokeText(row[0], CX - 10, y);
    ctx.fillStyle = '#d8b882';
    ctx.fillText(row[0], CX - 10, y);
    ctx.font = FONT_VALUE;
    ctx.textAlign = 'left';
    ctx.strokeText(row[1], CX + 14, y);
    ctx.fillStyle = '#fff8e0';
    ctx.fillText(row[1], CX + 14, y);
  }

  /**
   * Handles draw hints.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawHints(ctx) {
    const elapsed = this._time - T_HINTS_IN;
    if (elapsed <= 0) return;
    const fadeIn = easeOutQuad(Math.min(elapsed / 0.4, 1.0));
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin     = 'round';
    this._drawPrimaryHint(ctx, fadeIn);
    this._drawMenuHint(ctx, fadeIn);
    this._drawAtmoHint(ctx, fadeIn);
    ctx.restore();
  }

  /** Draws blinking primary continue hint. */
  _drawPrimaryHint(ctx, fadeIn) {
    const blink = 0.62 + Math.sin(this._hintBlink * 2.2) * 0.38;
    ctx.globalAlpha = fadeIn * blink;
    ctx.font = FONT_HINT;
    ctx.strokeStyle = 'rgba(30,15,3,0.72)';
    ctx.lineWidth = 3;
    ctx.strokeText(t('continueHint'), CX, HINT1_Y);
    ctx.fillStyle = '#fff8d8';
    ctx.fillText(t('continueHint'), CX, HINT1_Y);
  }

  /** Draws secondary menu hint. */
  _drawMenuHint(ctx, fadeIn) {
    ctx.globalAlpha = fadeIn * 0.45;
    ctx.font = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeText(t('menuHint'), CX, HINT1_Y + 16);
    ctx.fillStyle = '#c8aa70';
    ctx.fillText(t('menuHint'), CX, HINT1_Y + 16);
  }

  /** Draws ambient "next path" hint line. */
  _drawAtmoHint(ctx, fadeIn) {
    const atmoPulse = 0.35 + Math.sin(this._time * 0.85) * 0.14;
    ctx.globalAlpha = fadeIn * atmoPulse;
    ctx.font = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.45)';
    ctx.strokeText(t('nextPathAwaits'), CX, ATMO_Y);
    ctx.fillStyle = '#a89258';
    ctx.fillText(t('nextPathAwaits'), CX, ATMO_Y);
  }

  /**
   * Handles draw particles.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const lifeF = p.life / p.maxLife;
      const a = p.baseA * (lifeF < 0.25 ? lifeF / 0.25 : lifeF > 0.85 ? (1 - lifeF) / 0.15 : 1.0);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.r * 3.0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
// #endregion