import { Entity } from '../entity.js';

export class Pickup extends Entity {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} frameCount  Anzahl der Animations-Frames
   * @param {number} frameSec    Sekunden pro Frame
   */
  constructor(x, y, w, h, frameCount, frameSec) {
    super(x, y, w, h);
    this.collected   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this._frameCount = frameCount;
    this._frameSec   = frameSec;
  }

  /**
   * Wird aufgerufen wenn der Player kollidiert.
   * Unterklassen rufen super.collect() auf und ändern dann gameState.
   * @param {import('../player.js').Player} player
   * @param {object} gameState
   */
  collect(player, gameState) {
    this.collected = true;
    this.active    = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.active) return;
    this._frameTimer += dt;
    if (this._frameTimer >= this._frameSec) {
      this._frameTimer -= this._frameSec;
      this._frameIndex  = (this._frameIndex + 1) % this._frameCount;
    }
  }

  draw(ctx, cam, imageCache) {}
}
