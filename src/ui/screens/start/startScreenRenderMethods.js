// #region Imports
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../core/constants.js';
import { t } from '../../../core/localization.js';
import {
  CHARACTER_PROFILES,
} from '../../../config/characterConfig.js';
import { drawWoodPanel } from '../../shared/canvasUtils.js';
import { drawControlsContent, drawOptionsContent } from '../../shared/optionsPanel.js';
import { drawBackground, drawTitleBanner, drawVignette } from '../../shared/startMenuDeco.js';
import {
  CX, CY, FOOTER_Y, MENU_IDS, PANEL_H, PANEL_W, PANEL_X, PANEL_Y,
  SUBTITLE_Y, TITLE_Y, WOOD_H, WOOD_W, WOOD_X, WOOD_Y,
} from './startScreenShared.js';

// #endregion
// #region Render Methods
export const startScreenRenderMethods = {
/** Handles draw. @param {*} ctx - Ctx value. @returns {*} - Resulting value. */
  draw(ctx) {
    const now = performance.now() / 1000;
    const dt = this._getDrawDt(now);
    this._updateFireflies(dt);
    this._drawBackground(ctx);
    this._drawFireflies(ctx, now);
    this._drawVignette(ctx);
    this._drawTitle(ctx, now);
    if (this._subScreen !== null) return this._drawSubPanelOverlay(ctx);
    this._drawMenu(ctx);
  },

/** Gets draw Dt. @param {*} now - Now value. @returns {*} - Resulting value. */
  _getDrawDt(now) {
    const dt = this._lastDrawTime !== null ? Math.min(now - this._lastDrawTime, 0.05) : 0;
    this._lastDrawTime = now;
    return dt;
  },

/** Updates fireflies. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _updateFireflies(dt) {
    for (const ff of this._fireflies) {
      ff.x = ((ff.x + ff.vx * dt) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      ff.y = ((ff.y + ff.vy * dt) % CANVAS_HEIGHT + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    }
  },

/** Draws sub Panel Overlay. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanelOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._drawSubPanel(ctx);
  },

/** Draws background. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawBackground(ctx) {
    drawBackground(ctx);
  },

/** Draws title. @param {*} ctx - Ctx value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawTitle(ctx, now) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this._drawTitleBanner(ctx);
    this._drawMainTitleText(ctx, now);
    this._drawSubtitleText(ctx);
  },

/** Draws main Title Text. @param {*} ctx - Ctx value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawMainTitleText(ctx, now) {
    const blur = 12 + Math.sin(now * 2.0) * 4;
    ctx.save();
    ctx.shadowColor = 'rgba(240, 192, 0, 0.85)';
    ctx.shadowBlur = blur;
    ctx.fillStyle = '#f0c040';
    ctx.font = 'bold 46px serif';
    ctx.fillText('Solvara', CX, TITLE_Y);
    ctx.restore();
  },

/** Draws subtitle Text. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubtitleText(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#a8d8a8';
    ctx.font = '19px serif';
    ctx.fillText('Echoes of the Wilds', CX, SUBTITLE_Y);
    ctx.restore();
  },

/** Draws menu. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawMenu(ctx) {
    drawWoodPanel(ctx, WOOD_X, WOOD_Y, WOOD_W, WOOD_H, MENU_IDS.length);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rows = this._menuZoneRows();
    MENU_IDS.forEach((id, i) => this._drawMenuRow(ctx, id, rows[i], i === this._selectedIndex));
    this._drawMenuFooter(ctx);
  },

/** Draws menu Row. @param {*} ctx - Ctx value. @param {*} id - Id value. @param {*} y - Y value. @param {*} selected - Selected value. @returns {void} - Nothing. */
  _drawMenuRow(ctx, id, y, selected) {
    const label = this._menuLabel(id, selected);
    if (selected) this._drawSelectedMenuRow(ctx, y);
    ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
    ctx.font = selected ? 'bold 16px monospace' : '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, CX + 8, y);
  },

/** Draws selected Menu Row. @param {*} ctx - Ctx value. @param {*} y - Y value. @returns {void} - Nothing. */
  _drawSelectedMenuRow(ctx, y) {
    const hl = ctx.createLinearGradient(WOOD_X, y, WOOD_X + WOOD_W, y);
    hl.addColorStop(0, 'rgba(20, 10, 4, 0.00)');
    hl.addColorStop(0.12, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(0.88, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(1, 'rgba(20, 10, 4, 0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(WOOD_X, y - 16, WOOD_W, 32);
    this._drawMenuPointer(ctx, y);
  },

/** Draws menu Pointer. @param {*} ctx - Ctx value. @param {*} y - Y value. @returns {void} - Nothing. */
  _drawMenuPointer(ctx, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#f0c040';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('▶', WOOD_X + 20, y);
    ctx.restore();
  },

/** Draws menu Footer. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawMenuFooter(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 4;
    ctx.font = '12px monospace';
    ctx.fillStyle = '#d6c7a2';
    ctx.textAlign = 'center';
    ctx.fillText(t('pressEnter'), CX, FOOTER_Y);
    ctx.restore();
  },

/** Handles menu Zone Rows. @returns {*} - Resulting value. */
  _menuZoneRows() {
    const slotH = WOOD_H / MENU_IDS.length;
    return MENU_IDS.map((_, i) => this._menuRowY(slotH, i));
  },

/** Handles menu Row Y. @param {*} slotH - Slot H value. @param {*} i - I value. @returns {*} - Resulting value. */
  _menuRowY(slotH, i) {
    const baseY = WOOD_Y + slotH * (i + 0.5);
    if (i === 0) return Math.round(baseY + 4);
    if (i === MENU_IDS.length - 1) return Math.round(baseY - 4);
    return Math.round(baseY);
  },

/** Handles menu Label. @param {*} id - Id value. @param {*} selected - Selected value. @returns {*} - Resulting value. */
  _menuLabel(id, selected) {
    if (id !== 'character') return t(id);
    const profile = CHARACTER_PROFILES[this._selectedCharacter];
    const name = t(profile?.id ?? 'fox');
    const arrows = selected ? '◄  ' : '';
    const tail = selected ? '  ►' : '';
    return `${arrows}${t('character')}: ${name}${tail}`;
  },

/** Draws sub Panel. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanel(ctx) {
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);
    this._drawSubPanelHeader(ctx);
    this._drawSubPanelContent(ctx);
    this._drawSubPanelFooter(ctx);
  },

/** Draws sub Panel Header. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanelHeader(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#f0c040';
    ctx.font = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, PANEL_Y + 32);
    ctx.restore();
  },

/** Draws sub Panel Content. @param {*} ctx - Ctx value. @returns {*} - Resulting value. */
  _drawSubPanelContent(ctx) {
    if (this._subScreen === 'options') return this._drawOptionsContent(ctx);
    if (this._subScreen === 'controls') return this._drawControlsContent(ctx);
    this._drawCreditsContent(ctx);
  },

/** Draws sub Panel Footer. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanelFooter(ctx) {
    ctx.font = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, PANEL_Y + PANEL_H - 20);
  },

/** Draws options Content. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawOptionsContent(ctx) {
    drawOptionsContent(ctx, this._optionIndex, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, CX);
  },

/** Draws controls Content. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawControlsContent(ctx) {
    drawControlsContent(ctx, PANEL_X, PANEL_Y, PANEL_W, this._selectedCharacter);
  },

/** Draws credits Content. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawCreditsContent(ctx) {
    this._drawCreditsDev(ctx);
    this._drawCreditsDivider(ctx);
    this._drawCreditsSource(ctx, CX - 95, 'Pixel Assets', 'Anismuz');
    this._drawCreditsSource(ctx, CX + 115, 'Music', 'Pascal Belisle');
  },

/** Draws credits Dev. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawCreditsDev(ctx) {
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f6e3c3';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Design & Programming', CX, PANEL_Y + 140);
    this._drawCreditName(ctx, 'Yannick', CX, PANEL_Y + 166);
  },

/** Draws credits Divider. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawCreditsDivider(ctx) {
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 120, PANEL_Y + 195);
    ctx.lineTo(PANEL_X + 360, PANEL_Y + 195);
    ctx.stroke();
  },

/** Draws credits Source. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} label - Label value. @param {*} name - Name value. @returns {void} - Nothing. */
  _drawCreditsSource(ctx, x, label, name) {
    ctx.fillStyle = '#f6e3c3';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, PANEL_Y + 230);
    this._drawCreditName(ctx, name, x, PANEL_Y + 256);
  },

/** Draws credit Name. @param {*} ctx - Ctx value. @param {*} name - Name value. @param {*} x - X value. @param {*} y - Y value. @returns {void} - Nothing. */
  _drawCreditName(ctx, name, x, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.45)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#f0c040';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y);
    ctx.restore();
  },

/** Draws title Banner. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawTitleBanner(ctx) {
    drawTitleBanner(ctx, CX, TITLE_Y);
  },

/** Draws fireflies. @param {*} ctx - Ctx value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawFireflies(ctx, now) {
    for (const ff of this._fireflies) this._drawFirefly(ctx, ff, now);
  },

/** Draws vignette. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawVignette(ctx) {
    drawVignette(ctx, CX, CY);
  },

/** Draws firefly. @param {*} ctx - Ctx value. @param {*} ff - Ff value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawFirefly(ctx, ff, now) {
    const alpha = 0.22 + Math.abs(Math.sin(now * 1.5 + ff.phase)) * 0.48;
    const glow = 4 + Math.sin(now * 2.3 + ff.phase) * 2.5;
    ctx.save();
    ctx.globalAlpha = Math.min(0.75, alpha);
    ctx.shadowColor = ff.color;
    ctx.shadowBlur = glow * 3;
    ctx.fillStyle = ff.color;
    ctx.beginPath();
    ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
// #endregion