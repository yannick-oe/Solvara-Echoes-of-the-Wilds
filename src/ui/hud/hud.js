import { makePool } from './hudShared.js';
import { hudUpdateMethods } from './hudUpdateMethods.js';
import { hudRenderMethods } from './hudRenderMethods.js';

export class Hud {
/** Creates a new instance. @param {*} imageCache - Image Cache value. @returns {void} - Nothing. */
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
    this._starBump = new Float32Array(3);
    this._time = 0;
    this._particles = makePool();
  }
}

Object.assign(Hud.prototype, hudUpdateMethods, hudRenderMethods);
