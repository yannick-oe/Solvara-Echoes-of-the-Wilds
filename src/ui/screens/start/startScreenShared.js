import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../core/constants.js';

export const MENU_IDS = ['start', 'character', 'options', 'controls', 'credits'];
export const CX = CANVAS_WIDTH / 2;
export const CY = CANVAS_HEIGHT / 2;
export const TITLE_Y = 66;
export const SUBTITLE_Y = 110;
export const WOOD_W = 420;
export const WOOD_H = 240;
export const WOOD_X = (CANVAS_WIDTH - WOOD_W) / 2;
export const WOOD_Y = 148;
export const FOOTER_Y = WOOD_Y + WOOD_H + 22;
export const PANEL_W = 480;
export const PANEL_H = 380;
export const PANEL_X = (CANVAS_WIDTH - PANEL_W) / 2;
export const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;

/** Creates fireflies. @returns {*} - Resulting value. */
export function createFireflies() {
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
