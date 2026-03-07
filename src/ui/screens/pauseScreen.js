import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';

const PANEL_W = 400;
const PANEL_H = 320;
const PANEL_X = (CANVAS_WIDTH  - PANEL_W) / 2;
const PANEL_Y = (CANVAS_HEIGHT - PANEL_H) / 2;

/** Steuerbelegung die im Pause-Overlay angezeigt wird. */
const CONTROLS = [
  ['Bewegen',     'A / D  oder  ← →'],
  ['Springen',    'Space'],
  ['Ducken',      'S  oder  ↓'],
  ['Hochschauen', 'W  oder  ↑'],
  ['Pause',       'ESC'],
];

export class PauseScreen {
  /**
   * Zeichnet das Pause-Overlay auf den bestehenden (eingefrorenen) Spielhintergrund.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // --- Halb-transparenter Verdunkelungs-Overlay ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Panel-Hintergrund ---
    ctx.fillStyle = '#0e1a12';
    ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    // Panel-Rahmen
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 2;
    ctx.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // --- Titel ---
    ctx.fillStyle = '#f0c040';
    ctx.font      = 'bold 32px serif';
    ctx.fillText('PAUSE', CANVAS_WIDTH / 2, PANEL_Y + 38);

    // Trennlinie unter Titel
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_X + 20, PANEL_Y + 62);
    ctx.lineTo(PANEL_X + PANEL_W - 20, PANEL_Y + 62);
    ctx.stroke();

    // --- Steuerungsübersicht ---
    ctx.font      = 'bold 13px monospace';
    ctx.fillStyle = '#a8d8a8';
    ctx.fillText('STEUERUNG', CANVAS_WIDTH / 2, PANEL_Y + 84);

    const rowStart = PANEL_Y + 110;
    const rowStep  = 30;
    const labelX   = PANEL_X + 28;
    const valueX   = PANEL_X + PANEL_W - 28;

    ctx.font = '13px monospace';
    CONTROLS.forEach(([label, keys], i) => {
      const y = rowStart + i * rowStep;
      // Beschriftung links
      ctx.fillStyle = '#c8e8c8';
      ctx.textAlign = 'left';
      ctx.fillText(label, labelX, y);
      // Tasten rechts
      ctx.fillStyle = '#f0c040';
      ctx.textAlign = 'right';
      ctx.fillText(keys, valueX, y);
    });

    // --- Footer-Hinweis ---
    ctx.textAlign = 'center';
    ctx.font      = '12px monospace';
    ctx.fillStyle = '#607060';
    ctx.fillText('ESC = Weiter spielen', CANVAS_WIDTH / 2, PANEL_Y + PANEL_H - 22);
  }
}
