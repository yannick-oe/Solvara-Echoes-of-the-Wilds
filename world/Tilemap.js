export class Tilemap {
  constructor(tiles, tilesetImg, tileSize, scale) {
    this.tiles = tiles;
    this.tilesetImg = tilesetImg;
    this.tileSize = tileSize;
    this.scale = scale;
    this.displaySize = tileSize * scale;
    this.rows = tiles.length;
    this.cols = tiles[0].length;
    this.tilesetCols = Math.floor(tilesetImg.width / tileSize);
  }

  getTile(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
    return this.tiles[row][col];
  }

  isSolid(col, row) {
    return this.getTile(col, row) !== 0;
  }

  draw(ctx, camera) {
    const startCol = Math.max(0, Math.floor(camera.x / this.displaySize));
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / this.displaySize));
    const startRow = Math.max(0, Math.floor(camera.y / this.displaySize));
    const endRow = Math.min(this.rows - 1, Math.ceil((camera.y + camera.height) / this.displaySize));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tileId = this.tiles[row][col];
        if (tileId === 0) continue;

        const idx = tileId - 1;
        const srcCol = idx % this.tilesetCols;
        const srcRow = Math.floor(idx / this.tilesetCols);

        const sx = srcCol * this.tileSize;
        const sy = srcRow * this.tileSize;
        const dx = Math.round(col * this.displaySize - camera.x);
        const dy = Math.round(row * this.displaySize - camera.y);

        ctx.drawImage(
          this.tilesetImg,
          sx, sy, this.tileSize, this.tileSize,
          dx, dy, this.displaySize, this.displaySize
        );
      }
    }
  }
}
