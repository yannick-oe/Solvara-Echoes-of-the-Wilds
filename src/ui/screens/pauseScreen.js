// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { drawWoodPanel } from '../shared/canvasUtils.js';
import {

  OPTIONS_IDS,
  handleOptionsInput,
  drawOptionsContent,
  drawControlsContent,
} from '../shared/optionsPanel.js';
// #endregion

// #region Constants
const PANEL_W = 420;
const PANEL_H = 370;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;
const CX      = CANVAS_WIDTH  / 2;
const SUB_W = 480;
const SUB_H = 380;
const SUB_X = (CANVAS_WIDTH  - SUB_W) / 2;
const SUB_Y = (CANVAS_HEIGHT - SUB_H) / 2;
const PAUSE_ITEMS = ['continue', 'restartLevel', 'options', 'controls', 'mainMenu'];
const ITEM_ZONE_H = 60;
const TITLE_Y     = PANEL_Y + 35;
const TITLE_SEP_Y = PANEL_Y + 58;
const ZONE_Y = PAUSE_ITEMS.map((_, i) =>
  Math.round(TITLE_SEP_Y + ITEM_ZONE_H * i + ITEM_ZONE_H / 2));
// #endregion

// #region Class Definition
export class PauseScreen {

/** Creates a new instance. @param {*} callbacks - Callback collection. @returns {void} - Nothing. */
  constructor(callbacks) {
    this._onResume      = callbacks.onResume;
    this._onRestart     = callbacks.onRestart;
    this._onBackToStart = callbacks.onBackToStart;
    this._getSelectedCharacter = callbacks.getSelectedCharacter ?? (() => 'fox');
    this._reset();
  }

/** Handles reset. @returns {void} - Nothing. */
  _reset() {
    this._selectedIndex = 0;
    this._subScreen     = null;
    this._optionIndex   = 0;
    this._prevUp    = false;
    this._prevDown  = false;
    this._prevLeft  = false;
    this._prevRight = false;
  }

/** Handles reset. @returns {void} - Nothing. */
  reset() { this._reset(); }

/** Checks whether sub Panel Open. @returns {boolean} - Whether the check passes. */
  isSubPanelOpen() {
    return this._subScreen !== null;
  }

/** Handles input. @param {*} input - Current input state. @returns {*} - Resulting value. */
  handleInput(input) {
    if (this._handleSubScreenInput(input)) return;
    if (input.pausePressed) return this._onResume();
    this._handleMainMenuInput(input);
  }

/** Handles sub Screen Input. @param {*} input - Current input state. @returns {*} - Resulting value. */
  _handleSubScreenInput(input) {
    if (this._subScreen === 'options') return this._handleOptionsSubInput(input);
    if (this._subScreen === 'controls') return this._handleControlsSubInput(input);
    return false;
  }

/** Handles options Sub Input. @param {*} input - Current input state. @returns {boolean} - Whether the check passes. */
  _handleOptionsSubInput(input) {
    if (input.pausePressed) { this._subScreen = null; return true; }
    this._handleOptionsInput(input);
    return true;
  }

/** Handles controls Sub Input. @param {*} input - Current input state. @returns {boolean} - Whether the check passes. */
  _handleControlsSubInput(input) {
    if (input.backPressed || input.pausePressed) this._subScreen = null;
    return true;
  }

/** Handles main Menu Input. @param {*} input - Current input state. @returns {void} - Nothing. */
  _handleMainMenuInput(input) {
    const upNow   = input.up;
    const downNow = input.down;
    if (upNow && !this._prevUp) {
      this._selectedIndex =
        (this._selectedIndex - 1 + PAUSE_ITEMS.length) % PAUSE_ITEMS.length;
    }
    if (downNow && !this._prevDown) {
      this._selectedIndex = (this._selectedIndex + 1) % PAUSE_ITEMS.length;
    }
    this._prevUp   = upNow;
    this._prevDown = downNow;
    if (input.jumpPressed || input.enterPressed) this._activate(PAUSE_ITEMS[this._selectedIndex]);
  }

/** Handles options Input. @param {*} input - Current input state. @returns {void} - Nothing. */
  _handleOptionsInput(input) { handleOptionsInput(this, input); }

/** Handles activate. @param {*} item - Item value. @returns {*} - Resulting value. */
  _activate(item) {
    if (item === 'continue') return this._onResume();
    if (item === 'restartLevel') return this._onRestart();
    if (item === 'mainMenu') return this._onBackToStart();
    this._openSubScreen(item);
  }

/** Handles open Sub Screen. @param {*} item - Item value. @returns {void} - Nothing. */
  _openSubScreen(item) {
    if (item === 'options') {
      this._subScreen = 'options';
      this._optionIndex = 0;
      return;
    }
    if (item === 'controls') this._subScreen = 'controls';
  }

/** Handles draw. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  draw(ctx) {
    const now = performance.now() / 1000;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (this._subScreen !== null) {
      this._drawSubPanel(ctx);
    } else {
      this._drawMainMenu(ctx, now);
    }
  }

/** Draws main Menu. @param {*} ctx - Ctx value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawMainMenu(ctx, now) {
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);
    this._drawPauseMenuTitle(ctx, now);
    this._drawPauseMenuSeparators(ctx);
    PAUSE_ITEMS.forEach((id, i) => this._drawPauseMenuRow(ctx, id, ZONE_Y[i], i === this._selectedIndex));
  }

/** Draws pause Menu Title. @param {*} ctx - Ctx value. @param {*} now - Now value. @returns {void} - Nothing. */
  _drawPauseMenuTitle(ctx, now) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.90)';
    ctx.shadowBlur  = 14 + Math.sin(now * 1.8) * 4;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 32px serif';
    ctx.fillText('PAUSE', CX, TITLE_Y);
    ctx.restore();
  }

