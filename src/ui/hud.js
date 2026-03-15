import { CANVAS_WIDTH, STAR_COIN_COUNT } from '../core/constants.js';
import { rrect, drawHudPanel } from './canvasUtils.js';

const PAD = 10;
const PANEL_PAD = 8;
const HEART_SIZE = 26;
const HEART_ICON = '♥';
const STAR_SIZE = 18;
const STAR_GAP = 4;
const COIN_ICON_FILLED = '⭐';
const COIN_ICON_EMPTY = '☆';
const GEM_SIZE = 20;
const HUD_FONT = 'bold 13px monospace';
const SCORE_FONT = 'bold 12px monospace';

const COUNT_SPEED = 260;

const GEM_PULSE_PERIOD = 2.6;
const HEART_PULSE_PERIOD = 3.2;
const STAR_SHIMMER_PERIOD = 1.8;

const POOL_SIZE = 96;

function easeOut(t) { return 1 - (1 - t) ** 2; }

function initParticle(p, x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 38 + Math.random() * 90;
  p.active = true;
  p.x = x;
  p.y = y;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed - 30;
  p.life = 0.55 + Math.random() * 0.35;
  p.maxLife = p.life;
  p.r = 1.8 + Math.random() * 3.0;
  p.color = color;
}

function makePool() {
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({
      active: false, x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 1, r: 2, color: '#fff'
    });
  }
  return pool;
}

export class Hud {

  constructor(imageCache) {
    this._imageCache = imageCache;


    this._displayScore = 0;
    this._prevScore = 0;
    this._displayGems = 0;
    this._targetGems = 0;


    this._heartBump = 0;
    this._gemBump = 0;
    this._heartFlash = 0;
    this._heartShakeT = 0;

    this._starBump = new Float32Array(STAR_COIN_COUNT);


    this._time = 0;


    this._particles = makePool();
  }




  update(dt) {
    this._time += dt;


    if (this._displayScore < this._prevScore) {
      this._displayScore = Math.min(
        this._displayScore + COUNT_SPEED * dt * 4,
        this._prevScore,
      );
    }

    if (this._displayGems < this._targetGems) {
      this._displayGems = Math.min(
        this._displayGems + COUNT_SPEED * dt * 0.04,
        this._targetGems,
      );
    }


    this._heartBump = Math.max(0, this._heartBump - dt * 5);
    this._gemBump = Math.max(0, this._gemBump - dt * 5);
    this._heartFlash = Math.max(0, this._heartFlash - dt * 4);
    this._heartShakeT = Math.max(0, this._heartShakeT - dt);
    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      this._starBump[i] = Math.max(0, this._starBump[i] - dt * 5);
    }


    for (const p of this._particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }



  notify(event, screenX, screenY, slotIndex) {
    switch (event) {
      case 'damage':
        this._heartBump = 0.28;
        this._heartFlash = 1.0;
        this._heartShakeT = 0.28;

        break;
      case 'heal':
        this._heartBump = 0.22;
        this._spawnBurst(screenX, screenY, 8, '#ff4d4d', '#ff8888');
        break;
      case 'gem':
        this._gemBump = 0.30;
        this._targetGems = (this._targetGems || 0) + 1;
        this._spawnBurst(screenX, screenY, 10, '#9b59ff', '#c084ff');
        break;
      case 'starCoin':
        if (slotIndex !== undefined && slotIndex < STAR_COIN_COUNT) {
          this._starBump[slotIndex] = 0.35;
        }
        this._spawnBurst(screenX, screenY, 14, '#ffd700', '#ffe88f');
        break;
    }
  }



  draw(ctx, gameState) {
    this._prevScore = gameState.score;
    this._targetGems = gameState.gemsCollected;
    if (this._displayGems > gameState.gemsCollected) {
      this._displayGems = gameState.gemsCollected;
    }

    this._drawLeftPanel(ctx, gameState);
    this._drawRightPanel(ctx, gameState);
    this._drawParticles(ctx);
  }



