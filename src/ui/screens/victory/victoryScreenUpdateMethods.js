import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../core/constants.js';
import { ATMO_RATE, ATMO_POOL, CX, SPARK_MAX, STAR_CY, T_STAR_0, T_STAR_GAP } from './victoryScreenShared.js';
import { initAtmoParticle, initSparkParticle } from '../../shared/victoryParticles.js';

export const victoryScreenUpdateMethods = {
/** Handles show. @param {*} gameState - Current game state. @param {*} levelTime - Level Time value. @returns {void} - Nothing. */
  show(gameState, levelTime) {
    this._data = {
      hearts: gameState.hearts,
      score: gameState.score,
      gems: gameState.gemsCollected,
      starCoins: [...gameState.starCoins],
    };
    this._levelTime = levelTime ?? 0;
    this._time = 0;
    this._atmoTimer = 0;
    this._hintBlink = 0;
    this._starPopped = [false, false, false];
    for (const p of this._particles) p.active = false;
  },

/** Handles update. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  update(dt) {
    if (!this._data) return;
    this._tickTimers(dt);
    this._spawnAtmoParticleIfDue();
    for (let i = 0; i < 3; i++) this._updateStarPop(i);
    this._tickParticles(dt);
  },

/** Handles tick Timers. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _tickTimers(dt) {
    this._time += dt;
    this._hintBlink += dt;
    this._atmoTimer += dt;
  },

/** Spawns atmo Particle If Due. @returns {*} - Resulting value. */
  _spawnAtmoParticleIfDue() {
    if (this._atmoTimer < ATMO_RATE) return;
    this._atmoTimer = 0;
    for (const p of this._particles) if (!p.active) return initAtmoParticle(p, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

/** Updates star Pop. @param {*} i - I value. @returns {void} - Nothing. */
  _updateStarPop(i) {
    const tStart = T_STAR_0 + i * T_STAR_GAP;
    if (this._starPopped[i] || this._time < tStart + 0.06) return;
    this._starPopped[i] = true;
    if (this._data.starCoins[i]) this._spawnStarSparks(i);
  },

/** Spawns star Sparks. @param {*} i - I value. @returns {void} - Nothing. */
  _spawnStarSparks(i) {
    const cx = Math.round(CX + (i - 1) * 90);
    let spawned = 0;
    for (const p of this._particles) {
      if (p.active) continue;
      initSparkParticle(p, cx, STAR_CY);
      if (++spawned >= SPARK_MAX) break;
    }
  },

/** Handles tick Particles. @param {*} dt - Frame delta time. @returns {void} - Nothing. */
  _tickParticles(dt) {
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 18 * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y < -20) p.active = false;
    }
  },

/** Handles input. @param {*} input - Current input state. @returns {void} - Nothing. */
  handleInput(input) {
    if (!this._data || this._time < 0.5) return;
    if (input.pausePressed) this._onMainMenu();
    if (input.jumpPressed || input.enterPressed) this._onRestart();
  },
};
