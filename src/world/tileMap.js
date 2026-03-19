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

/** Fallback sound for all solid tiles in walkable categories not listed above. */
const FOOTSTEP_SOUND_BY_CATEGORY = {
  ground:   'assets/audio/sfx/grassLanding.mp3',
  slope:    'assets/audio/sfx/grassLanding.mp3',
  platform: 'assets/audio/sfx/grassLanding.mp3',
  arch:     'assets/audio/sfx/grassLanding.mp3',
  cave:     'assets/audio/sfx/grassLanding.mp3',
  temple:   'assets/audio/sfx/grassLanding.mp3',
};

const LANDING_SOUND_BY_TILE  = buildSoundLookup(LEGACY_LANDING_SOUND_BY_TILE);
const FOOTSTEP_SOUND_BY_TILE = buildSoundLookup(LEGACY_FOOTSTEP_SOUND_BY_TILE);

/** Builds sound Lookup. @param {*} legacyLookup - Legacy Lookup value. @returns {*} - Resulting value. */
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
/** Creates a new instance. @param {*} data - Data value. @param {*} tilesetImage - Tileset Image value. @returns {void} - Nothing. */
  constructor(data, tilesetImage) {
    this._map        = data.map;
    this._tiles      = this._buildTileRegistry(data.tiles ?? {});
    this._cols       = data.meta.columns;
    this._rows       = data.meta.rows;
    this._srcSize    = data.meta.tileSize;
    this._tilesetImg = tilesetImage;
  }

/** Builds tile Registry. @param {*} customTiles - Custom Tiles value. @returns {*} - Resulting value. */
  _buildTileRegistry(customTiles) {
    const merged = { ...TILE_REGISTRY, ...customTiles };
    for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_TILE_ALIASES)) {
      if (merged[legacyKey] || !merged[canonicalKey]) continue;
      merged[legacyKey] = merged[canonicalKey];
    }
    return merged;
  }

/** Checks whether solid. @param {*} col - Col value. @param {*} row - Row value. @returns {boolean} - Whether the check passes. */
  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    const tile = this._tiles[key];
    return tile?.pass === false && !tile?.oneWay;
  }

/** Checks whether one Way. @param {*} col - Col value. @param {*} row - Row value. @returns {boolean} - Whether the check passes. */
  isOneWay(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.oneWay === true;
  }

/** Checks whether ladder. @param {*} col - Col value. @param {*} row - Row value. @returns {boolean} - Whether the check passes. */
  isLadder(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.ladder === true;
  }

/** Checks whether on Ladder. @param {*} x - X value. @param {*} y - Y value. @param {*} w - W value. @param {*} h - H value. @returns {boolean} - Whether the check passes. */
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

/** Gets landing Sound. @param {*} worldX - World X value. @param {*} feetY - Feet Y value. @returns {*} - Resulting value. */
  getLandingSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    if (!key) return null;
    const tile = this._tiles[key];
    if (!tile || tile.pass !== false) return null;
    return LANDING_SOUND_BY_TILE[key] ?? FOOTSTEP_SOUND_BY_CATEGORY[tile.category] ?? null;
  }

/** Gets footstep Sound. @param {*} worldX - World X value. @param {*} feetY - Feet Y value. @returns {*} - Resulting value. */
  getFootstepSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    if (!key) return null;
    const tile = this._tiles[key];
    if (!tile || tile.pass !== false) return null;
    return FOOTSTEP_SOUND_BY_TILE[key] ?? FOOTSTEP_SOUND_BY_CATEGORY[tile.category] ?? null;
  }

/** Gets tile At. @param {*} worldX - World X value. @param {*} worldY - World Y value. @returns {*} - Resulting value. */
  getTileAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return null;
    const key = this._map[row]?.[col];
    return key ? (this._tiles[key] ?? null) : null;
  }

/** Handles draw. @param {*} ctx - Ctx value. @param {*} camera - Current camera instance. @returns {void} - Nothing. */
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

/** Gets visible Bounds. @param {*} camera - Current camera instance. @returns {*} - Resulting value. */
  _getVisibleBounds(camera) {
    const ts = TILE_SIZE;
    const startCol = Math.max(0, Math.floor(camera.x / ts));
    const endCol = Math.min(this._cols - 1, Math.ceil((camera.x + CANVAS_WIDTH) / ts));
    const startRow = Math.max(0, Math.floor(camera.y / ts));
    const endRow = Math.min(this._rows - 1, Math.ceil((camera.y + CANVAS_HEIGHT) / ts));
    return { startCol, endCol, startRow, endRow, ts, src: this._srcSize };
  }

/** Draws tile. @param {*} ctx - Ctx value. @param {*} row - Row value. @param {*} col - Col value. @param {*} ts - Ts value. @param {*} src - Src value. @returns {void} - Nothing. */
  _drawTile(ctx, row, col, ts, src) {
    const key = this._map[row]?.[col];
    const tile = key ? this._tiles[key] : null;
    if (!tile) return;
    if (tile.bgFill) this._fillTileBackground(ctx, tile.bgFill, col, row, ts);
    ctx.drawImage(this._tilesetImg, tile.txCol * src, tile.txRow * src, src, src, col * ts, row * ts, ts, ts);
  }

/** Handles fill Tile Background. @param {*} ctx - Ctx value. @param {*} color - Color value. @param {*} col - Col value. @param {*} row - Row value. @param {*} ts - Ts value. @returns {void} - Nothing. */
  _fillTileBackground(ctx, color, col, row, ts) {
    ctx.fillStyle = color;
    ctx.fillRect(col * ts, row * ts, ts, ts);
  }

/** Gets width. @returns {number} - Current value. */
  get width()  { return this._cols * TILE_SIZE; }
/** Gets height. @returns {number} - Current value. */
  get height() { return this._rows * TILE_SIZE; }
}
// #endregion