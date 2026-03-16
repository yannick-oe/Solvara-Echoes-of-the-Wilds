// #region Imports
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { audioManager } from '../../core/audioManager.js';
// #endregion

// #region Constants
const STING_SRC      = 'assets/audio/music/gameOver.mp3';
const FONT_MAIN      = 'bold 58px serif';
const FONT_HINT      = '14px monospace';
const FALL_DURATION  = 0.46;
const STAGGER        = 0.052;
const START_OFFSET   = -265;
const CHAR_GAP       = 2;
const TITLE_Y_FRAC   = 0.46;
const SWEEP_DURATION = 1.1;
const PARTICLE_MAX   = 42;
// #endregion

// #region Class Definition
/**
 * Handles ease out bounce.
 * @param {number} x Input parameter.
 */
function easeOutBounce(x) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1)       return n1 * x * x;
  if (x < 2 / d1)       return n1 * (x -= 1.5  / d1) * x + 0.750;
  if (x < 2.5 / d1)     return n1 * (x -= 2.25 / d1) * x + 0.9375;
                         return n1 * (x -= 2.625/ d1) * x + 0.984375;
}

export class GameOverScreen {

  /**
   * Creates a new instance.
   * @param {object} onRestart Input parameter.
   */
  constructor(onRestart) {
    this._onRestart   = onRestart;
    this._elapsed     = 0;
    this._letterDefs  = null;
    this._particles   = [];
    this._stingPlayed = false;
    this._glowElapsed = -1;
    this._stingEl         = new Audio(STING_SRC);
    this._stingEl.preload = 'auto';
    this._stingEl.loop    = false;
  }

  /**
   * Handles show.
   */
  show() {
    this._elapsed     = 0;
    this._letterDefs  = null;
    this._particles   = this._spawnParticles(PARTICLE_MAX);
    this._stingPlayed = false;
    this._glowElapsed = -1;
  }

  /**
   * Handles update.
   * @param {number} dt Input parameter.
   */
  update(dt) {
    this._elapsed += dt;
    this._tickParticles(dt);
    this._maybeSpawnParticles();
    this._tickGlowTimer(dt);
  }

  /** Updates particle movement/lifetime and prunes expired particles. */
  _tickParticles(dt) {
    for (const p of this._particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 14 * dt;
      p.life -= dt;
    }
    this._particles = this._particles.filter(p => p.life > 0);
  }

  /** Spawns extra particles when pool density drops. */
  _maybeSpawnParticles() {
    if (this._particles.length >= PARTICLE_MAX * 0.55) return;
    if (Math.random() >= 0.25) return;
    this._particles.push(...this._spawnParticles(4));
  }

  /** Starts/advances glow sweep timer after all letters land. */
  _tickGlowTimer(dt) {
    const allLandTime = (('GAME OVER'.length - 1) * STAGGER) + FALL_DURATION;
    if (this._elapsed >= allLandTime && this._glowElapsed < 0) this._glowElapsed = 0;
    if (this._glowElapsed >= 0) this._glowElapsed += dt;
  }

