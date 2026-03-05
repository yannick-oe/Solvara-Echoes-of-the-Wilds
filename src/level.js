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

    this.goal = this.createGoalHouse();
    this.switchZone = this.createSwitchZone();
    this.doorTiles = this.createDoorTiles();
    this.resetRuntimeState();

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize);
  } // Ende vom Konstruktor.

  buildSingleLevel() { // Diese Funktion baut die komplette Level-Matrix.
    const width = 132;
    const height = 14;
    const groundRow = 8;

    const tiles = this.createEmptyTiles(width, height);
    this.addStartArea(tiles, groundRow);
    this.addMountainPath(tiles, groundRow);
    this.addCaveEntrance(tiles, groundRow);
    this.addCave(tiles);
    this.addMountainTop(tiles);
    this.addGoalArea(tiles);
    return tiles;
  } // Ende von buildSingleLevel.

  resetRuntimeState() {
    this.switchActivated = false;
    this.doorOpen = false;
    this.closeDoorTiles();
  }

  createGoalHouse() {
    return {
      x: this.tileDisplaySize * 125,
      y: this.tileDisplaySize * 5,
      width: this.tileDisplaySize * 2,
      height: this.tileDisplaySize * 3,
    };
  }

  createSwitchZone() {
    return {
      x: this.tileDisplaySize * 72,
      y: this.tileDisplaySize * 9,
      width: this.tileDisplaySize,
      height: this.tileDisplaySize,
    };
  }

  createDoorTiles() {
    return [
      { col: 80, row: 7 },
      { col: 80, row: 8 },
      { col: 80, row: 9 },
    ];
  }

  closeDoorTiles() {
    for (const tile of this.doorTiles) {
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorClosed);
    }
  }

  openDoorTiles() {
    for (const tile of this.doorTiles) {
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorOpen);
    }
  }

  tryActivateSwitch(playerRect, wantsInteract) {
    if (!wantsInteract || this.switchActivated) return false;
    if (!this.rectsOverlap(playerRect, this.switchZone)) return false;
    this.switchActivated = true;
    this.doorOpen = true;
    this.openDoorTiles();
    return true;
  }

  rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

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

  addStartArea(tiles, groundRow) {
    this.fillGround(tiles, groundRow, 0, 20);
    this.fillGround(tiles, groundRow, 23, 34);
    this.fillPlatform(tiles, 7, 5, 7);
    this.fillPlatform(tiles, 7, 9, 11);
    this.fillPlatform(tiles, 6, 13, 15);
    this.fillPlatform(tiles, 6, 17, 19);
  }

  addMountainPath(tiles, groundRow) {
    this.fillGround(tiles, groundRow, 36, 50);
    this.fillPlatform(tiles, 7, 41, 44);
    this.fillPlatform(tiles, 6, 46, 49);
    this.fillPlatform(tiles, 5, 52, 55);
    this.fillPlatform(tiles, 4, 57, 60);
    this.fillPlatform(tiles, 3, 64, 67);
  }

  addCaveEntrance(tiles, groundRow) {
    this.fillGround(tiles, groundRow + 1, 61, 73);
    this.fillPlatform(tiles, 9, 66, 69);
    this.fillPlatform(tiles, 10, 70, 73);
  }

  addCave(tiles) {
    this.fillGround(tiles, 10, 74, 95);
    this.fillRow(tiles, 11, 74, 95, TILE_ID.dirtMiddleDark);
    this.fillRow(tiles, 9, 84, 86, TILE_ID.spike);
    this.fillRow(tiles, 9, 91, 92, TILE_ID.spike);
    this.fillPlatform(tiles, 8, 75, 78, TILE_ID.grassMiddle);
    this.fillPlatform(tiles, 8, 88, 90, TILE_ID.grassMiddle);
  }

  addMountainTop(tiles) {
    this.fillGround(tiles, 8, 96, 131);
    this.fillPlatform(tiles, 6, 102, 106);
    this.fillPlatform(tiles, 5, 109, 112);
    this.fillPlatform(tiles, 4, 116, 120);
  }

  addGoalArea(tiles) {
    this.fillPlatform(tiles, 7, 123, 126);
    this.fillBlock(tiles, 8, 125, TILE_ID.dirtMiddle);
    this.fillBlock(tiles, 9, 125, TILE_ID.dirtMiddle);
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

  touchesGoalHouse(rect) {
    return this.rectsOverlap(rect, this.goal);
  }

  drawSwitch(ctx, camera) {
    const x = Math.round(this.switchZone.x - camera.x);
    const y = Math.round(this.switchZone.y - camera.y);
    ctx.fillStyle = this.switchActivated ? "#43a047" : "#ff7043";
    ctx.fillRect(x + 14, y + 8, 10, 34);
    ctx.fillRect(x + 6, y + 34, 26, 8);
  }

  drawDoor(ctx, camera) {
    const x = Math.round(this.tileDisplaySize * 80 - camera.x);
    const y = Math.round(this.tileDisplaySize * 7 - camera.y);
    ctx.fillStyle = this.doorOpen ? "#8d6e63" : "#5d4037";
    ctx.fillRect(x, y, this.tileDisplaySize, this.tileDisplaySize * 3);
    if (this.doorOpen) return;
    ctx.fillStyle = "#cfd8dc";
    ctx.fillRect(x + 8, y + 8, 6, 6);
  }

  drawGoalHouse(ctx, camera) {
    const x = Math.round(this.goal.x - camera.x);
    const y = Math.round(this.goal.y - camera.y);
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(x, y, this.goal.width, this.goal.height);
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(x - 6, y - 18, this.goal.width + 12, 20);
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(x + 28, y + 78, 20, 66);
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

    this.drawSwitch(ctx, camera);
    this.drawDoor(ctx, camera);
    this.drawGoalHouse(ctx, camera);
  } // Ende von draw.
} // Ende der Level-Klasse.
