// #region Imports
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { TILE_REGISTRY } from '../config/tileConfig.js';
// #endregion

// #region Constants
const LANDING_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};
const FOOTSTEP_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};
// #endregion

// #region Class Definition
export class TileMap {
  /**
   * Creates a new instance.
   * @param {object} data Input parameter.
   * @param {object} tilesetImage Input parameter.
   */
  constructor(data, tilesetImage) {
    this._map        = data.map;
    this._tiles      = { ...TILE_REGISTRY, ...(data.tiles ?? {}) };
    this._cols       = data.meta.columns;
    this._rows       = data.meta.rows;
    this._srcSize    = data.meta.tileSize;
    this._tilesetImg = tilesetImage;
  }

  /**
   * Handles is solid.
   * @param {number} col Input parameter.
   * @param {number} row Input parameter.
   */
  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    const tile = this._tiles[key];
    return tile?.pass === false && !tile?.oneWay;
  }

  /**
   * Handles is one way.
   * @param {number} col Input parameter.
   * @param {number} row Input parameter.
   */
  isOneWay(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.oneWay === true;
  }

  /**
   * Handles is ladder.
   * @param {number} col Input parameter.
   * @param {number} row Input parameter.
   */
  isLadder(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.ladder === true;
  }

  /**
   * Handles is on ladder.
   * @param {number} x Input parameter.
   * @param {number} y Input parameter.
   * @param {number} w Input parameter.
   * @param {number} h Input parameter.
   */
  isOnLadder(x, y, w, h) {
    const ts = TILE_SIZE;
    const midCol = Math.floor((x + w / 2) / ts);
    const topRow    = Math.floor(y / ts);
    const bottomRow = Math.floor((y + h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (this.isLadder(midCol, row)) return true;
    }
    return false;
  }

  /**
   * Handles get landing sound.
   * @param {object} worldX Input parameter.
   * @param {object} feetY Input parameter.
   */
  getLandingSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    return key ? (LANDING_SOUND_BY_TILE[key] ?? null) : null;
  }

  /**
   * Handles get footstep sound.
   * @param {object} worldX Input parameter.
   * @param {object} feetY Input parameter.
   */
  getFootstepSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    return key ? (FOOTSTEP_SOUND_BY_TILE[key] ?? null) : null;
  }

  /**
   * Handles get tile at.
   * @param {object} worldX Input parameter.
   * @param {object} worldY Input parameter.
   */
  getTileAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return null;
    const key = this._map[row]?.[col];
    return key ? (this._tiles[key] ?? null) : null;
  }

  /**
   * Handles draw.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {object} camera Input parameter.
   */
  draw(ctx, camera) {
    if (!this._tilesetImg) return;
    ctx.imageSmoothingEnabled = false;
    const ts  = TILE_SIZE;
    const src = this._srcSize;
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
        if (tile.bgFill) {
          ctx.fillStyle = tile.bgFill;
          ctx.fillRect(col * ts, row * ts, ts, ts);
        }
        ctx.drawImage(
          this._tilesetImg,
          tile.txCol * src, tile.txRow * src, src, src,
          col * ts,         row * ts,         ts,  ts
        );
      }
    }
  }

  /**
   * Gets width.
   */
  get width()  { return this._cols * TILE_SIZE; }
  /**
   * Gets height.
   */
  get height() { return this._rows * TILE_SIZE; }
}
// #endregion