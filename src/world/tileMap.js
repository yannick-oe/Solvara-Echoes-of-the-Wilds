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
   * Gibt true zurück wenn die Gitterzelle vollständig solid (nicht passierbar) ist.
   * One-Way-Plattformen (oneWay: true) gelten NICHT als solid – sie haben eigene Kollisionslogik.
   * Zellen außerhalb der Levelgrenzen gelten als solid.
   */
  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    const tile = this._tiles[key];
    return tile?.pass === false && !tile?.oneWay;
  }

  /**
   * Gibt true zurück wenn die Gitterzelle eine One-Way-Plattform ist
   * (nur von oben begehbar; Durchspringen von unten und seitlich möglich).
   */
  isOneWay(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.oneWay === true;
  }

  /**
   * Gibt true zurück wenn die Gitterzelle eine Leiter ist.
   * Leitern sind passierbar (pass: true) aber kletterbar (ladder: true).
   */
  isLadder(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.ladder === true;
  }

  /**
   * Gibt true zurück wenn der Spieler (AABB) eine Leiter berührt.
   * Überprüft die vier Ecken der Hitbox.
   * @param {number} x  Hitbox-Ursprung X (Weltpixel)
   * @param {number} y  Hitbox-Ursprung Y (Weltpixel)
   * @param {number} w  Hitbox-Breite
   * @param {number} h  Hitbox-Höhe
   */
  isOnLadder(x, y, w, h) {
    const ts = TILE_SIZE;
    // Mittelpunkt horizontal (Leiter muss in der Mitte der Hitbox sein)
    const midCol = Math.floor((x + w / 2) / ts);
    const topRow    = Math.floor(y / ts);
    const bottomRow = Math.floor((y + h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (this.isLadder(midCol, row)) return true;
    }
    return false;
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

    // Pixel-Art: Interpolation beim Atlas-Sampling abschalten
    ctx.imageSmoothingEnabled = false;

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
