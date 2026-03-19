/**
 * Shared Canvas 2D drawing utilities used across UI screens and HUD.
 * @module canvasUtils
 */
// #region Public Methods
/** Handles rrect. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
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

/** Draws wood Panel. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} drawPlanks - Draw Planks value. @returns {void} - Nothing. */
export function drawWoodPanel(ctx, x, y, w, h, drawPlanks = true) {
  const r = 8;
  _drawWoodBase(ctx, x, y, w, h, r);
  _drawWoodGrain(ctx, x, y, w, h, r);
  _drawWoodCaps(ctx, x, y, w, h, r);
  _drawWoodPlanks(ctx, x, y, w, h, drawPlanks);
  _drawWoodBorders(ctx, x, y, w, h, r);
  _drawCornerNails(ctx, x, y, w, h);
}

/** Draws wood Base. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
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

/** Draws wood Grain. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
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

/** Draws wood Caps. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
function _drawWoodCaps(ctx, x, y, w, h, r) {
  ctx.fillStyle = 'rgba(28, 14, 4, 0.52)';
  ctx.fillRect(x + r, y, w - r * 2, 11);
  ctx.fillStyle = 'rgba(28, 14, 4, 0.58)';
  ctx.fillRect(x + r, y + h - 11, w - r * 2, 11);
}

/** Draws wood Planks. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} drawPlanks - Draw Planks value. @returns {void} - Nothing. */
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

/** Draws wood Borders. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
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

/** Draws corner Nails. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {void} - Nothing. */
function _drawCornerNails(ctx, x, y, w, h) {
  const corners = _cornerPoints(x, y, w, h);
  ctx.fillStyle   = '#4a2f1a';
  ctx.strokeStyle = 'rgba(220, 175, 100, 0.40)';
  ctx.lineWidth   = 1;
  for (const [ox, oy] of corners) _drawCornerNail(ctx, ox, oy);
}

/** Handles corner Points. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {*} - Resulting value. */
function _cornerPoints(x, y, w, h) {
  return [
    [x + 7, y + 7],
    [x + w - 7, y + 7],
    [x + 7, y + h - 7],
    [x + w - 7, y + h - 7],
  ];
}

/** Draws corner Nail. @param {*} ctx - Ctx value. @param {*} ox - Ox value. @param {*} oy - Oy value. @returns {void} - Nothing. */
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

/** Draws hud Panel. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {void} - Nothing. */
export function drawHudPanel(ctx, x, y, w, h) {
  const r = 7;
  ctx.save();
  _fillHudPanel(ctx, x, y, w, h, r);
  _strokeHudPanel(ctx, x, y, w, h, r);
  ctx.restore();
}

/** Handles fill Hud Panel. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
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

/** Handles stroke Hud Panel. @param {*} ctx - Ctx value. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @param {*} r - R value. @returns {void} - Nothing. */
function _strokeHudPanel(ctx, x, y, w, h, r) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(200,160,80,0.22)';
  ctx.lineWidth = 1;
  rrect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
}
// #endregion