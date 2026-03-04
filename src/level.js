import { TILE_DISPLAY_SIZE, TILE_ID, TILE_SIZE } from "./constants.js";

/*
  level.js
  --------
  Builds one tile-based level in code (no JSON yet).
  Responsibilities:
  - create tile matrix
  - expose collision check (isSolidTile)
  - draw visible tile area
*/

export class Level {
  /**
   * @param {HTMLImageElement} tileSetImage Source tileset image.
   */
  constructor(tileSetImage) {
    this.tileSetImage = tileSetImage;
    this.tileSize = TILE_SIZE;
    this.tileDisplaySize = TILE_DISPLAY_SIZE;

    this.tiles = this.buildSingleLevel();
    this.rows = this.tiles.length;
    this.cols = this.tiles[0].length;

    this.pixelWidth = this.cols * this.tileDisplaySize;
    this.pixelHeight = this.rows * this.tileDisplaySize;

    this.spawnX = this.tileDisplaySize * 3;
    this.spawnY = this.tileDisplaySize * 7 - 48;

    this.goal = {
      x: this.pixelWidth - 50,
      y: this.tileDisplaySize * 7,
      width: 18,
      height: this.tileDisplaySize,
    };

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize);
  }

  /**
   * Creates the one beginner level layout.
   */
  buildSingleLevel() {
    const width = 80;
    const height = 10;
    const groundRow = 8;

    const tiles = [];

    for (let row = 0; row < height; row++) {
      tiles[row] = [];
      for (let col = 0; col < width; col++) {
        tiles[row][col] = TILE_ID.empty;
      }
    }

    const groundSections = [
      [0, 17],
      [21, 41],
      [46, 79],
    ];

    for (let i = 0; i < groundSections.length; i++) {
      this.fillGround(tiles, groundRow, groundSections[i][0], groundSections[i][1]);
    }

    this.fillPlatform(tiles, 6, 26, 31);
    this.fillPlatform(tiles, 5, 55, 60);

    return tiles;
  }

  /**
   * Places a ground segment with top grass and lower dirt row.
   * @param {number[][]} tiles Tile matrix.
   * @param {number} row Ground surface row.
   * @param {number} startCol Segment start column.
   * @param {number} endCol Segment end column.
   */
  fillGround(tiles, row, startCol, endCol) {
    tiles[row][startCol] = startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft;
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.grassMiddle : TILE_ID.grassRight;

    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = TILE_ID.grassMiddle;
    }

    if (row + 1 < tiles.length) {
      tiles[row + 1][startCol] = startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft;
      tiles[row + 1][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight;

      for (let col = startCol + 1; col < endCol; col++) {
        tiles[row + 1][col] = TILE_ID.dirtMiddle;
      }
    }
  }

  /**
   * Places a floating platform segment.
   * @param {number[][]} tiles Tile matrix.
   * @param {number} row Platform row.
   * @param {number} startCol Segment start column.
   * @param {number} endCol Segment end column.
   */
  fillPlatform(tiles, row, startCol, endCol) {
    tiles[row][startCol] = TILE_ID.grassLeft;
    tiles[row][endCol] = TILE_ID.grassRight;

    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = TILE_ID.grassMiddle;
    }
  }

  /**
   * Collision helper: out-of-bounds is treated as solid.
   * @param {number} col Tile column.
   * @param {number} row Tile row.
   */
  isSolidTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return true;
    }

    return this.tiles[row][col] !== TILE_ID.empty;
  }

  /**
   * Draws only the currently visible tile columns for better performance.
   * @param {CanvasRenderingContext2D} ctx Render context.
   * @param {{x:number,y:number,width:number,height:number}} camera Camera values.
   */
  draw(ctx, camera) {
    const startCol = Math.max(0, Math.floor(camera.x / this.tileDisplaySize));
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / this.tileDisplaySize));

    for (let row = 0; row < this.rows; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tileId = this.tiles[row][col];
        if (tileId === TILE_ID.empty) continue;

        // Tile ID starts at 1, tileset index starts at 0.
        const sourceIndex = tileId - 1;
        const sourceCol = sourceIndex % this.tileSetColumns;
        const sourceRow = Math.floor(sourceIndex / this.tileSetColumns);

        const sx = sourceCol * this.tileSize;
        const sy = sourceRow * this.tileSize;
        const dx = Math.round(col * this.tileDisplaySize - camera.x);
        const dy = Math.round(row * this.tileDisplaySize - camera.y);

        ctx.drawImage(
          this.tileSetImage,
          sx,
          sy,
          this.tileSize,
          this.tileSize,
          dx,
          dy,
          this.tileDisplaySize,
          this.tileDisplaySize
        );
      }
    }

    ctx.fillStyle = "#ffd54f";
    ctx.fillRect(
      Math.round(this.goal.x - camera.x),
      Math.round(this.goal.y - camera.y),
      this.goal.width,
      this.goal.height
    );
  }
}
