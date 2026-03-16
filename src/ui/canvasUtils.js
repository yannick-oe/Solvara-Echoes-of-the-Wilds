/**
 * Shared Canvas 2D drawing utilities used across UI screens and HUD.
 * @module canvasUtils
 */
// #region Public Methods
/**
 * Handles rrect.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
export function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

/**
 * Draws the ornate wooden panel background used on all menu screens.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
  * @param {boolean|number} [drawPlanks=true] - true/number to draw planks, false to skip. Number = number of items (planks = items - 1)
 */
export function drawWoodPanel(ctx, x, y, w, h, drawPlanks = true) {
  const r = 8;
  _drawWoodBase(ctx, x, y, w, h, r);
  _drawWoodGrain(ctx, x, y, w, h, r);
  _drawWoodCaps(ctx, x, y, w, h, r);
  _drawWoodPlanks(ctx, x, y, w, h, drawPlanks);
  _drawWoodBorders(ctx, x, y, w, h, r);
  _drawCornerNails(ctx, x, y, w, h);
}

/**
 * Handles draw wood base.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _drawWoodBase(ctx, x, y, w, h, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.70)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#7a5433';
  rrect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#7a5433';
  rrect(ctx, x, y, w, h, r);
  ctx.fill();
}

/**
 * Handles draw wood grain.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _drawWoodGrain(ctx, x, y, w, h, r) {
  const grain = ctx.createLinearGradient(x, y, x, y + h);
  grain.addColorStop(0, 'rgba(40, 20, 5, 0.60)');
  grain.addColorStop(0.10, 'rgba(195, 138, 68, 0.40)');
  grain.addColorStop(0.50, 'rgba(215, 158, 82, 0.46)');
  grain.addColorStop(0.90, 'rgba(125, 76, 30, 0.34)');
  grain.addColorStop(1, 'rgba(25, 12, 3, 0.68)');
  rrect(ctx, x, y, w, h, r);
  ctx.fillStyle = grain;
  ctx.fill();
}

/**
 * Handles draw wood caps.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _drawWoodCaps(ctx, x, y, w, h, r) {
  ctx.fillStyle = 'rgba(28, 14, 4, 0.52)';
  ctx.fillRect(x + r, y, w - r * 2, 11);
  ctx.fillStyle = 'rgba(28, 14, 4, 0.58)';
  ctx.fillRect(x + r, y + h - 11, w - r * 2, 11);
}

/**
 * Handles draw wood planks.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {boolean|number} drawPlanks Input parameter.
 */
function _drawWoodPlanks(ctx, x, y, w, h, drawPlanks) {
  const shouldDraw = typeof drawPlanks === 'number' ? drawPlanks > 1 : drawPlanks;
  if (!shouldDraw) return;
  ctx.strokeStyle = 'rgba(25, 12, 4, 0.20)';
  ctx.lineWidth = 1;
  const planks = typeof drawPlanks === 'number' ? drawPlanks - 1 : 4;
  for (let i = 1; i <= planks; i++) {
    const py = Math.floor(y + (h / (planks + 1)) * i);
    ctx.beginPath();
    ctx.moveTo(x + 8, py);
    ctx.lineTo(x + w - 8, py);
    ctx.stroke();
  }
}

/**
 * Handles draw wood borders.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _drawWoodBorders(ctx, x, y, w, h, r) {
  ctx.strokeStyle = '#3b2615';
  ctx.lineWidth = 4;
  rrect(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(220, 175, 100, 0.22)';
  ctx.lineWidth = 1;
  rrect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(r - 3, 2));
  ctx.stroke();
}

/**
 * Draws the four decorative diamond corner nails on a wood panel.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
function _drawCornerNails(ctx, x, y, w, h) {
  const corners = _cornerPoints(x, y, w, h);
  ctx.fillStyle   = '#4a2f1a';
  ctx.strokeStyle = 'rgba(220, 175, 100, 0.40)';
  ctx.lineWidth   = 1;
  for (const [ox, oy] of corners) _drawCornerNail(ctx, ox, oy);
}

/**
 * Handles corner points.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 */
function _cornerPoints(x, y, w, h) {
  return [
    [x + 7, y + 7],
    [x + w - 7, y + 7],
    [x + 7, y + h - 7],
    [x + w - 7, y + h - 7],
  ];
}

/**
 * Handles draw one corner nail.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} ox Input parameter.
 * @param {number} oy Input parameter.
 */
function _drawCornerNail(ctx, ox, oy) {
  ctx.beginPath();
  ctx.moveTo(ox, oy - 4);
  ctx.lineTo(ox + 4, oy);
  ctx.lineTo(ox, oy + 4);
  ctx.lineTo(ox - 4, oy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * Draws a standardised HUD/panel background with rounded corners.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
export function drawHudPanel(ctx, x, y, w, h) {
  const r = 7;
  ctx.save();
  _fillHudPanel(ctx, x, y, w, h, r);
  _strokeHudPanel(ctx, x, y, w, h, r);
  ctx.restore();
}

/**
 * Handles fill hud panel.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _fillHudPanel(ctx, x, y, w, h, r) {
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, 'rgba(14, 9, 4, 0.78)');
  grd.addColorStop(1, 'rgba(5, 2, 1, 0.88)');
  ctx.fillStyle = grd;
  rrect(ctx, x, y, w, h, r);
  ctx.fill();
}

/**
 * Handles stroke hud panel.
 * @param {CanvasRenderingContext2D} ctx Input parameter.
 * @param {number} x Input parameter.
 * @param {number} y Input parameter.
 * @param {number} w Input parameter.
 * @param {number} h Input parameter.
 * @param {number} r Input parameter.
 */
function _strokeHudPanel(ctx, x, y, w, h, r) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(200,160,80,0.22)';
  ctx.lineWidth = 1;
  rrect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
}
// #endregion