// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { drawWoodPanel } from '../canvasUtils.js';
import {

  OPTIONS_IDS,
  handleOptionsInput,
  drawOptionsContent,
  drawControlsContent,
} from '../optionsPanel.js';
import { drawBackground, drawTitleBanner, drawVignette } from '../startMenuDeco.js';
import {
  CHARACTER_PROFILES,
  normalizeCharacterId,
  saveSelectedCharacter,
} from '../../config/characterConfig.js';
// #endregion

// #region Constants
const MENU_IDS = ['start', 'character', 'options', 'controls', 'credits'];
const CX            = CANVAS_WIDTH  / 2;
const CY            = CANVAS_HEIGHT / 2;
const TITLE_Y       = 66;
const SUBTITLE_Y    = 110;
const WOOD_W = 420;
const WOOD_H = 240;
const WOOD_X = (CANVAS_WIDTH  - WOOD_W) / 2;
const WOOD_Y = 148;
const FOOTER_Y = WOOD_Y + WOOD_H + 22;
const PANEL_W = 480;
const PANEL_H = 380;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;
// #endregion

// #region Class Definition
export class StartScreen {

  /**
   * Creates a new instance.
   * @param {object} onStart Input parameter.
   */
  constructor(onStart) {
    this._onStart = onStart;
    this._selectedCharacter = 'fox';
    this._reset();
  }

  /**
   * Handles reset.
   */
  _reset() {
    this._started       = false;
    this._selectedIndex = 0;
    this._subScreen     = null;
    this._optionIndex   = 0;
    this._resetInputEdges();
    this._fireflies = this._createFireflies();
    this._lastDrawTime = null;
  }

  /** Handles reset input edges. */
  _resetInputEdges() {
    this._prevUp = false;
    this._prevDown = false;
    this._prevLeft = false;
    this._prevRight = false;
  }

