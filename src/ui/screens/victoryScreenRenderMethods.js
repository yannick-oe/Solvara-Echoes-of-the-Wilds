import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { imageCache } from '../../core/imageCache.js';
import { drawWoodPanel } from '../canvasUtils.js';
import { easeOutBack, easeOutQuad, formatTime } from '../victoryParticles.js';
import {
  ATMO_Y, BLOCK_Y, CX, CY, DIV_Y1, DIV_Y2, FONT_HINT, FONT_HINT2, FONT_LABEL,
  FONT_STAR, FONT_TITLE, FONT_VALUE, HINT1_Y, PANEL_H, PANEL_W, PANEL_X, PANEL_Y,
  ROW_H, STAR_CY, T_HINTS_IN, T_STAR_0, T_STAR_DUR, T_STAR_GAP, T_STATS_DUR, T_STATS_IN,
  T_TITLE_DUR,
} from './victoryScreenShared.js';

export const victoryScreenRenderMethods = {
  draw(ctx) {
    if (!this._data) return this._drawEmptyState(ctx);
    this._drawBackground(ctx);
    this._drawParticles(ctx);
    this._drawVignette(ctx);
    this._drawTitle(ctx);
    this._drawStars(ctx);
    this._drawStatsPanel(ctx);
    this._drawHints(ctx);
  },

  _drawEmptyState(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#2a4a62');
    sky.addColorStop(1, '#7aac8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  _drawBackground(ctx) {
    this._drawSkyGradient(ctx);
    this._drawBackgroundBackLayer(ctx);
    this._drawBackgroundMiddleLayer(ctx);
    this._drawSunGlow(ctx);
  },

  _drawSkyGradient(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#2a4a62');
    sky.addColorStop(0.5, '#5a8aa4');
    sky.addColorStop(1, '#7aac8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  _drawBackgroundBackLayer(ctx) {
    const bgBack = imageCache.get('BG_FOREST_BACK');
    if (!bgBack) return;
    const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
    const drawW = Math.round(bgBack.naturalWidth * scale);
    ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
  },

  _drawBackgroundMiddleLayer(ctx) {
    const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
    if (!bgMiddle) return;
    const drawH = Math.round(CANVAS_HEIGHT * 0.55);
    const scale = drawH / bgMiddle.naturalHeight;
    const drawW = Math.round(bgMiddle.naturalWidth * scale);
    const drawY = CANVAS_HEIGHT - drawH;
    for (let x = 0; x < CANVAS_WIDTH; x += drawW) ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
  },

  _drawSunGlow(ctx) {
    const sun = ctx.createRadialGradient(CX, -20, 0, CX, 60, 380);
    sun.addColorStop(0, 'rgba(255,235,130,0.22)');
    sun.addColorStop(0.55, 'rgba(255,210,80,0.08)');
    sun.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  _drawVignette(ctx) {
    const grd = ctx.createRadialGradient(CX, CY, CANVAS_HEIGHT * 0.20, CX, CY, CANVAS_HEIGHT * 0.82);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  _drawTitle(ctx) {
    const tEased = easeOutQuad(Math.min(this._time / T_TITLE_DUR, 1.0));
    const label = t('levelComplete');
    ctx.save();
    this._setupTitleTransform(ctx, tEased);
    this._drawTitleStroke(ctx, label);
    this._drawTitleFill(ctx, label);
    ctx.restore();
  },

  _setupTitleTransform(ctx, tEased) {
    ctx.globalAlpha = tEased;
    ctx.translate(CX, 118);
    ctx.scale(0.92 + tEased * 0.08, 0.92 + tEased * 0.08);
    ctx.shadowColor = `rgba(255,228,60,${0.72 + Math.sin(this._time * 1.6) * 0.12})`;
    ctx.shadowBlur = 36;
    ctx.font = FONT_TITLE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
  },

  _drawTitleStroke(ctx, label) {
    ctx.strokeStyle = 'rgba(50,25,0,0.75)';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText(label, 0, 0);
  },

  _drawTitleFill(ctx, label) {
    const grad = ctx.createLinearGradient(0, -52, 0, 0);
    grad.addColorStop(0, '#fffce8');
    grad.addColorStop(0.35, '#ffe44d');
    grad.addColorStop(1, '#d48a00');
    ctx.fillStyle = grad;
    ctx.fillText(label, 0, 0);
  },

  _drawStars(ctx) {
    this._drawStarsBloom(ctx);
    for (let i = 0; i < 3; i++) this._drawSingleStar(ctx, i);
  },

  _drawStarsBloom(ctx) {
    const bloom = ctx.createRadialGradient(CX, STAR_CY, 0, CX, STAR_CY, 170);
    bloom.addColorStop(0, 'rgba(255,220,60,0.16)');
    bloom.addColorStop(0.55, 'rgba(255,185,40,0.06)');
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  _drawSingleStar(ctx, i) {
    const tStart = T_STAR_0 + i * T_STAR_GAP;
    const tRaw = Math.max(0, Math.min((this._time - tStart) / T_STAR_DUR, 1.0));
    if (tRaw <= 0) return;
    const filled = this._data.starCoins[i] === true;
    const tEased = filled ? easeOutBack(tRaw) : easeOutQuad(tRaw);
    const alpha = Math.min(tRaw * 2.8, 1.0);
    this._drawStarGlyph(ctx, i, Math.round(CX + (i - 1) * 90), alpha, tEased, filled);
  },

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
  },

  _drawFilledStar(ctx, i) {
    ctx.shadowColor = `rgba(255,220,0,${0.55 + Math.sin(this._time * 2.0 + i * 0.5) * 0.18})`;
    ctx.shadowBlur = 28;
    ctx.fillText('⭐', 0, 0);
  },

  _drawEmptyStar(ctx, alpha) {
    ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = '#b0a080';
    ctx.fillText('☆', 0, 0);
  },

  _drawStatsPanel(ctx) {
    const elapsed = this._time - T_STATS_IN;
    if (elapsed <= 0) return;
    ctx.save();
    ctx.globalAlpha = easeOutQuad(Math.min(elapsed / T_STATS_DUR, 1.0));
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    this._drawStatsTopDivider(ctx);
    this._drawStatsRows(ctx, this._buildStatsRows());
    this._drawStatsBottomDivider(ctx);
    ctx.restore();
  },

  _buildStatsRows() {
    return [
      [t('livesRemaining'), `×${this._data.hearts}`],
      [t('score'), String(this._data.score).padStart(5, '0')],
      [t('gems'), `×${this._data.gems}`],
      [t('time'), formatTime(this._levelTime)],
    ];
  },

  _drawStatsTopDivider(ctx) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14, DIV_Y1);
    ctx.lineTo(PANEL_X + PANEL_W - 14, DIV_Y1);
    ctx.stroke();
  },

  _drawStatsBottomDivider(ctx) {
    ctx.strokeStyle = 'rgba(220,175,90,0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 14, DIV_Y2);
    ctx.lineTo(PANEL_X + PANEL_W - 14, DIV_Y2);
    ctx.stroke();
  },

  _drawStatsRows(ctx, rows) {
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows.length; i++) this._drawStatsRow(ctx, rows[i], BLOCK_Y + i * ROW_H);
  },

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
  },

  _drawHints(ctx) {
    const elapsed = this._time - T_HINTS_IN;
    if (elapsed <= 0) return;
    const fadeIn = easeOutQuad(Math.min(elapsed / 0.4, 1.0));
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    this._drawPrimaryHint(ctx, fadeIn);
    this._drawMenuHint(ctx, fadeIn);
    this._drawAtmoHint(ctx, fadeIn);
    ctx.restore();
  },

  _drawPrimaryHint(ctx, fadeIn) {
    const blink = 0.62 + Math.sin(this._hintBlink * 2.2) * 0.38;
    ctx.globalAlpha = fadeIn * blink;
    ctx.font = FONT_HINT;
    ctx.strokeStyle = 'rgba(30,15,3,0.72)';
    ctx.lineWidth = 3;
    ctx.strokeText(t('continueHint'), CX, HINT1_Y);
    ctx.fillStyle = '#fff8d8';
    ctx.fillText(t('continueHint'), CX, HINT1_Y);
  },

  _drawMenuHint(ctx, fadeIn) {
    ctx.globalAlpha = fadeIn * 0.45;
    ctx.font = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeText(t('menuHint'), CX, HINT1_Y + 16);
    ctx.fillStyle = '#c8aa70';
    ctx.fillText(t('menuHint'), CX, HINT1_Y + 16);
  },

  _drawAtmoHint(ctx, fadeIn) {
    const atmoPulse = 0.35 + Math.sin(this._time * 0.85) * 0.14;
    ctx.globalAlpha = fadeIn * atmoPulse;
    ctx.font = FONT_HINT2;
    ctx.strokeStyle = 'rgba(20,10,2,0.45)';
    ctx.strokeText(t('nextPathAwaits'), CX, ATMO_Y);
    ctx.fillStyle = '#a89258';
    ctx.fillText(t('nextPathAwaits'), CX, ATMO_Y);
  },

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const lifeF = p.life / p.maxLife;
      const a = p.baseA * this._particleAlpha(lifeF);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.r * 3.0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  _particleAlpha(lifeF) {
    if (lifeF < 0.25) return lifeF / 0.25;
    if (lifeF > 0.85) return (1 - lifeF) / 0.15;
    return 1.0;
  },
};
