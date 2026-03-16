// #region Imports
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { TILE_REGISTRY, LEGACY_TILE_ALIASES } from '../config/tileConfig.js';
// #endregion

// #region Constants
const LEGACY_LANDING_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};
const LEGACY_FOOTSTEP_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};

const LANDING_SOUND_BY_TILE = buildSoundLookup(LEGACY_LANDING_SOUND_BY_TILE);
const FOOTSTEP_SOUND_BY_TILE = buildSoundLookup(LEGACY_FOOTSTEP_SOUND_BY_TILE);

/**
 * Builds sound lookup supporting both canonical and legacy tile keys.
 * @param {object} legacyLookup Input parameter.
 */
function buildSoundLookup(legacyLookup) {
  const lookup = { ...legacyLookup };
  for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_TILE_ALIASES)) {
    if (!legacyLookup[legacyKey]) continue;
    lookup[canonicalKey] = legacyLookup[legacyKey];
  }
  return lookup;
}
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
    this._tiles      = this._buildTileRegistry(data.tiles ?? {});
    this._cols       = data.meta.columns;
    this._rows       = data.meta.rows;
    this._srcSize    = data.meta.tileSize;
    this._tilesetImg = tilesetImage;
  }

  /**
   * Builds canonical tile registry including legacy aliases.
   * @param {object} customTiles Input parameter.
   */
  _buildTileRegistry(customTiles) {
    const merged = { ...TILE_REGISTRY, ...customTiles };
    for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_TILE_ALIASES)) {
      if (merged[legacyKey] || !merged[canonicalKey]) continue;
      merged[legacyKey] = merged[canonicalKey];
    }
    return merged;
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
    const bounds = this._getVisibleBounds(camera);
    for (let row = bounds.startRow; row <= bounds.endRow; row++) {
      for (let col = bounds.startCol; col <= bounds.endCol; col++) {
        this._drawTile(ctx, row, col, bounds.ts, bounds.src);
      }
    }
  }

  /**
   * Computes visible tile bounds for current camera.
   * @param {object} camera Input parameter.
   */
  _getVisibleBounds(camera) {
    const ts = TILE_SIZE;
    const startCol = Math.max(0, Math.floor(camera.x / ts));
    const endCol = Math.min(this._cols - 1, Math.ceil((camera.x + CANVAS_WIDTH) / ts));
    const startRow = Math.max(0, Math.floor(camera.y / ts));
    const endRow = Math.min(this._rows - 1, Math.ceil((camera.y + CANVAS_HEIGHT) / ts));
    return { startCol, endCol, startRow, endRow, ts, src: this._srcSize };
  }

  /**
   * Draws one tile at map coordinates.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {number} row Input parameter.
   * @param {number} col Input parameter.
   * @param {number} ts Input parameter.
   * @param {number} src Input parameter.
   */
  _drawTile(ctx, row, col, ts, src) {
    const key = this._map[row]?.[col];
    const tile = key ? this._tiles[key] : null;
    if (!tile) return;
    if (tile.bgFill) this._fillTileBackground(ctx, tile.bgFill, col, row, ts);
    ctx.drawImage(this._tilesetImg, tile.txCol * src, tile.txRow * src, src, src, col * ts, row * ts, ts, ts);
  }

  /**
   * Fills tile background color before drawing the sprite.
   * @param {CanvasRenderingContext2D} ctx Input parameter.
   * @param {string} color Input parameter.
   * @param {number} col Input parameter.
   * @param {number} row Input parameter.
   * @param {number} ts Input parameter.
   */
  _fillTileBackground(ctx, color, col, row, ts) {
    ctx.fillStyle = color;
    ctx.fillRect(col * ts, row * ts, ts, ts);
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