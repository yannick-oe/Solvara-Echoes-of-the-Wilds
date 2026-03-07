import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';

export class TileMap {
  /**
   * @param {object}           data          Geparster JSON-Inhalt von level_XX.json
   * @param {HTMLImageElement} tilesetImage  Vorgeladenes Tileset-Bild
   */
  constructor(data, tilesetImage) {
    this._map        = data.map;
    this._tiles      = data.tiles;
    this._cols       = data.meta.columns;
    this._rows       = data.meta.rows;
    this._srcSize    = data.meta.tileSize;   // Quelltile-Größe im PNG (z. B. 16 px)
    this._tilesetImg = tilesetImage;
  }

  /**
   * Gibt true zurück wenn die Gitterzelle solid (nicht passierbar) ist.
   * Zellen außerhalb der Levelgrenzen gelten als solid.
   */
  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.pass === false;
  }

  /**
   * Gibt das Tile-Definitionsobjekt an einer Weltkoordinate zurück.
   * @returns {{ pass: boolean, txCol: number, txRow: number }|null}
   */
  getTileAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return null;
    const key = this._map[row]?.[col];
    return key ? (this._tiles[key] ?? null) : null;
  }

  /**
   * Zeichnet alle sichtbaren Tiles.
   * Muss innerhalb von ctx.save / camera.applyTransform / ctx.restore aufgerufen werden.
   * @param {CanvasRenderingContext2D}                  ctx
   * @param {{ x: number, y: number }}                 camera
   */
  draw(ctx, camera) {
    if (!this._tilesetImg) return;

    const ts  = TILE_SIZE;
    const src = this._srcSize;

    // Nur sichtbare Spalten und Zeilen zeichnen (Frustum Culling)
    const startCol = Math.max(0,              Math.floor(camera.x / ts));
    const endCol   = Math.min(this._cols - 1, Math.ceil((camera.x + CANVAS_WIDTH)  / ts));
    const startRow = Math.max(0,              Math.floor(camera.y / ts));
    const endRow   = Math.min(this._rows - 1, Math.ceil((camera.y + CANVAS_HEIGHT) / ts));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const key  = this._map[row]?.[col];
        if (!key) continue;
        const tile = this._tiles[key];
        if (!tile) continue;

        ctx.drawImage(
          this._tilesetImg,
          tile.txCol * src, tile.txRow * src, src, src,   // Quelle
          col * ts,         row * ts,         ts,  ts     // Ziel (Weltkoord.)
        );
      }
    }
  }

  get width()  { return this._cols * TILE_SIZE; }
  get height() { return this._rows * TILE_SIZE; }
}
