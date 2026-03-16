// #region Imports
import { CANVAS_WIDTH, STAR_COIN_COUNT } from '../core/constants.js';
import { drawHudPanel } from './canvasUtils.js';
// #endregion

// #region Constants
const PAD = 10;
const PANEL_PAD = 8;
const HEART_SIZE = 26;
const HEART_ICON = '♥';
const STAR_SIZE = 18;
const STAR_GAP = 4;
const COIN_ICON_FILLED = '⭐';
const COIN_ICON_EMPTY = '☆';
const GEM_SIZE = 20;
const HUD_FONT = 'bold 13px monospace';
const SCORE_FONT = 'bold 12px monospace';
const COUNT_SPEED = 260;
const GEM_PULSE_PERIOD = 2.6;
const HEART_PULSE_PERIOD = 3.2;
const STAR_SHIMMER_PERIOD = 1.8;
const POOL_SIZE = 96;
// #endregion

// #region Class Definition
/**
 * Handles ease out.
 * @param {object} t Input parameter.
 */
function easeOut(t) { return 1 - (1 - t) ** 2; }

/**
 * Handles init particle.
 * @param {object} p Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} color Input parameter.
 */
function initParticle(p, x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 38 + Math.random() * 90;
  p.active = true;
  p.x = x;
  p.y = y;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed - 30;
  p.life = 0.55 + Math.random() * 0.35;
  p.maxLife = p.life;
  p.r = 1.8 + Math.random() * 3.0;
  p.color = color;
}

/**
 * Handles make pool.
 */
function makePool() {
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({
      active: false, x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 1, r: 2, color: '#fff'
    });
  }
  return pool;
}
export class Hud {

  /**
   * Creates a new instance.
   * @param {object} imageCache Input parameter.
   */
  constructor(imageCache) {
    this._imageCache = imageCache;
    this._displayScore = 0;
    this._prevScore = 0;
    this._displayGems = 0;
    this._targetGems = 0;
    this._heartBump = 0;
    this._gemBump = 0;
    this._heartFlash = 0;
    this._heartShakeT = 0;
    this._starBump = new Float32Array(STAR_COIN_COUNT);
    this._time = 0;
    this._particles = makePool();
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  update(dt) {
    this._time += dt;
    this._updateDisplayCounters(dt);
    this._updateAnimTimers(dt);
    this._updateStarBumps(dt);
    this._updateParticles(dt);
  }

  /**
   * Handles update display counters.
   * @param {number} dt Input parameter.
   */
  _updateDisplayCounters(dt) {
    if (this._displayScore < this._prevScore) {
      this._displayScore = Math.min(this._displayScore + COUNT_SPEED * dt * 4, this._prevScore);
    }
    if (this._displayGems < this._targetGems) {
      this._displayGems = Math.min(this._displayGems + COUNT_SPEED * dt * 0.04, this._targetGems);
    }
  }

  /**
   * Handles update anim timers.
   * @param {number} dt Input parameter.
   */
  _updateAnimTimers(dt) {
    this._heartBump = Math.max(0, this._heartBump - dt * 5);
    this._gemBump = Math.max(0, this._gemBump - dt * 5);
    this._heartFlash = Math.max(0, this._heartFlash - dt * 4);
    this._heartShakeT = Math.max(0, this._heartShakeT - dt);
  }

  /**
   * Handles update star bumps.
   * @param {number} dt Input parameter.
   */
  _updateStarBumps(dt) {
    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      this._starBump[i] = Math.max(0, this._starBump[i] - dt * 5);
    }
  }

  /**
   * Handles update particles.
   * @param {number} dt Input parameter.
   */
  _updateParticles(dt) {
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }

  /**
   * Handles notify.
   * @param {object} event Input parameter.
   * @param {object} screenX Input parameter.
   * @param {object} screenY Input parameter.
   * @param {number} slotIndex Input parameter.
   */
  notify(event, screenX, screenY, slotIndex) {
    switch (event) {
      case 'damage':
        this._onDamage();
        break;
      case 'heal':
        this._onHeal(screenX, screenY);
        break;
      case 'gem':
        this._onGem(screenX, screenY);
        break;
      case 'starCoin':
        this._onStarCoin(screenX, screenY, slotIndex);
        break;
    }
  }

  /** Handles damage notification effects. */
  _onDamage() {
    this._heartBump = 0.28;
    this._heartFlash = 1.0;
    this._heartShakeT = 0.28;
  }

  /**
   * Handles heal notification effects.
   * @param {object} screenX Input parameter.
   * @param {object} screenY Input parameter.
   */
  _onHeal(screenX, screenY) {
    this._heartBump = 0.22;
    this._spawnBurst(screenX, screenY, 8, '#ff4d4d', '#ff8888');
  }

  /**
   * Handles gem notification effects.
   * @param {object} screenX Input parameter.
   * @param {object} screenY Input parameter.
   */
  _onGem(screenX, screenY) {
    this._gemBump = 0.30;
    this._targetGems = (this._targetGems || 0) + 1;
    this._spawnBurst(screenX, screenY, 10, '#9b59ff', '#c084ff');
  }

