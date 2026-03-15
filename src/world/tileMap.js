import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { TILE_REGISTRY } from '../config/tileConfig.js';

const LANDING_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};

const FOOTSTEP_SOUND_BY_TILE = {
  g: 'assets/audio/sfx/grassLanding.mp3',
  d: 'assets/audio/sfx/grassLanding.mp3',
};

export class TileMap {

  constructor(data, tilesetImage) {
    this._map        = data.map;

    this._tiles      = { ...TILE_REGISTRY, ...(data.tiles ?? {}) };
    this._cols       = data.meta.columns;
    this._rows       = data.meta.rows;
    this._srcSize    = data.meta.tileSize;
    this._tilesetImg = tilesetImage;
  }

  isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return true;
    const key = this._map[row]?.[col];
    if (!key) return false;
    const tile = this._tiles[key];
    return tile?.pass === false && !tile?.oneWay;
  }

  isOneWay(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.oneWay === true;
  }

  isLadder(col, row) {
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return false;
    const key = this._map[row]?.[col];
    if (!key) return false;
    return this._tiles[key]?.ladder === true;
  }

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

  getLandingSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    return key ? (LANDING_SOUND_BY_TILE[key] ?? null) : null;
  }

  getFootstepSound(worldX, feetY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(feetY  / TILE_SIZE);
    const key = this._map[row]?.[col];
    return key ? (FOOTSTEP_SOUND_BY_TILE[key] ?? null) : null;
  }

  getTileAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (col < 0 || row < 0 || col >= this._cols || row >= this._rows) return null;
    const key = this._map[row]?.[col];
    return key ? (this._tiles[key] ?? null) : null;
  }

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

  get width()  { return this._cols * TILE_SIZE; }
  get height() { return this._rows * TILE_SIZE; }
}
