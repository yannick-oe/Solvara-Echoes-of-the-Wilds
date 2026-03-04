import { TileID, TILE_SIZE, TILE_SCALE } from "../src/core/Constants.js";
import { Tilemap } from "./Tilemap.js";

export class Level {
  constructor(tilesetImg, data) {
    this.tilemap = new Tilemap(data.tiles, tilesetImg, TILE_SIZE, TILE_SCALE);
    this.spawnCol = data.spawnCol;
    this.spawnRow = data.spawnRow;
  }

  static async load(levelPath, tilesetImg) {
    try {
      const response = await fetch(levelPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const config = await response.json();
      const data = Level.#buildFromConfig(config);
      return new Level(tilesetImg, data);
    } catch (err) {
      console.warn(`Could not load ${levelPath}. Fallback level will be used.`, err);
      const fallbackData = Level.#buildFromConfig(Level.#defaultConfig());
      return new Level(tilesetImg, fallbackData);
    }
  }

  static #defaultConfig() {
    return {
      width: 80,
      height: 10,
      groundRow: 8,
      spawnCol: 3,
      spawnRow: 7,
      groundSections: [
        [0, 17],
        [21, 41],
        [46, 79],
      ],
      platforms: [
        [6, 26, 31],
        [5, 55, 60],
      ],
    };
  }

  static #buildFromConfig(config) {
    const width = Number.isInteger(config.width) ? config.width : 80;
    const height = Number.isInteger(config.height) ? config.height : 10;
    const groundRow = Number.isInteger(config.groundRow) ? config.groundRow : height - 2;

    const tiles = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        tiles[r][c] = TileID.EMPTY;
      }
    }

    const groundSections = Array.isArray(config.groundSections)
      ? config.groundSections
      : [];

    for (let i = 0; i < groundSections.length; i++) {
      const s = groundSections[i][0];
      const e = groundSections[i][1];
      Level.#fillGround(tiles, groundRow, s, e);
    }

    const platforms = Array.isArray(config.platforms)
      ? config.platforms
      : [];

    for (let i = 0; i < platforms.length; i++) {
      const row = platforms[i][0];
      const s = platforms[i][1];
      const e = platforms[i][2];
      Level.#fillPlatform(tiles, row, s, e);
    }

    const spawnCol = Number.isInteger(config.spawnCol) ? config.spawnCol : 3;
    const spawnRow = Number.isInteger(config.spawnRow) ? config.spawnRow : groundRow - 1;

    return { tiles: tiles, spawnCol: spawnCol, spawnRow: spawnRow };
  }

  static #fillGround(tiles, row, startCol, endCol) {
    if (row < 0 || row >= tiles.length || startCol > endCol) return;
    tiles[row][startCol] = startCol === 0 ? TileID.GRASS_MID : TileID.GRASS_LEFT;
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TileID.GRASS_MID : TileID.GRASS_RIGHT;
    for (let c = startCol + 1; c < endCol; c++) {
      tiles[row][c] = TileID.GRASS_MID;
    }

    if (row + 1 < tiles.length) {
      tiles[row + 1][startCol] = startCol === 0 ? TileID.DIRT : TileID.DIRT_LEFT;
      tiles[row + 1][endCol] = endCol === tiles[row].length - 1 ? TileID.DIRT : TileID.DIRT_RIGHT;
      for (let c = startCol + 1; c < endCol; c++) {
        tiles[row + 1][c] = TileID.DIRT;
      }
    }
  }

  static #fillPlatform(tiles, row, startCol, endCol) {
    if (row < 0 || row >= tiles.length || startCol > endCol) return;
    tiles[row][startCol] = TileID.GRASS_LEFT;
    tiles[row][endCol] = TileID.GRASS_RIGHT;
    for (let c = startCol + 1; c < endCol; c++) {
      tiles[row][c] = TileID.GRASS_MID;
    }
  }
}
