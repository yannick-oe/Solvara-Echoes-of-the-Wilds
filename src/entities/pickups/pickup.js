import { Entity } from '../entity.js';

export class Pickup extends Entity {


  constructor(x, y, w, h, frameCount, frameSec) {
    super(x, y, w, h);
    this.collected   = false;
    this._frameIndex = 0;
    this._frameTimer = 0;
    this._frameCount = frameCount;
    this._frameSec   = frameSec;
  }



  collect(player, gameState) {
    this.collected = true;
    this.active    = false;
  }


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
