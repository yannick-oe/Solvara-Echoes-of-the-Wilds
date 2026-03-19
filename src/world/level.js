// #region Imports
import { TileMap }   from './tileMap.js';
import { TILE_SIZE } from '../core/constants.js';
import { imageCache } from '../core/imageCache.js';
// #endregion

// #region Class Definition
export class Level {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {
    /** @type {TileMap|null} */
    this.tileMap  = null;
    this.entities = [];
    this.props    = [];
    this._data    = null;
  }

/** Handles load. @param {*} jsonPath - Json Path value. @returns {void} - Nothing. */
  async load(jsonPath) {
    const response = await fetch(jsonPath);
    this._data     = await response.json();
    this.tileMap   = new TileMap(this._data, imageCache.get('TILESET'));
  }

/** Gets width. @returns {number} - Current value. */
  get width()  { return this._data ? this._data.meta.columns * TILE_SIZE : 0; }

/** Gets height. @returns {number} - Current value. */
  get height() { return this._data ? this._data.meta.rows    * TILE_SIZE : 0; }

/** Gets content. @returns {*} - Current value. */
  get content() { return this._data?.content ?? null; }
}
// #endregion