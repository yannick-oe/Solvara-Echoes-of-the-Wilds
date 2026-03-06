import { TILE_SIZE } from '../core/constants.js';

export class TileMap {
  constructor(data) {
    this._tiles = data.tiles;
    this._map   = data.map;
    this._cols  = data.meta.columns;
    this._rows  = data.meta.rows;
    this._size  = data.meta.tileSize || TILE_SIZE;
  }

  /**
   * Gibt zurück ob eine Gitterzelle solid (= nicht passierbar) ist.
   * Außerhalb der Grenzen gilt immer als solid.
   */
  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return !this._tiles[key]?.pass;
  }

  /** Gibt das Tile-Objekt an einer Weltkoordinate zurück. */
  getTileAt(worldX, worldY) {
    const col = Math.floor(worldX / this._size);
    const row = Math.floor(worldY / this._size);
    const key = this._map[row]?.[col];
    return key ? this._tiles[key] : null;
  }

  draw(ctx, cam, imageCache) {
    // TODO: Tile-Rendering via Tileset-Atlas
  }

  get width()  { return this._cols * this._size; }
  get height() { return this._rows * this._size; }
  get tileSize() { return this._size; }
}