  /**
   * Handles star coin notification effects.
   * @param {object} screenX Input parameter.
   * @param {object} screenY Input parameter.
   * @param {number} slotIndex Input parameter.
   */
  _onStarCoin(screenX, screenY, slotIndex) {
    if (slotIndex !== undefined && slotIndex < STAR_COIN_COUNT) this._starBump[slotIndex] = 0.35;
    this._spawnBurst(screenX, screenY, 14, '#ffd700', '#ffe88f');
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} gameState Input parameter.
   */
  draw(ctx, gameState) {
    this._prevScore = gameState.score;
    this._targetGems = gameState.gemsCollected;
    if (this._displayGems > gameState.gemsCollected) {
      this._displayGems = gameState.gemsCollected;
    }
    this._drawLeftPanel(ctx, gameState);
    this._drawRightPanel(ctx, gameState);
    this._drawParticles(ctx);
  }

  /**
   * Handles draw left panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} gameState Input parameter.
   */
  _drawLeftPanel(ctx, gameState) {
    const { hearts, starCoins } = gameState;
    const heartRowY = PAD + PANEL_PAD + HEART_SIZE / 2;
    const starRowY = PAD + PANEL_PAD + HEART_SIZE + 6 + STAR_SIZE / 2;
    ctx.save();
    ctx.translate(this._heartShakeX(), 0);
    drawHudPanel(ctx, PAD, PAD, 104, 68);
    this._drawHeartRow(ctx, heartRowY);
    this._drawHeartCount(ctx, hearts, heartRowY);
    this._drawStarRow(ctx, starCoins, starRowY, PAD + PANEL_PAD);
    ctx.restore();
  }

  /** Handles heart shake x offset. */
  _heartShakeX() {
    if (this._heartShakeT <= 0) return 0;
    const shake = Math.sin(this._time * 62) * 2.5 * (this._heartShakeT / 0.28);
    return Math.round(shake);
  }

  /**
   * Handles draw heart row.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} heartRowY Input parameter.
   */
  _drawHeartRow(ctx, heartRowY) {
    const pulse = Math.sin(this._time / HEART_PULSE_PERIOD * Math.PI * 2) * 0.04 + 1;
    const hScale = pulse * (1 + this._heartBump);
    const hcx = PAD + PANEL_PAD + HEART_SIZE / 2;
    ctx.save();
    ctx.translate(hcx, heartRowY);
    ctx.scale(hScale, hScale);
    this._drawHeartGlyph(ctx);
    ctx.restore();
  }

  /**
   * Handles draw heart glyph.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawHeartGlyph(ctx) {
    ctx.font = `bold ${HEART_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;
    this._applyHeartGlow(ctx);
    ctx.strokeStyle = 'rgba(60, 0, 0, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ff5a5a';
    ctx.strokeText(HEART_ICON, 0, 1);
    ctx.fillText(HEART_ICON, 0, 1);
  }

  /**
   * Handles apply heart glow.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _applyHeartGlow(ctx) {
    if (this._heartFlash > 0) {
      ctx.shadowColor = `rgba(255,80,80,${this._heartFlash * 0.9})`;
      ctx.shadowBlur = 14 * this._heartFlash;
      return;
    }
    ctx.shadowColor = 'rgba(255,70,70,0.60)';
    ctx.shadowBlur = 6;
  }

  /**
   * Handles draw heart count.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} hearts Input parameter.
   * @param {number} heartRowY Input parameter.
   */
  _drawHeartCount(ctx, hearts, heartRowY) {
    const countX = PAD + PANEL_PAD + HEART_SIZE + 5;
    ctx.font = HUD_FONT;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(`×${hearts}`, countX, heartRowY);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(`×${hearts}`, countX, heartRowY);
  }

