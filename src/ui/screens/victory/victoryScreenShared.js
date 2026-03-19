// #region Imports
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../core/constants.js';

// #endregion
// #region Shared Helpers
const EFFECT_SCALE = _isCoarsePointer() ? 0.72 : 1;

export const CX = CANVAS_WIDTH / 2;
export const CY = CANVAS_HEIGHT / 2;
export const STAR_CY = 176;
export const PANEL_W = 280;
export const PANEL_H = 124;
export const PANEL_X = CX - PANEL_W / 2;
export const PANEL_Y = 236;
export const BLOCK_Y = 262;
export const ROW_H = 24;
export const DIV_Y1 = BLOCK_Y - 12;
export const DIV_Y2 = BLOCK_Y + 3 * ROW_H + 12;
export const HINT1_Y = 392;
export const ATMO_Y = 428;
export const FONT_TITLE = 'bold 52px serif';
export const FONT_LABEL = 'bold 12px monospace';
export const FONT_VALUE = 'bold 13px monospace';
export const FONT_STAR = '58px sans-serif';
export const FONT_HINT = '13px monospace';
export const FONT_HINT2 = '11px monospace';
export const T_TITLE_DUR = 0.55;
export const T_STAR_0 = 0.70;
export const T_STAR_GAP = 0.22;
export const T_STAR_DUR = 0.30;
export const T_STATS_IN = T_STAR_0 + 3 * T_STAR_GAP + T_STAR_DUR + 0.20;
export const T_STATS_DUR = 0.35;
export const T_HINTS_IN = T_STATS_IN + T_STATS_DUR + 0.10;
export const ATMO_POOL = Math.round(55 * EFFECT_SCALE);
export const ATMO_RATE = _isCoarsePointer() ? 0.18 : 0.14;
export const SPARK_MAX = Math.max(8, Math.round(12 * EFFECT_SCALE));

/** Checks whether coarse Pointer. @returns {boolean} - Whether the check passes. */
function _isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}
// #endregion