  _drawLeftPanel(ctx, gameState) {
    const { hearts, starCoins } = gameState;


    const shakeX = this._heartShakeT > 0
      ? Math.round(Math.sin(this._time * 62) * 2.5 * (this._heartShakeT / 0.28))
      : 0;


    const panelW = 104;
    const panelH = 68;

    ctx.save();
    ctx.translate(shakeX, 0);

    drawHudPanel(ctx, PAD, PAD, panelW, panelH);


    const heartRowY = PAD + PANEL_PAD + HEART_SIZE / 2;

    const pulse = Math.sin(this._time / HEART_PULSE_PERIOD * Math.PI * 2) * 0.04 + 1;
    const bump = 1 + this._heartBump;
    const hScale = pulse * bump;
    const hcx = PAD + PANEL_PAD + HEART_SIZE / 2;

    ctx.save();
    ctx.translate(hcx, heartRowY);
    ctx.scale(hScale, hScale);
    ctx.font = `bold ${HEART_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;

    if (this._heartFlash > 0) {
      ctx.shadowColor = `rgba(255,80,80,${this._heartFlash * 0.9})`;
      ctx.shadowBlur = 14 * this._heartFlash;
    } else {
      ctx.shadowColor = 'rgba(255,70,70,0.60)';
      ctx.shadowBlur = 6;
    }

    ctx.strokeStyle = 'rgba(60, 0, 0, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ff5a5a';

    ctx.strokeText(HEART_ICON, 0, 1);
    ctx.fillText(HEART_ICON, 0, 1);
    ctx.restore();


    ctx.font = HUD_FONT;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const countX = PAD + PANEL_PAD + HEART_SIZE + 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(`×${hearts}`, countX, heartRowY);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(`×${hearts}`, countX, heartRowY);


    const starRowY = PAD + PANEL_PAD + HEART_SIZE + 6 + STAR_SIZE / 2;
    const starStartX = PAD + PANEL_PAD;

    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      const filled = starCoins[i] === true;
      const bumpS = 1 + this._starBump[i];
      const shimmer = filled
        ? Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1
        : 1;
      const scale = bumpS * shimmer;
      const cx = starStartX + i * (STAR_SIZE + STAR_GAP) + STAR_SIZE / 2;

      ctx.save();
      ctx.translate(cx, starRowY);
      ctx.scale(scale, scale);
      ctx.font = `bold ${STAR_SIZE}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (filled) {
        const glow = 0.35 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.15;
        ctx.shadowColor = `rgba(255,215,0,${glow})`;
        ctx.shadowBlur = 7;
        ctx.globalAlpha = 1;
      } else {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.28;
      }
      ctx.fillText(filled ? COIN_ICON_FILLED : COIN_ICON_EMPTY, 0, 1);
      ctx.restore();
    }

    ctx.restore();
  }



  _drawRightPanel(ctx, gameState) {
    const displayScore = Math.round(this._displayScore);
    const displayGems = Math.floor(this._displayGems);
    const gemImg = this._imageCache.get('GEM_0');

    const panelW = 148;
    const panelH = 56;
    const panelX = CANVAS_WIDTH - PAD - panelW;
    const panelY = PAD;

    drawHudPanel(ctx, panelX, panelY, panelW, panelH);

    const innerX = panelX + PANEL_PAD;
    const innerR = panelX + panelW - PANEL_PAD;

    ctx.save();
    ctx.textBaseline = 'top';


    ctx.font = SCORE_FONT;
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText('SCORE', innerX, panelY + PANEL_PAD);
    ctx.fillStyle = '#c8b090';
    ctx.fillText('SCORE', innerX, panelY + PANEL_PAD);


    ctx.font = HUD_FONT;
    ctx.textAlign = 'right';
    const scoreStr = String(displayScore).padStart(5, '0');
    ctx.strokeText(scoreStr, innerR, panelY + PANEL_PAD);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(scoreStr, innerR, panelY + PANEL_PAD);


    const gemRowY = panelY + PANEL_PAD + 22;
    const gemPulse = Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.06 + 1;
    const gemScale = gemPulse * (1 + this._gemBump);
    const gemIconX = innerX + GEM_SIZE / 2;
    const gemIconY = gemRowY + GEM_SIZE / 2;

    ctx.save();
    ctx.translate(gemIconX, gemIconY);
    ctx.scale(gemScale, gemScale);

    const glowAlpha = 0.40 + Math.sin(this._time / GEM_PULSE_PERIOD * Math.PI * 2) * 0.20;
    ctx.shadowColor = `rgba(155,89,255,${glowAlpha})`;
    ctx.shadowBlur = 8;

    if (gemImg) {
      ctx.drawImage(gemImg, -GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    } else {
      ctx.fillStyle = '#9b59ff';
      ctx.fillRect(-GEM_SIZE / 2, -GEM_SIZE / 2, GEM_SIZE, GEM_SIZE);
    }
    ctx.restore();

    ctx.font = HUD_FONT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const gemStr = `×${displayGems}`;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.strokeText(gemStr, innerR, gemRowY + GEM_SIZE / 2);
    ctx.fillStyle = '#fff4c0';
    ctx.fillText(gemStr, innerR, gemRowY + GEM_SIZE / 2);

    ctx.restore();
  }



  _spawnBurst(sx, sy, count, col1, col2) {
    let spawned = 0;
    for (const p of this._particles) {
      if (!p.active) {
        initParticle(p, sx, sy, Math.random() < 0.5 ? col1 : col2);
        if (++spawned >= count) break;
      }
    }
  }

  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      if (!p.active) continue;
      const alpha = Math.max(easeOut(p.life / p.maxLife), 0);
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }



}
