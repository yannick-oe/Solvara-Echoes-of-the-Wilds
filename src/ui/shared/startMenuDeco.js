// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { imageCache } from '../../core/imageCache.js';
import { rrect } from './canvasUtils.js';
// #endregion

// #region Public Methods
/** Draws background. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
export function drawBackground(ctx) {
  _fillSky(ctx);
  _drawBackLayer(ctx);
  _drawMiddleLayer(ctx);
}

/** Handles fill Sky. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
function _fillSky(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#1e3a52');
  sky.addColorStop(0.5, '#4a7a94');
  sky.addColorStop(1, '#6a9c7c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/** Draws back Layer. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
function _drawBackLayer(ctx) {
  const bgBack = imageCache.get('BG_FOREST_BACK');
  if (!bgBack) return;
  const scale = CANVAS_HEIGHT / bgBack.naturalHeight;
  const drawW = Math.round(bgBack.naturalWidth * scale);
  ctx.drawImage(bgBack, 0, 0, drawW, CANVAS_HEIGHT);
}

/** Draws middle Layer. @param {*} ctx - Ctx value. @returns {void} - Nothing. */
function _drawMiddleLayer(ctx) {
  const bgMiddle = imageCache.get('BG_FOREST_MIDDLE');
  if (!bgMiddle) return;
  const drawH = Math.round(CANVAS_HEIGHT * 0.58);
  const scale = drawH / bgMiddle.naturalHeight;
  const drawW = Math.round(bgMiddle.naturalWidth * scale);
  const drawY = CANVAS_HEIGHT - drawH;
  for (let x = 0; x < CANVAS_WIDTH; x += drawW) ctx.drawImage(bgMiddle, Math.floor(x), drawY, drawW, drawH);
}

/** Draws title Banner. @param {*} ctx - Ctx value. @param {*} cx - Cx value. @param {*} titleY - Title Y value. @returns {void} - Nothing. */
export function drawTitleBanner(ctx, cx, titleY) {
  const frame = _titleFrame(cx, titleY);
  _drawBannerGlow(ctx, cx, frame);
  _drawBannerBody(ctx, frame);
  _drawBannerGrain(ctx, frame);
  _drawBannerBorders(ctx, frame);
  _drawBannerCorners(ctx, frame);
}

/** Handles title Frame. @param {*} cx - Cx value. @param {*} titleY - Title Y value. @returns {*} - Resulting value. */
function _titleFrame(cx, titleY) {
  const w = 380;
  const h = 104;
  const x = cx - w / 2;
  const y = titleY - 42;
  return { x, y, w, h, r: 6 };
}

/** Draws banner Glow. @param {*} ctx - Ctx value. @param {*} cx - Cx value. @param {*} frame - Frame value. @returns {void} - Nothing. */
function _drawBannerGlow(ctx, cx, frame) {
  const glow = ctx.createRadialGradient(cx, frame.y + frame.h / 2, 8, cx, frame.y + frame.h / 2, 230);
  glow.addColorStop(0, 'rgba(220, 155, 35, 0.20)');
  glow.addColorStop(0.45, 'rgba(180, 95, 10, 0.09)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.00)');
  ctx.fillStyle = glow;
  ctx.fillRect(frame.x - 60, frame.y - 32, frame.w + 120, frame.h + 64);
}

/** Draws banner Body. @param {*} ctx - Ctx value. @param {*} frame - Frame value. @returns {void} - Nothing. */
function _drawBannerBody(ctx, frame) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#4a2f1a';
  rrect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#4a2f1a';
  rrect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r);
  ctx.fill();
}

/** Draws banner Grain. @param {*} ctx - Ctx value. @param {*} frame - Frame value. @returns {void} - Nothing. */
function _drawBannerGrain(ctx, frame) {
  const g = ctx.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h);
  g.addColorStop(0, 'rgba(22, 10, 3, 0.50)');
  g.addColorStop(0.30, 'rgba(100, 60, 22, 0.38)');
  g.addColorStop(0.70, 'rgba(100, 60, 22, 0.38)');
  g.addColorStop(1, 'rgba(18, 7, 2, 0.58)');
  rrect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r);
  ctx.fillStyle = g;
  ctx.fill();
}

/** Draws banner Borders. @param {*} ctx - Ctx value. @param {*} frame - Frame value. @returns {void} - Nothing. */
function _drawBannerBorders(ctx, frame) {
  ctx.strokeStyle = '#3b2615';
  ctx.lineWidth = 3;
  rrect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(195, 148, 78, 0.28)';
  ctx.lineWidth = 1;
  rrect(ctx, frame.x + 4, frame.y + 4, frame.w - 8, frame.h - 8, Math.max(frame.r - 2, 2));
  ctx.stroke();
}

/** Draws banner Corners. @param {*} ctx - Ctx value. @param {*} frame - Frame value. @returns {void} - Nothing. */
function _drawBannerCorners(ctx, frame) {
  const corners = _bannerCornerPoints(frame);
  ctx.fillStyle = '#3b2615';
  ctx.strokeStyle = 'rgba(195, 148, 78, 0.38)';
  ctx.lineWidth = 1;
  for (const [ox, oy] of corners) _drawBannerCorner(ctx, ox, oy);
}

/** Handles banner Corner Points. @param {*} frame - Frame value. @returns {*} - Resulting value. */
function _bannerCornerPoints(frame) {
  return [
    [frame.x + 7, frame.y + 7],
    [frame.x + frame.w - 7, frame.y + 7],
    [frame.x + 7, frame.y + frame.h - 7],
    [frame.x + frame.w - 7, frame.y + frame.h - 7],
  ];
}

/** Draws banner Corner. @param {*} ctx - Ctx value. @param {*} ox - Ox value. @param {*} oy - Oy value. @returns {void} - Nothing. */
function _drawBannerCorner(ctx, ox, oy) {
  ctx.beginPath();
  ctx.moveTo(ox, oy - 4);
  ctx.lineTo(ox + 4, oy);
  ctx.lineTo(ox, oy + 4);
  ctx.lineTo(ox - 4, oy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** Draws vignette. @param {*} ctx - Ctx value. @param {*} cx - Cx value. @param {*} cy - Cy value. @returns {void} - Nothing. */
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
