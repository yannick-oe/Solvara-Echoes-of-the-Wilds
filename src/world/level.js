import { TileMap } from './tileMap.js';

export class Level {
  constructor() {
    /** @type {TileMap|null} */
    this.tileMap  = null;
    this.entities = [];
    this.props    = [];
    this._data    = null;
  }

  /** @param {string} jsonPath */
  async load(jsonPath) {
    const response = await fetch(jsonPath);
    this._data     = await response.json();
    this.tileMap   = new TileMap(this._data);
  }

  getEntities() {
    return this.entities;
  }

  get width()  { return this._data ? this._data.meta.columns * this._data.meta.tileSize : 0; }
  get height() { return this._data ? this._data.meta.rows    * this._data.meta.tileSize : 0; }
}
