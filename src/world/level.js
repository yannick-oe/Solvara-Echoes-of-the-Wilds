// #region Imports
import { TileMap }   from './tileMap.js';
import { TILE_SIZE } from '../core/constants.js';
import { imageCache } from '../core/imageCache.js';
// #endregion

// #region Class Definition
export class Level {
  /**
   * Creates a new instance.
   */
  constructor() {
    /** @type {TileMap|null} */
    this.tileMap  = null;
    this.entities = [];
    this.props    = [];
    this._data    = null;
  }

  /**
   * Loads the level JSON file and creates the TileMap.
   * Must be called after imageCache.preload().
   * @param {string} jsonPath
   */
  async load(jsonPath) {
    const response = await fetch(jsonPath);
    this._data     = await response.json();
    this.tileMap   = new TileMap(this._data, imageCache.get('TILESET'));
  }

  /** World width in pixels (TILE_SIZE-based). */
  get width()  { return this._data ? this._data.meta.columns * TILE_SIZE : 0; }

  /** World height in pixels (TILE_SIZE-based). */
  get height() { return this._data ? this._data.meta.rows    * TILE_SIZE : 0; }

  /**
   * Returns the `content` block from the level JSON.
   * Contains playerSpawn, enemies, pickups, hazards, and interactables.
   */
  get content() { return this._data?.content ?? null; }
}
// #endregion