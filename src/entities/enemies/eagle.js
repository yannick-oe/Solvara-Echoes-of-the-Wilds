import { Enemy } from './enemy.js';

export class EagleEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 48, 32);

    this._originY   = y;
    this._amplitude = 80;   // Pixel nach oben/unten
    this._elapsed   = 0;
  }

  update(dt, tileMap) {
    // TODO: Sinus-Flugbahn vertikal
  }

  draw(ctx, cam, imageCache) {
    // TODO: Eagle attack frames zeichnen
  }
}
