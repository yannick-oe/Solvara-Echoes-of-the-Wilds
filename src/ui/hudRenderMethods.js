import { CANVAS_WIDTH, STAR_COIN_COUNT } from '../core/constants.js';
import { drawHudPanel } from './canvasUtils.js';
import {
  COIN_ICON_EMPTY, COIN_ICON_FILLED, easeOut, GEM_PULSE_PERIOD, GEM_SIZE, HEART_ICON,
  HEART_PULSE_PERIOD, HEART_SIZE, HUD_FONT, PAD, PANEL_PAD, SCORE_FONT, STAR_GAP, STAR_SIZE,
} from './hudShared.js';

export const hudRenderMethods = {
  draw(ctx, gameState) {
    this._prevScore = gameState.score;
    this._targetGems = gameState.gemsCollected;
    if (this._displayGems > gameState.gemsCollected) this._displayGems = gameState.gemsCollected;
    this._drawLeftPanel(ctx, gameState);
    this._drawRightPanel(ctx, gameState);
    this._drawParticles(ctx);
  },

  _drawLeftPanel(ctx, gameState) {
    const heartRowY = PAD + PANEL_PAD + HEART_SIZE / 2;
    const starRowY = PAD + PANEL_PAD + HEART_SIZE + 6 + STAR_SIZE / 2;
    ctx.save();
    ctx.translate(this._heartShakeX(), 0);
    drawHudPanel(ctx, PAD, PAD, 104, 68);
    this._drawHeartRow(ctx, heartRowY);
    this._drawHeartCount(ctx, gameState.hearts, heartRowY);
    this._drawStarRow(ctx, gameState.starCoins, starRowY, PAD + PANEL_PAD);
    ctx.restore();
  },

  _heartShakeX() {
    if (this._heartShakeT <= 0) return 0;
    return Math.round(Math.sin(this._time * 62) * 2.5 * (this._heartShakeT / 0.28));
  },

  _drawHeartRow(ctx, heartRowY) {
    const pulse = Math.sin(this._time / HEART_PULSE_PERIOD * Math.PI * 2) * 0.04 + 1;
    const scale = pulse * (1 + this._heartBump);
    const hcx = PAD + PANEL_PAD + HEART_SIZE / 2;
    ctx.save();
    ctx.translate(hcx, heartRowY);
    ctx.scale(scale, scale);
    this._drawHeartGlyph(ctx);
    ctx.restore();
  },

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
  },

  _applyHeartGlow(ctx) {
    if (this._heartFlash > 0) return this._applyFlashGlow(ctx);
    ctx.shadowColor = 'rgba(255,70,70,0.60)';
    ctx.shadowBlur = 6;
  },

  _applyFlashGlow(ctx) {
    ctx.shadowColor = `rgba(255,80,80,${this._heartFlash * 0.9})`;
    ctx.shadowBlur = 14 * this._heartFlash;
  },

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
  },

  _drawStarRow(ctx, starCoins, starRowY, starStartX) {
    for (let i = 0; i < STAR_COIN_COUNT; i++) this._drawSingleStar(ctx, starCoins[i] === true, i, starStartX, starRowY);
  },

  _drawSingleStar(ctx, filled, i, starStartX, starRowY) {
    const cx = starStartX + i * (STAR_SIZE + STAR_GAP) + STAR_SIZE / 2;
    ctx.save();
    ctx.translate(cx, starRowY);
    ctx.scale(this._starScale(i, filled), this._starScale(i, filled));
    ctx.font = `bold ${STAR_SIZE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this._applyStarStyle(ctx, filled);
    ctx.fillText(filled ? COIN_ICON_FILLED : COIN_ICON_EMPTY, 0, 1);
    ctx.restore();
  },

  _starScale(i, filled) {
    const bump = 1 + this._starBump[i];
    if (!filled) return bump;
    const shimmer = Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1;
    return bump * shimmer;
  },

  _applyStarStyle(ctx, filled) {
    if (filled) return this._applyFilledStarStyle(ctx);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.28;
  },

  _applyFilledStarStyle(ctx) {
    const glow = 0.35 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.15;
    ctx.shadowColor = `rgba(255,215,0,${glow})`;
    ctx.shadowBlur = 7;
    ctx.globalAlpha = 1;
  },

  _drawRightPanel(ctx, gameState) {
    const panel = this._rightPanelRect();
    const inner = this._rightPanelInner(panel);
    drawHudPanel(ctx, panel.x, panel.y, panel.w, panel.h);
    ctx.save();
    this._drawScoreBlock(ctx, panel, inner, Math.round(this._displayScore));
    this._drawGemBlock(ctx, panel, inner, Math.floor(this._displayGems));
    ctx.restore();
  },

  _rightPanelRect() {
    const w = 148;
    return { x: CANVAS_WIDTH - PAD - w, y: PAD, w, h: 56 };
  },

  _rightPanelInner(panel) {
    return { left: panel.x + PANEL_PAD, right: panel.x + panel.w - PANEL_PAD };
  },

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
  },

  _drawScoreValue(ctx, panel, rightX, displayScore) {
    const scoreStr = String(displayScore).padStart(5, '0');
    ctx.font = HUD_FONT;
    ctx.textAlign = 'right';
    ctx.strokeText(scoreStr, rightX, panel.y + PANEL_PAD);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(scoreStr, rightX, panel.y + PANEL_PAD);
  },

  _drawGemBlock(ctx, panel, inner, displayGems) {
    const rowY = panel.y + PANEL_PAD + 22;
    this._drawGemIcon(ctx, inner.left + GEM_SIZE / 2, rowY + GEM_SIZE / 2);
    this._drawGemValue(ctx, inner.right, rowY + GEM_SIZE / 2, displayGems);
  },

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
  },

  _applyGemGlow(ctx) {
    const glowAlpha = 0.40 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.20;
    ctx.shadowColor = `rgba(155,89,255,${glowAlpha})`;
    ctx.shadowBlur = 8;
  },

  _drawGemFallback(ctx) {
    ctx.fillStyle = '#9b59ff';
    ctx.fillRect(-GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
  },

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
  },

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(easeOut(p.life / p.maxLife), 0) * 0.88;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};
