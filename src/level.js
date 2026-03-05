import {
  HAZARD_TILE_IDS,
  SOLID_TILE_IDS,
  TILE_DISPLAY_SIZE,
  TILE_ID,
  TILE_SIZE,
} from "./constants.js";

export class Level { // Diese Klasse baut und zeichnet unser Level.
  constructor(tileSetImage) { // Hier starten wir das Level mit dem Tileset-Bild.
    this.tileSetImage = tileSetImage;
    this.tileSize = TILE_SIZE;
    this.tileDisplaySize = TILE_DISPLAY_SIZE;
    this.solidTileIds = new Set(SOLID_TILE_IDS);
    this.hazardTileIds = new Set(HAZARD_TILE_IDS);

    this.tiles = this.buildSingleLevel();
    this.rows = this.tiles.length;
    this.cols = this.tiles[0].length;
    this.pixelWidth = this.cols * this.tileDisplaySize;
    this.pixelHeight = this.rows * this.tileDisplaySize;

    this.spawnX = this.tileDisplaySize * 2;
    this.spawnY = this.tileDisplaySize * 6;

    this.goal = {
      x: this.pixelWidth - this.tileDisplaySize * 2,
      y: this.tileDisplaySize * 3,
      width: 20,
      height: this.tileDisplaySize,
    };

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize);
  } // Ende vom Konstruktor.

  buildSingleLevel() { // Diese Funktion baut die komplette Level-Matrix.
    const width = 80;
    const height = 12;
    const groundRow = 8;

    const tiles = this.createEmptyTiles(width, height);
    this.addGroundSegments(tiles, groundRow);
    this.addTrainingPlatforms(tiles);
    this.addVerticalChallenge(tiles);
    this.addGoalTower(tiles);
    return tiles;
  } // Ende von buildSingleLevel.

  createEmptyTiles(width, height) {
    const tiles = [];
    for (let row = 0; row < height; row++) {
      tiles[row] = [];
      for (let col = 0; col < width; col++) {
        tiles[row][col] = TILE_ID.empty;
      }
    }
    return tiles;
  }

  addGroundSegments(tiles, row) {
    const groundSegments = [[0, 13], [16, 29], [33, 47], [51, 79]];
    for (const [startCol, endCol] of groundSegments) {
      this.fillGround(tiles, row, startCol, endCol);
    }
  }

  addTrainingPlatforms(tiles) {
    this.fillPlatform(tiles, 7, 18, 22, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 6, 25, 29, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 5, 33, 36, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 7, 40, 43, TILE_ID.grassMiddle);
  }

  addVerticalChallenge(tiles) {
    this.fillPlatform(tiles, 6, 53, 57, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 5, 60, 63, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 4, 66, 69, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 3, 72, 75, TILE_ID.grassMiddle);
  }

  addGoalTower(tiles) {
    this.fillPlatform(tiles, 3, 76, 79, TILE_ID.grassMiddle);
    this.fillBlock(tiles, 4, 78, TILE_ID.dirtMiddle);
    this.fillBlock(tiles, 5, 78, TILE_ID.dirtMiddle);
    this.fillBlock(tiles, 6, 78, TILE_ID.dirtMiddle);
  }

  fillGround(tiles, row, startCol, endCol) { // Diese Funktion baut ein Bodenstück mit Gras oben und Dreck darunter.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft;
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.grassMiddle : TILE_ID.grassRight;

    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = TILE_ID.grassMiddle;
    }

    this.fillRow(tiles, row + 1, startCol, endCol, TILE_ID.dirtMiddle);
    this.fillRow(tiles, row + 2, startCol, endCol, TILE_ID.dirtMiddle);
    this.patchGroundEdges(tiles, row + 1, startCol, endCol);
    this.patchGroundEdges(tiles, row + 2, startCol, endCol);
  } // Ende von fillGround.

  fillPlatform(tiles, row, startCol, endCol, centerTileId = TILE_ID.grassMiddle) {
    tiles[row][startCol] = TILE_ID.grassLeft;
    tiles[row][endCol] = TILE_ID.grassRight;

    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = centerTileId;
    }
  } // Ende von fillPlatform.

  fillRow(tiles, row, startCol, endCol, tileId) {
    if (row < 0 || row >= tiles.length) return;
    for (let col = startCol; col <= endCol; col++) {
      if (col < 0 || col >= tiles[row].length) continue;
      tiles[row][col] = tileId;
    }
  }

  fillBlock(tiles, row, col, tileId) {
    if (row < 0 || row >= tiles.length) return;
    if (col < 0 || col >= tiles[row].length) return;
    tiles[row][col] = tileId;
  }

  patchGroundEdges(tiles, row, startCol, endCol) {
    if (row < 0 || row >= tiles.length) return;
    tiles[row][startCol] = startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft;
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight;
  }

  isSolidTile(col, row) { // Diese Funktion prüft, ob ein Tile fest ist.
    if (col < 0 || col >= this.cols) return true;
    if (row < 0) return true;
    if (row >= this.rows) return false;
    return this.solidTileIds.has(this.tiles[row][col]);
  } // Ende von isSolidTile.

  isHazardTile(col, row) {
    if (col < 0 || col >= this.cols) return false;
    if (row < 0 || row >= this.rows) return false;
    return this.hazardTileIds.has(this.tiles[row][col]);
  }

  rectTouchesHazard(x, y, width, height) {
    const leftCol = Math.floor(x / this.tileDisplaySize);
    const rightCol = Math.floor((x + width - 1) / this.tileDisplaySize);
    const topRow = Math.floor(y / this.tileDisplaySize);
    const bottomRow = Math.floor((y + height - 1) / this.tileDisplaySize);

    for (let row = topRow; row <= bottomRow; row++) {
      for (let col = leftCol; col <= rightCol; col++) {
        if (this.isHazardTile(col, row)) return true;
      }
    }
    return false;
  }

  draw(ctx, camera) { // Diese Funktion zeichnet sichtbare Level-Tiles.
    const startCol = Math.max(0, Math.floor(camera.x / this.tileDisplaySize)); // Erste sichtbare Spalte links.
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / this.tileDisplaySize)); // Letzte sichtbare Spalte rechts.

    for (let row = 0; row < this.rows; row++) { // Wir gehen jede Reihe durch.
      for (let col = startCol; col <= endCol; col++) { // Wir gehen nur sichtbare Spalten durch.
        const tileId = this.tiles[row][col]; // Tile-Nummer holen.
        if (tileId === TILE_ID.empty) continue; // Luft zeichnen wir nicht.

        const sourceIndex = tileId - 1; // Tile-ID startet bei 1, Bildindex bei 0.
        const sourceCol = sourceIndex % this.tileSetColumns; // Spalte im Tileset ausrechnen.
        const sourceRow = Math.floor(sourceIndex / this.tileSetColumns); // Reihe im Tileset ausrechnen.

        const sx = sourceCol * this.tileSize; // Start-X im Tileset-Bild.
        const sy = sourceRow * this.tileSize; // Start-Y im Tileset-Bild.
        const dx = Math.round(col * this.tileDisplaySize - camera.x); // Ziel-X auf dem Bildschirm.
        const dy = Math.round(row * this.tileDisplaySize - camera.y); // Ziel-Y auf dem Bildschirm.

        ctx.drawImage( // Wir zeichnen das Tile-Bild.
          this.tileSetImage, // Quelle: das große Tileset.
          sx, // Quell-X im Tileset.
          sy, // Quell-Y im Tileset.
          this.tileSize, // Quell-Breite eines Tiles.
          this.tileSize, // Quell-Höhe eines Tiles.
          dx, // Ziel-X auf Canvas.
          dy, // Ziel-Y auf Canvas.
          this.tileDisplaySize, // Ziel-Breite (skaliert).
          this.tileDisplaySize // Ziel-Höhe (skaliert).
        ); // Ende drawImage.
      } // Ende Spalten-Schleife.
    } // Ende Reihen-Schleife.

    ctx.fillStyle = "#ffd54f"; // Farbe für das Ziel setzen.
    ctx.fillRect( // Ziel-Rechteck zeichnen.
      Math.round(this.goal.x - camera.x), // Ziel-X auf Bildschirm.
      Math.round(this.goal.y - camera.y), // Ziel-Y auf Bildschirm.
      this.goal.width, // Ziel-Breite.
      this.goal.height // Ziel-Höhe.
    ); // Ende Ziel-Zeichnen.
  } // Ende von draw.
} // Ende der Level-Klasse.
