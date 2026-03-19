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

  /**
   * Creates a new instance.
   * @param {object} callbacks Input parameter.
   */
  constructor(callbacks) {
    this._onResume      = callbacks.onResume;
    this._onRestart     = callbacks.onRestart;
    this._onBackToStart = callbacks.onBackToStart;
    this._getSelectedCharacter = callbacks.getSelectedCharacter ?? (() => 'fox');
    this._reset();
  }

  /**
   * Handles reset.
   */
  _reset() {
    this._selectedIndex = 0;
    this._subScreen     = null;
    this._optionIndex   = 0;
    this._prevUp    = false;
    this._prevDown  = false;
    this._prevLeft  = false;
    this._prevRight = false;
  }

  /** Resets the pause screen state. */
  reset() { this._reset(); }

  /**
   * Returns whether a subpanel is currently open.
   */
  isSubPanelOpen() {
    return this._subScreen !== null;
  }

  /**
   * Handles handle input.
   * @param {object} input Input parameter.
   */
  handleInput(input) {
    if (this._handleSubScreenInput(input)) return;
    if (input.pausePressed) return this._onResume();
    this._handleMainMenuInput(input);
  }

  /**
   * Handles input while a pause subpanel is open.
   * @param {object} input Input parameter.
   */
  _handleSubScreenInput(input) {
    if (this._subScreen === 'options') return this._handleOptionsSubInput(input);
    if (this._subScreen === 'controls') return this._handleControlsSubInput(input);
    return false;
  }

  /**
   * Handles options subpanel input and returns consumed state.
   * @param {object} input Input parameter.
   */
  _handleOptionsSubInput(input) {
    if (input.pausePressed) { this._subScreen = null; return true; }
    this._handleOptionsInput(input);
    return true;
  }

  /**
   * Handles controls subpanel input and returns consumed state.
   * @param {object} input Input parameter.
   */
  _handleControlsSubInput(input) {
    if (input.backPressed || input.pausePressed) this._subScreen = null;
    return true;
  }

  /**
   * Handles pause menu navigation and activation.
   * @param {object} input Input parameter.
   */
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

  /**
   * Handles handle options input.
   * @param {object} input Input parameter.
   */
  _handleOptionsInput(input) { handleOptionsInput(this, input); }

  /**
   * Handles activate.
   * @param {object} item Input parameter.
   */
  _activate(item) {
    if (item === 'continue') return this._onResume();
    if (item === 'restartLevel') return this._onRestart();
    if (item === 'mainMenu') return this._onBackToStart();
    this._openSubScreen(item);
  }

  /**
   * Opens a pause sub screen when selected from menu.
   * @param {string} item Input parameter.
   */
  _openSubScreen(item) {
    if (item === 'options') {
      this._subScreen = 'options';
      this._optionIndex = 0;
      return;
    }
    if (item === 'controls') this._subScreen = 'controls';
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
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

  /**
   * Handles draw main menu.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} now Input parameter.
   */
  _drawMainMenu(ctx, now) {
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);
    this._drawPauseMenuTitle(ctx, now);
    this._drawPauseMenuSeparators(ctx);
    PAUSE_ITEMS.forEach((id, i) => this._drawPauseMenuRow(ctx, id, ZONE_Y[i], i === this._selectedIndex));
  }

  /**
   * Draws pause menu title text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} now Input parameter.
   */
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

  /**
   * Draws title separator and row separators.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawPauseMenuSeparators(ctx) {
    this._drawPauseTitleSeparator(ctx);
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.20)';
    ctx.lineWidth   = 1;
    for (let i = 1; i < PAUSE_ITEMS.length; i++) this._drawPauseRowSeparator(ctx, i);
  }

  /**
   * Draws main title separator line.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawPauseTitleSeparator(ctx) {
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.65)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 12, TITLE_SEP_Y);
    ctx.lineTo(PANEL_X + PANEL_W - 12, TITLE_SEP_Y);
    ctx.stroke();
  }

  /**
   * Draws one menu row separator.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} i Input parameter.
   */
  _drawPauseRowSeparator(ctx, i) {
    const sy = TITLE_SEP_Y + ITEM_ZONE_H * i;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 8, sy);
    ctx.lineTo(PANEL_X + PANEL_W - 8, sy);
    ctx.stroke();
  }

  /**
   * Draws one pause menu row.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} id Input parameter.
   * @param {number} y Input parameter.
   * @param {boolean} selected Input parameter.
   */
  _drawPauseMenuRow(ctx, id, y, selected) {
    if (selected) this._drawPauseSelectedRow(ctx, y);
    ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
    ctx.font      = selected ? 'bold 16px monospace' : '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t(id), CX, y);
  }

  /**
   * Draws selected row background and pointer marker.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} y Input parameter.
   */
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

  /**
   * Draws selected-row pointer glyph.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} y Input parameter.
   */
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

  /**
   * Handles draw sub panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanel(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawWoodPanel(ctx, SUB_X, SUB_Y, SUB_W, SUB_H, false);
    this._drawSubPanelHeader(ctx);
    if (this._subScreen === 'options') this._drawOptionsContent(ctx);
    else this._drawControlsContent(ctx);
    this._drawSubPanelFooter(ctx);
  }

  /**
   * Draws pause sub panel header text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
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

  /**
   * Draws pause sub panel footer hint.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanelFooter(ctx) {
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, SUB_Y + SUB_H - 20);
  }

  /**
   * Handles draw options content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawOptionsContent(ctx) {
    drawOptionsContent(ctx, this._optionIndex, SUB_X, SUB_Y, SUB_W, SUB_H, CX);
  }

  /**
   * Handles draw controls content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawControlsContent(ctx) {
    drawControlsContent(ctx, SUB_X, SUB_Y, SUB_W, this._getSelectedCharacter());
  }
}
// #endregion