  /** Handles create fireflies. */
  _createFireflies() {
    return Array.from({ length: 12 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: 40 + Math.random() * (CANVAS_HEIGHT - 80),
      vx: (Math.random() - 0.5) * 22,
      vy: -3 - Math.random() * 9,
      size: 0.9 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.55 ? '#c8ff9a' : '#eaffb0',
    }));
  }

  /** Resets the start screen state (selection, sub-panel, fireflies). */
  reset() { this._reset(); }

  /**
   * Returns selected character id.
   */
  getSelectedCharacter() {
    return this._selectedCharacter;
  }

  /**
   * Sets selected character id.
   * @param {string} characterId Input parameter.
   */
  setSelectedCharacter(characterId) {
    this._selectedCharacter = normalizeCharacterId(characterId);
  }

  /**
   * Returns whether a subpanel is currently open.
   */
  isSubPanelOpen() {
    return this._subScreen !== null;
  }

  /**
   * Handles keyboard input in the start menu.
   * @param {object} input
   */
  handleInput(input) {
    if (this._handleSubScreenInput(input)) return;
    this._handleMainMenuInput(input);
  }

  /**
   * Returns true when a sub panel consumed input.
   * @param {object} input Input parameter.
   */
  _handleSubScreenInput(input) {
    if (this._subScreen === null) return false;
    if (this._subScreen === 'options') this._handleOptionsInput(input);
    else if (input.backPressed) this._subScreen = null;
    return true;
  }

  /**
   * Handles menu navigation and activation when no sub panel is open.
   * @param {object} input Input parameter.
   */
  _handleMainMenuInput(input) {
    const upNow = input.up;
    const downNow = input.down;
    const leftNow  = input.left;
    const rightNow = input.right;
    this._handleVerticalInput(upNow, downNow);
    this._handleCharacterInput(leftNow, rightNow);
    this._cacheDirectionEdges(upNow, downNow, leftNow, rightNow);
    if (input.enterPressed || input.jumpPressed) this._activate(MENU_IDS[this._selectedIndex]);
  }

  /**
   * Handles vertical menu input.
   * @param {boolean} upNow Input parameter.
   * @param {boolean} downNow Input parameter.
   */
  _handleVerticalInput(upNow, downNow) {
    if (upNow && !this._prevUp) {
      this._selectedIndex = (this._selectedIndex - 1 + MENU_IDS.length) % MENU_IDS.length;
    }
    if (downNow && !this._prevDown) {
      this._selectedIndex = (this._selectedIndex + 1) % MENU_IDS.length;
    }
  }

  /**
   * Handles cache direction edges.
   * @param {boolean} upNow Input parameter.
   * @param {boolean} downNow Input parameter.
   * @param {boolean} leftNow Input parameter.
   * @param {boolean} rightNow Input parameter.
   */
  _cacheDirectionEdges(upNow, downNow, leftNow, rightNow) {
    this._prevUp = upNow;
    this._prevDown = downNow;
    this._prevLeft = leftNow;
    this._prevRight = rightNow;
  }

  /**
   * Handles left/right switching on character menu row.
   * @param {boolean} leftNow Input parameter.
   * @param {boolean} rightNow Input parameter.
   */
  _handleCharacterInput(leftNow, rightNow) {
    if (MENU_IDS[this._selectedIndex] !== 'character') return;
    const leftEdge  = leftNow  && !this._prevLeft;
    const rightEdge = rightNow && !this._prevRight;
    if (!leftEdge && !rightEdge) return;
    const dir = rightEdge ? 1 : -1;
    this._shiftSelectedCharacter(dir);
  }

  /**
   * Cycles character selection and stores it.
   * @param {number} direction Input parameter.
   */
  _shiftSelectedCharacter(direction) {
    const keys = Object.keys(CHARACTER_PROFILES);
    const current = keys.indexOf(this._selectedCharacter);
    const index = (current + direction + keys.length) % keys.length;
    this._selectedCharacter = keys[index];
    saveSelectedCharacter(this._selectedCharacter);
  }

  /**
   * Handles handle options input.
   * @param {object} input Input parameter.
   */
  _handleOptionsInput(input) { handleOptionsInput(this, input); }

  /**
   * Handles activate.
   * @param {string} id Input parameter.
   */
  _activate(id) {
    const actions = {
      start: () => this._activateStart(),
      character: () => this._shiftSelectedCharacter(1),
      options: () => this._openOptions(),
      controls: () => this._openSubScreen('controls'),
      credits: () => this._openSubScreen('credits'),
    };
    const action = actions[id];
    if (action) action();
  }

  /** Handles activate start action. */
  _activateStart() {
    if (this._started) return;
    this._started = true;
    this._onStart();
  }

  /** Handles open options action. */
  _openOptions() {
    this._subScreen = 'options';
    this._optionIndex = 0;
  }

  /**
   * Handles open subscreen.
   * @param {string} name Input parameter.
   */
  _openSubScreen(name) {
    this._subScreen = name;
  }

  /**
   * Draws the entire start screen including background, menu, and sub-panels.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const now = performance.now() / 1000;
    const dt  = this._getDrawDt(now);
    this._updateFireflies(dt);
    this._drawBackground(ctx);
    this._drawFireflies(ctx, now);
    this._drawVignette(ctx);
    this._drawTitle(ctx, now);
    if (this._subScreen !== null) this._drawSubPanelOverlay(ctx);
    else this._drawMenu(ctx, now);
  }

  /**
   * Computes frame delta time and updates last draw timestamp.
   * @param {number} now Input parameter.
   */
  _getDrawDt(now) {
    const dt = this._lastDrawTime !== null ? Math.min(now - this._lastDrawTime, 0.05) : 0;
    this._lastDrawTime = now;
    return dt;
  }

  /**
   * Advances firefly positions with wrapping.
   * @param {number} dt Input parameter.
   */
  _updateFireflies(dt) {
    for (const ff of this._fireflies) {
      ff.x = ((ff.x + ff.vx * dt) % CANVAS_WIDTH  + CANVAS_WIDTH)  % CANVAS_WIDTH;
      ff.y = ((ff.y + ff.vy * dt) % CANVAS_HEIGHT + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    }
  }

  /**
   * Draws dim overlay and the currently active sub panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanelOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._drawSubPanel(ctx);
  }

  /**
   * Handles draw background.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawBackground(ctx) { drawBackground(ctx); }

  /**
   * Handles draw title.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} now Input parameter.
   */
  _drawTitle(ctx, now) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    this._drawTitleBanner(ctx);
    this._drawMainTitleText(ctx, now);
    this._drawSubtitleText(ctx);
  }

  /**
   * Draws glowing Solvara title text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} now Input parameter.
   */
  _drawMainTitleText(ctx, now) {
    const blur = 12 + Math.sin(now * 2.0) * 4;
    ctx.save();
    ctx.shadowColor = 'rgba(240, 192, 0, 0.85)';
    ctx.shadowBlur  = blur;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 46px serif';
    ctx.fillText('Solvara', CX, TITLE_Y);
    ctx.restore();
  }

  /**
   * Draws subtitle text below the title.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubtitleText(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = '#a8d8a8';
    ctx.font        = '19px serif';
    ctx.fillText('Echoes of the Wilds', CX, SUBTITLE_Y);
    ctx.restore();
  }

  /**
   * Handles draw menu.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} now Input parameter.
   */
  _drawMenu(ctx, now) {
    drawWoodPanel(ctx, WOOD_X, WOOD_Y, WOOD_W, WOOD_H, MENU_IDS.length);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const ZONE_Y = this._menuZoneRows();
    MENU_IDS.forEach((id, i) => this._drawMenuRow(ctx, id, ZONE_Y[i], i === this._selectedIndex));
    this._drawMenuFooter(ctx);
  }

  /**
   * Draws one menu row with optional selection highlight.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} id Input parameter.
   * @param {number} y Input parameter.
   * @param {boolean} selected Input parameter.
   */
  _drawMenuRow(ctx, id, y, selected) {
    const label = this._menuLabel(id, selected);
    if (selected) this._drawSelectedMenuRow(ctx, y);
    ctx.fillStyle = selected ? '#fff4c0' : '#f6e3c3';
    ctx.font      = selected ? 'bold 16px monospace' : '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, CX + 8, y);
  }

  /**
   * Draws selected-row glow bar and pointer marker.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} y Input parameter.
   */
  _drawSelectedMenuRow(ctx, y) {
    const hl = ctx.createLinearGradient(WOOD_X, y, WOOD_X + WOOD_W, y);
    hl.addColorStop(0, 'rgba(20, 10, 4, 0.00)');
    hl.addColorStop(0.12, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(0.88, 'rgba(20, 10, 4, 0.55)');
    hl.addColorStop(1, 'rgba(20, 10, 4, 0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(WOOD_X, y - 16, WOOD_W, 32);
    this._drawMenuPointer(ctx, y);
  }

  /**
   * Draws the left arrow marker for the selected row.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} y Input parameter.
   */
  _drawMenuPointer(ctx, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.6)';
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 13px monospace';
    ctx.textAlign   = 'left';
    ctx.fillText('▶', WOOD_X + 20, y);
    ctx.restore();
  }

  /**
   * Draws menu footer hint text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawMenuFooter(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur  = 4;
    ctx.font        = '12px monospace';
    ctx.fillStyle   = '#d6c7a2';
    ctx.textAlign   = 'center';
    ctx.fillText(t('pressEnter'), CX, FOOTER_Y);
    ctx.restore();
  }

  /**
   * Builds evenly distributed menu row centers.
   */
  _menuZoneRows() {
    const slotH = WOOD_H / MENU_IDS.length;
    const outerCompensation = 4;
    return MENU_IDS.map((_, i) => {
      const baseY = WOOD_Y + slotH * (i + 0.5);
      if (i === 0) return Math.round(baseY + outerCompensation);
      if (i === MENU_IDS.length - 1) return Math.round(baseY - outerCompensation);
      return Math.round(baseY);
    });
  }

  /**
   * Returns display label for one menu row.
   * @param {string} id Input parameter.
   * @param {boolean} selected Input parameter.
   */
  _menuLabel(id, selected) {
    if (id !== 'character') return t(id);
    const profile = CHARACTER_PROFILES[this._selectedCharacter];
    const name = t(profile?.id ?? 'fox');
    const arrows = selected ? '◄  ' : '';
    const tail = selected ? '  ►' : '';
    return `${arrows}${t('character')}: ${name}${tail}`;
  }

  /**
   * Handles draw sub panel.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanel(ctx) {
    drawWoodPanel(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, false);
    this._drawSubPanelHeader(ctx);
    this._drawSubPanelContent(ctx);
    this._drawSubPanelFooter(ctx);
  }

  /**
   * Draws sub panel title header.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanelHeader(ctx) {
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 22px serif';
    ctx.fillText(t(this._subScreen), CX, PANEL_Y + 32);
    ctx.restore();
  }

  /**
   * Draws the active sub panel body content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanelContent(ctx) {
    if (this._subScreen === 'options') this._drawOptionsContent(ctx);
    else if (this._subScreen === 'controls') this._drawControlsContent(ctx);
    else this._drawCreditsContent(ctx);
  }

  /**
   * Draws sub panel footer hint.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawSubPanelFooter(ctx) {
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#c8b090';
    ctx.textAlign = 'center';
    ctx.fillText(t('returnHint'), CX, PANEL_Y + PANEL_H - 20);
  }

  /**
   * Handles draw options content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawOptionsContent(ctx) {
    drawOptionsContent(ctx, this._optionIndex, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, CX);
  }

  /**
   * Handles draw controls content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawControlsContent(ctx) {
    drawControlsContent(ctx, PANEL_X, PANEL_Y, PANEL_W, this._selectedCharacter);
  }

  /**
   * Handles draw credits content.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawCreditsContent(ctx) {
    this._drawCreditsDev(ctx);
    this._drawCreditsDivider(ctx);
    this._drawCreditsSource(ctx, CX - 95, 'Pixel Assets', 'Anismuz');
    this._drawCreditsSource(ctx, CX + 115, 'Music', 'Pascal Belisle');
  }

  /**
   * Draws primary credits block.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawCreditsDev(ctx) {
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Design & Programming', CX, PANEL_Y + 140);
    this._drawCreditName(ctx, 'Yannick', CX, PANEL_Y + 166);
  }

  /**
   * Draws divider line between top and lower credit groups.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawCreditsDivider(ctx) {
    ctx.strokeStyle = 'rgba(59, 38, 21, 0.40)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 120, PANEL_Y + 195);
    ctx.lineTo(PANEL_X + 360, PANEL_Y + 195);
    ctx.stroke();
  }

  /**
   * Draws one credit source label and highlighted name.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} x Input parameter.
   * @param {string} label Input parameter.
   * @param {string} name Input parameter.
   */
  _drawCreditsSource(ctx, x, label, name) {
    ctx.fillStyle = '#f6e3c3';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, PANEL_Y + 230);
    this._drawCreditName(ctx, name, x, PANEL_Y + 256);
  }

  /**
   * Draws highlighted credit name text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} name Input parameter.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   */
  _drawCreditName(ctx, name, x, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(240,192,0,0.45)';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#f0c040';
    ctx.font        = 'bold 14px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(name, x, y);
    ctx.restore();
  }

  /**
   * Handles draw title banner.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawTitleBanner(ctx) { drawTitleBanner(ctx, CX, TITLE_Y); }


  /**
   * Handles draw fireflies.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} now Input parameter.
   */
  _drawFireflies(ctx, now) {
    for (const ff of this._fireflies) {
      const alpha = 0.22 + Math.abs(Math.sin(now * 1.5 + ff.phase)) * 0.48;
      const glow  = 4   + Math.sin(now * 2.3 + ff.phase) * 2.5;
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, alpha);
      ctx.shadowColor = ff.color;
      ctx.shadowBlur  = glow * 3;
      ctx.fillStyle   = ff.color;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Handles draw vignette.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawVignette(ctx) { drawVignette(ctx, CX, CY); }
}
// #endregion