// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { imageCache } from '../core/imageCache.js';
import { rrect } from './canvasUtils.js';
// #endregion

// #region Public Methods
/**
 * Handles draw background.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 */
export function drawBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0,   '#1e3a52');
  sky.addColorStop(0.5, '#4a7a94');
  sky.addColorStop(1,   '#6a9c7c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const bgBack = imageCache.get('BG_FOREST_BACK');
  if (bgBack) {
    const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
    const drawW = Math.round(bgBack.naturalWidth * scale);
    ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
  }
  const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
  if (bgMiddle) {
    const drawH = Math.round(CANVAS_HEIGHT * 0.58);
    const scale = drawH / bgMiddle.naturalHeight;
    const drawW = Math.round(bgMiddle.naturalWidth * scale);
    const drawY = CANVAS_HEIGHT - drawH;
    for (let x = 0; x < CANVAS_WIDTH; x += drawW) {
      ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
    }
  }
}

/**
 * Draws the ornate frame behind the game title.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx      - Horizontal center of the canvas
 * @param {number} titleY  - Y position of the title text
 */
export function drawTitleBanner(ctx, cx, titleY) {
  const bw = 380;
  const bh = 104;
  const bx = cx - bw / 2;
  const by = titleY - 42;
  const r  = 6;
  const glow = ctx.createRadialGradient(cx, by + bh / 2, 8, cx, by + bh / 2, 230);
  glow.addColorStop(0,    'rgba(220, 155, 35, 0.20)');
  glow.addColorStop(0.45, 'rgba(180,  95, 10, 0.09)');
  glow.addColorStop(1,    'rgba(0,     0,  0, 0.00)');
  ctx.fillStyle = glow;
  ctx.fillRect(bx - 60, by - 32, bw + 120, bh + 64);
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur    = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#4a2f1a';
  rrect(ctx, bx, by, bw, bh, r);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#4a2f1a';
  rrect(ctx, bx, by, bw, bh, r);
  ctx.fill();
  const g = ctx.createLinearGradient(bx, by, bx, by + bh);
  g.addColorStop(0,    'rgba(22, 10, 3, 0.50)');
  g.addColorStop(0.30, 'rgba(100, 60, 22, 0.38)');
  g.addColorStop(0.70, 'rgba(100, 60, 22, 0.38)');
  g.addColorStop(1,    'rgba(18, 7, 2, 0.58)');
  rrect(ctx, bx, by, bw, bh, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#3b2615';
  ctx.lineWidth   = 3;
  rrect(ctx, bx, by, bw, bh, r);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(195, 148, 78, 0.28)';
  ctx.lineWidth   = 1;
  rrect(ctx, bx + 4, by + 4, bw - 8, bh - 8, Math.max(r - 2, 2));
  ctx.stroke();
  const corners = [
    [bx + 7,      by + 7     ],
    [bx + bw - 7, by + 7     ],
    [bx + 7,      by + bh - 7],
    [bx + bw - 7, by + bh - 7],
  ];
  ctx.fillStyle   = '#3b2615';
  ctx.strokeStyle = 'rgba(195, 148, 78, 0.38)';
  ctx.lineWidth   = 1;
  for (const [ox, oy] of corners) {
    ctx.beginPath();
    ctx.moveTo(ox,     oy - 4);
    ctx.lineTo(ox + 4, oy);
    ctx.lineTo(ox,     oy + 4);
    ctx.lineTo(ox - 4, oy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * Draws a dark radial edge vignette over the entire canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  - Horizontal center
 * @param {number} cy  - Vertical center
 */
export function drawVignette(ctx, cx, cy) {
  const grd = ctx.createRadialGradient(
    cx, cy * 1.05, CANVAS_HEIGHT * 0.22,
    cx, cy,        CANVAS_HEIGHT * 0.82
  );
  grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grd.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
// #endregion