  /**
   * Handles handle input.
   * @param {object} input Input parameter.
   */
  handleInput(input) {
    if (input.jumpPressed || input.enterPressed || input.escPressed) {
      this._onRestart();
    }
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  draw(ctx) {
    this._drawBackdrop(ctx);
    this._drawParticles(ctx);
    this._ensureLetterDefs(ctx);
    this._drawLetters(ctx);
    this._drawOptionalGlow(ctx);
    this._drawOptionalHint(ctx);
  }

  /** Draws gradient background and vignette overlay. */
  _drawBackdrop(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg.addColorStop(0, '#0e0b1a');
    bg.addColorStop(1, '#06030a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const vig = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.14, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.80);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /** Ensures cached letter metrics are initialized once. */
  _ensureLetterDefs(ctx) {
    if (!this._letterDefs) this._initLetterDefs(ctx);
  }

  /** Draws glow sweep when timer is active. */
  _drawOptionalGlow(ctx) {
    if (this._glowElapsed >= 0 && this._glowElapsed < SWEEP_DURATION) this._drawGlowSweep(ctx);
  }

  /** Draws retry hint after the reveal delay. */
  _drawOptionalHint(ctx) {
    const allLandTime = (('GAME OVER'.length - 1) * STAGGER) + FALL_DURATION;
    const hintStart = allLandTime + 0.55;
    if (this._elapsed <= hintStart) return;
    const alpha = Math.min((this._elapsed - hintStart) / 0.65, 1);
    this._drawHintText(ctx, alpha);
  }

  /**
   * Handles init letter defs.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _initLetterDefs(ctx) {
    this._letterDefs = this._buildLetterDefs(ctx);
    this._playStingOnce();
  }

  /** Builds timed letter descriptors for GAME OVER reveal. */
  _buildLetterDefs(ctx) {
    ctx.save();
    ctx.font = FONT_MAIN;
    ctx.textBaseline = 'alphabetic';
    const defs = this._measureLetterDefs(ctx);
    ctx.restore();
    return defs;
  }

  /** Measures glyph widths and computes letter positions. */
  _measureLetterDefs(ctx) {
    const chars = 'GAME OVER'.split('');
    const finalY = Math.round(CANVAS_HEIGHT * TITLE_Y_FRAC);
    const widths = chars.map(c => ctx.measureText(c).width);
    const totalW = widths.reduce((s, w) => s + w, 0) + CHAR_GAP * (chars.length - 1);
    let curX = CANVAS_WIDTH / 2 - totalW / 2;
    return chars.map((char, i) => this._createLetterDef(char, i, widths, finalY, () => curX, v => { curX = v; }));
  }

  /** Creates one letter definition and advances x cursor. */
  _createLetterDef(char, i, widths, finalY, getX, setX) {
    const lx = getX();
    setX(lx + widths[i] + CHAR_GAP);
    return { char, x: lx, finalY, startY: finalY + START_OFFSET, delay: i * STAGGER };
  }

  /** Plays one-shot game-over sting if not already played. */
  _playStingOnce() {
    if (this._stingPlayed) return;
    this._stingPlayed = true;
    this._stingEl.volume = Math.min(1, Math.max(0.3, audioManager.musicVolume));
    this._stingEl.currentTime = 0;
    this._stingEl.play().catch(() => {});
  }

  /**
   * Handles draw letters.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawLetters(ctx) {
    ctx.save();
    ctx.font = FONT_MAIN;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    for (const def of this._letterDefs) this._drawOneLetter(ctx, def);
    ctx.restore();
  }

  /** Draws one animated falling title letter. */
  _drawOneLetter(ctx, def) {
    const localTime = this._elapsed - def.delay;
    if (localTime <= 0) return;
    const tNorm = Math.min(localTime / FALL_DURATION, 1.0);
    const curY = def.startY + (def.finalY - def.startY) * easeOutBounce(tNorm);
    ctx.shadowColor = 'rgba(240,192,0,0.75)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#f0c040';
    ctx.fillText(def.char, def.x, curY);
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#fff4a8';
    ctx.fillText(def.char, def.x, curY);
  }

  /**
   * Handles draw glow sweep.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawGlowSweep(ctx) {
    const t    = this._glowElapsed / SWEEP_DURATION;
    const posX = -80 + (CANVAS_WIDTH + 160) * t;
    const grd = ctx.createLinearGradient(posX - 70, 0, posX + 70, 0);
    grd.addColorStop(0,   'rgba(255,240,160,0)');
    grd.addColorStop(0.5, 'rgba(255,240,160,0.20)');
    grd.addColorStop(1,   'rgba(255,240,160,0)');
    const def0    = this._letterDefs[0];
    const textTop = def0.finalY - 56;
    const textH   = 64;
    ctx.fillStyle = grd;
    ctx.fillRect(posX - 70, textTop, 140, textH);
  }

  /**
   * Handles draw hint text.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} alpha Input parameter.
   */
  _drawHintText(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.font         = FONT_HINT;
    ctx.fillStyle    = '#b8a880';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const def0 = this._letterDefs[0];
    ctx.fillText(t('retryHint'), CANVAS_WIDTH / 2, def0.finalY + 52);
    ctx.restore();
  }

  /**
   * Handles draw particles.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   */
  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      const alpha = Math.max(p.life / p.maxLife, 0) * 0.65;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Handles spawn particles.
   * @param {number} count Input parameter.
   */
  _spawnParticles(count) {
    const list = [];
    for (let i = 0; i < count; i++) list.push(this._createParticle());
    return list;
  }

  /** Creates one ambient particle object. */
  _createParticle() {
    const life = 2.8 + Math.random() * 3.2;
    return {
      x: Math.random() * CANVAS_WIDTH,
      y: CANVAS_HEIGHT * 0.18 + Math.random() * CANVAS_HEIGHT * 0.68,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 10,
      r: 0.8 + Math.random() * 2.4,
      life,
      maxLife: life,
      color: Math.random() < 0.55 ? '#f0c040' : '#a06020',
    };
  }
}
// #endregion