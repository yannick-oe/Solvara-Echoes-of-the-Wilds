import { TileMap }   from './tileMap.js';
import { TILE_SIZE } from '../core/constants.js';
import { imageCache } from '../core/imageCache.js';

export class Level {
  constructor() {
    /** @type {TileMap|null} */
    this.tileMap  = null;
    this.entities = [];
    this.props    = [];
    this._data    = null;
  }

  /**
   * Lädt die Level-JSON-Datei und erstellt die TileMap.
   * Muss nach imageCache.preload() aufgerufen werden.
   * @param {string} jsonPath
   */
  async load(jsonPath) {
    const response = await fetch(jsonPath);
    this._data     = await response.json();
    this.tileMap   = new TileMap(this._data, imageCache.get('TILESET'));
  }

  /** Weltbreite in Pixeln (TILE_SIZE-basiert). */
  get width()  { return this._data ? this._data.meta.columns * TILE_SIZE : 0; }

  /** Welthöhe in Pixeln (TILE_SIZE-basiert). */
  get height() { return this._data ? this._data.meta.rows    * TILE_SIZE : 0; }
}