  /**
   * Handles draw star row.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {boolean[]} starCoins Input parameter.
   * @param {number} starRowY Input parameter.
   * @param {number} starStartX Input parameter.
   */
  _drawStarRow(ctx, starCoins, starRowY, starStartX) {
    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      this._drawSingleStar(ctx, starCoins[i] === true, i, starStartX, starRowY);
    }
  }

  /**
   * Handles draw single star.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {boolean} filled Input parameter.
   * @param {number} i Input parameter.
   * @param {number} starStartX Input parameter.
   * @param {number} starRowY Input parameter.
   */
  _drawSingleStar(ctx, filled, i, starStartX, starRowY) {
    const scale = this._starScale(i, filled);
    const cx = starStartX + i * (STAR_SIZE + STAR_GAP) + STAR_SIZE / 2;
    ctx.save();
    ctx.translate(cx, starRowY);
    ctx.scale(scale, scale);
    ctx.font = `bold ${STAR_SIZE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this._applyStarStyle(ctx, filled);
    ctx.fillText(filled ? COIN_ICON_FILLED : COIN_ICON_EMPTY, 0, 1);
    ctx.restore();
  }

  /**
   * Handles star scale.
   * @param {number} i Input parameter.
   * @param {boolean} filled Input parameter.
   */
  _starScale(i, filled) {
    const bump = 1 + this._starBump[i];
    if (!filled) return bump;
    const shimmer = Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1;
    return bump * shimmer;
  }

  /**
   * Handles apply star style.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {boolean} filled Input parameter.
   */
  _applyStarStyle(ctx, filled) {
    if (filled) {
      const glow = 0.35 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.15;
      ctx.shadowColor = `rgba(255,215,0,${glow})`;
      ctx.shadowBlur = 7;
      ctx.globalAlpha = 1;
      return;
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.28;
  }

  /**
   * Handles draw right panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} gameState Input parameter.
   */
  _drawRightPanel(ctx, gameState) {
    const displayScore = Math.round(this._displayScore);
    const displayGems = Math.floor(this._displayGems);
    const panel = this._rightPanelRect();
    const inner = this._rightPanelInner(panel);
    drawHudPanel(ctx, panel.x, panel.y, panel.w, panel.h);
    ctx.save();
    this._drawScoreBlock(ctx, panel, inner, displayScore);
    this._drawGemBlock(ctx, panel, inner, displayGems);
    ctx.restore();
  }

  /** Handles right panel rect metrics. */
  _rightPanelRect() {
    const w = 148;
    const h = 56;
    const x = CANVAS_WIDTH - PAD - w;
    return { x, y: PAD, w, h };
  }

  /**
   * Handles right panel inner metrics.
   * @param {object} panel Input parameter.
   */
  _rightPanelInner(panel) {
    const left = panel.x + PANEL_PAD;
    const right = panel.x + panel.w - PANEL_PAD;
    return { left, right };
  }

  /**
   * Handles draw score block.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} panel Input parameter.
   * @param {object} inner Input parameter.
   * @param {number} displayScore Input parameter.
   */
  _drawScoreBlock(ctx, panel, inner, displayScore) {
    ctx.textBaseline = 'top';
    ctx.font = SCORE_FONT;
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText('SCORE', inner.left, panel.y + PANEL_PAD);
    ctx.fillStyle = '#c8b090';
    ctx.fillText('SCORE', inner.left, panel.y + PANEL_PAD);
    this._drawScoreValue(ctx, panel, inner.right, displayScore);
  }

  /**
   * Handles draw score value.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} panel Input parameter.
   * @param {number} rightX Input parameter.
   * @param {number} displayScore Input parameter.
   */
  _drawScoreValue(ctx, panel, rightX, displayScore) {
    const scoreStr = String(displayScore).padStart(5, '0');
    ctx.font = HUD_FONT;
    ctx.textAlign = 'right';
    ctx.strokeText(scoreStr, rightX, panel.y + PANEL_PAD);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(scoreStr, rightX, panel.y + PANEL_PAD);
  }

  /**
   * Handles draw gem block.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} panel Input parameter.
   * @param {object} inner Input parameter.
   * @param {number} displayGems Input parameter.
   */
  _drawGemBlock(ctx, panel, inner, displayGems) {
    const rowY = panel.y + PANEL_PAD + 22;
    this._drawGemIcon(ctx, inner.left + GEM_SIZE / 2, rowY + GEM_SIZE / 2);
    this._drawGemValue(ctx, inner.right, rowY + GEM_SIZE / 2, displayGems);
  }

  /**
   * Handles draw gem icon.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  _drawGemIcon(ctx, x, y) {
    const gemImg = this._imageCache.get('GEM_0');
    const pulse = Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1;
    const scale = pulse * (1 + this._gemBump);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    this._applyGemGlow(ctx);
    if (gemImg) ctx.drawImage(gemImg, -GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    else this._drawGemFallback(ctx);
    ctx.restore();
  }

  /**
   * Handles apply gem glow.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _applyGemGlow(ctx) {
    const glowAlpha = 0.40 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.20;
    ctx.shadowColor = `rgba(155,89,255,${glowAlpha})`;
    ctx.shadowBlur = 8;
  }

  /**
   * Handles draw gem fallback.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawGemFallback(ctx) {
    ctx.fillStyle = '#9b59ff';
    ctx.fillRect(-GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
  }

  /**
   * Handles draw gem value.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} rightX Input parameter.
   * @param {number} y Input parameter.
   * @param {number} displayGems Input parameter.
   */
  _drawGemValue(ctx, rightX, y, displayGems) {
    const gemStr = `×${displayGems}`;
    ctx.font = HUD_FONT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.strokeText(gemStr, rightX, y);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(gemStr, rightX, y);
  }

  /**
   * Handles spawn burst.
   * @param {object} sx Input parameter.
   * @param {object} sy Input parameter.
   * @param {number} count Input parameter.
   * @param {number} col1 Input parameter.
   * @param {number} col2 Input parameter.
   */
  _spawnBurst(sx, sy, count, col1, col2) {
    let spawned = 0;
    for (const p of this._particles) {
      if (!p.active) {
        initParticle(p, sx, sy, Math.random() < 0.5 ? col1 : col2);
        if (++spawned >= count) break;
      }
    }
  }

  /**
   * Handles draw particles.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const alpha = Math.max(easeOut(p.life / p.maxLife), 0);
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
// #endregion