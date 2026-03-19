import { STAR_COIN_COUNT } from '../../core/constants.js';
import { COUNT_SPEED, initParticle } from './hudShared.js';

export const hudUpdateMethods = {
  update(dt) {
    this._time += dt;
    this._updateDisplayCounters(dt);
    this._updateAnimTimers(dt);
    this._updateStarBumps(dt);
    this._updateParticles(dt);
  },

  _updateDisplayCounters(dt) {
    if (this._displayScore < this._prevScore) this._displayScore = Math.min(this._displayScore + COUNT_SPEED * dt * 4, this._prevScore);
    if (this._displayGems < this._targetGems) this._displayGems = Math.min(this._displayGems + COUNT_SPEED * dt * 0.04, this._targetGems);
  },

  _updateAnimTimers(dt) {
    this._heartBump = Math.max(0, this._heartBump - dt * 5);
    this._gemBump = Math.max(0, this._gemBump - dt * 5);
    this._heartFlash = Math.max(0, this._heartFlash - dt * 4);
    this._heartShakeT = Math.max(0, this._heartShakeT - dt);
  },

  _updateStarBumps(dt) {
    for (let i = 0; i < STAR_COIN_COUNT; i++) this._starBump[i] = Math.max(0, this._starBump[i] - dt * 5);
  },

  _updateParticles(dt) {
    for (const p of this._particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  },

  notify(event, screenX, screenY, slotIndex) {
    if (event === 'damage') return this._onDamage();
    if (event === 'heal') return this._onHeal(screenX, screenY);
    if (event === 'gem') return this._onGem(screenX, screenY);
    if (event === 'starCoin') this._onStarCoin(screenX, screenY, slotIndex);
  },

  _onDamage() {
    this._heartBump = 0.28;
    this._heartFlash = 1.0;
    this._heartShakeT = 0.28;
  },

  _onHeal(screenX, screenY) {
    this._heartBump = 0.22;
    this._spawnBurst(screenX, screenY, 8, '#ff4d4d', '#ff8888');
  },

  _onGem(screenX, screenY) {
    this._gemBump = 0.30;
    this._targetGems = (this._targetGems || 0) + 1;
    this._spawnBurst(screenX, screenY, 10, '#9b59ff', '#c084ff');
  },

  _onStarCoin(screenX, screenY, slotIndex) {
    if (slotIndex !== undefined && slotIndex < STAR_COIN_COUNT) this._starBump[slotIndex] = 0.35;
    this._spawnBurst(screenX, screenY, 14, '#ffd700', '#ffe88f');
  },

  _spawnBurst(sx, sy, count, col1, col2) {
    let spawned = 0;
    for (const p of this._particles) {
      if (p.active) continue;
      initParticle(p, sx, sy, Math.random() < 0.5 ? col1 : col2);
      if (++spawned >= count) break;
    }
  },
};