/** Draws pause Menu Separators. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawPauseMenuSeparators(ctx) {
    this._drawPauseTitleSeparator(ctx);
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.20)';
    ctx.lineWidth   = 1;
    for (let i = 1; i < PAUSE_ITEMS.length; i++) this._drawPauseRowSeparator(ctx, i);
  }

/** Draws pause Title Separator. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawPauseTitleSeparator(ctx) {
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.65)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 12, TITLE_SEP_Y);
    ctx.lineTo(PANEL_X + PANEL_W - 12, TITLE_SEP_Y);
    ctx.stroke();
  }

/** Draws pause Row Separator. @param {*} ctx - Ctx value. @param {*} i - I value. @returns {void} - Nothing. */
  _drawPauseRowSeparator(ctx, i) {
    const sy = TITLE_SEP_Y + ITEM_ZONE_H * i;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 8, sy);
    ctx.lineTo(PANEL_X + PANEL_W - 8, sy);
    ctx.stroke();
  }

/** Draws pause Menu Row. @param {*} ctx - Ctx value. @param {*} id - Id value. @param {*} y - Y value. @param {*} selected - Selected value. @returns {void} - Nothing. */
  _drawPauseMenuRow(ctx, id, y, selected) {
    if (selected) this._drawPauseSelectedRow(ctx, y);
    ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
    ctx.font      = selected ? 'bold 16px monospace' : '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t(id), CX, y);
  }

/** Draws pause Selected Row. @param {*} ctx - Ctx value. @param {*} y - Y value. @returns {void} - Nothing. */
  _drawPauseSelectedRow(ctx, y) {
    const hl = ctx.createLinearGradient(PANEL_X, y, PANEL_X + PANEL_W, y);
    hl.addColorStop(0, 'rgba(20, 10, 4, 0.00)');
    hl.addColorStop(0.10, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(0.90, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(1, 'rgba(20, 10, 4, 0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(PANEL_X, y - 17, PANEL_W, 34);
    this._drawPausePointer(ctx, y);
  }

/** Draws pause Pointer. @param {*} ctx - Ctx value. @param {*} y - Y value. @returns {void} - Nothing. */
  _drawPausePointer(ctx, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.55)';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 13px monospace';
    ctx.textAlign   = 'left';
    ctx.fillText('▶', PANEL_X + 18, y);
    ctx.restore();
  }

/** Draws sub Panel. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanel(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawWoodPanel(ctx, SUB_X, SUB_Y, SUB_W, SUB_H, false);
    this._drawSubPanelHeader(ctx);
    if (this._subScreen === 'options') this._drawOptionsContent(ctx);
    else this._drawControlsContent(ctx);
    this._drawSubPanelFooter(ctx);
  }

/** Draws sub Panel Header. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanelHeader(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, SUB_Y + 32);
    ctx.restore();
  }

/** Draws sub Panel Footer. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawSubPanelFooter(ctx) {
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, SUB_Y + SUB_H - 20);
  }

/** Draws options Content. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawOptionsContent(ctx) {
    drawOptionsContent(ctx, this._optionIndex, SUB_X, SUB_Y, SUB_W, SUB_H, CX);
  }

/** Draws controls Content. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
  _drawControlsContent(ctx) {
    drawControlsContent(ctx, SUB_X, SUB_Y, SUB_W, this._getSelectedCharacter());
  }
}
// #endregion
