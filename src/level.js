import {
  HAZARD_TILE_IDS,
  SOLID_TILE_IDS,
  TILE_DISPLAY_SIZE,
  TILE_ID,
  TILE_SIZE,
} from "./constants.js";
import {
  DEFAULT_WORLD_PROPS,
  PROP_FRAMES,
  WORLD_PROP_KEYS,
} from "./worldAtlasConfig.js";

// Baut das Solvara-Level auf und liefert Kollision/Interaktionsabfragen fuer Player und Enemies.
export class Level {
  constructor(
    tileSetImage,
    propsAtlasImage,
    uiDoorClosedImage,
    uiDoorOpenImage,
  ) {
    this.tileSetImage = tileSetImage;
    this.propsAtlasImage = propsAtlasImage;
    this.uiDoorClosedImage = uiDoorClosedImage;
    this.uiDoorOpenImage = uiDoorOpenImage;
    this.tileSize = TILE_SIZE;
    this.tileDisplaySize = TILE_DISPLAY_SIZE;
    this.solidTileIds = new Set(SOLID_TILE_IDS);
    this.hazardTileIds = new Set(HAZARD_TILE_IDS);
    this.oneWayTileIds = new Set();
    this.solidPropKeys = new Set(WORLD_PROP_KEYS.solid);
    this.oneWayPropKeys = new Set(WORLD_PROP_KEYS.oneWay);
    this.hazardPropKeys = new Set(WORLD_PROP_KEYS.hazard);
    this.worldProps = [];
    this.solidPropCells = new Set();
    this.oneWayPropCells = new Set();
    this.hazardPropCells = new Set();
    this.tiles = this.buildSingleLevel();
    this.rows = this.tiles.length;
    this.cols = this.tiles[0].length;
    this.pixelWidth = this.cols * this.tileDisplaySize;
    this.pixelHeight = this.rows * this.tileDisplaySize;
    this.spawnX = this.tileDisplaySize * 2;
    this.spawnY = this.tileDisplaySize * 6;
    this.goal = this.createGoalHouse(); // Zielbereich fuer Levelabschluss.
    this.switchZone = this.createSwitchZone(); // Interaktionszone fuer den Schalter.
    this.doorTiles = this.createDoorTiles(); // Tuerkacheln, die zwischen offen/geschlossen wechseln.
    this.setupWorldProps();
    this.resetRuntimeState();
    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize);
  }

  buildSingleLevel() {
    const width = 132;
    const height = 14;
    const groundRow = 8;
    const tiles = this.createEmptyTiles(width, height);
    this.addStartArea(tiles, groundRow);
    this.addMountainPath(tiles, groundRow);
    this.addCaveEntrance(tiles, groundRow);
    this.addCave(tiles);
    this.addMountainTop(tiles);
    this.addGoalArea(tiles); // Reihenfolge bildet Lernkurve: Start -> Anstieg -> Cave -> Ziel.
    return tiles;
  }

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

  setupWorldProps() {
    this.worldProps = DEFAULT_WORLD_PROPS.map((item) =>
      this.createWorldProp(item),
    );
    this.rebuildPropCollisionCells();
  }

  createWorldProp(item) {
    const frame = PROP_FRAMES[item.key];
    const worldX = item.col * this.tileDisplaySize;
    const worldY = item.row * this.tileDisplaySize;
    const worldWidth = Math.round(
      frame.sw * (this.tileDisplaySize / this.tileSize),
    ); // Atlas-Pixel in Welt-Pixel umrechnen.
    const worldHeight = Math.round(
      frame.sh * (this.tileDisplaySize / this.tileSize),
    );
    return {
      key: item.key,
      layer: item.layer,
      frame,
      col: item.col,
      row: item.row,
      x: worldX,
      y: worldY,
      width: worldWidth,
      height: worldHeight,
    };
  }

  rebuildPropCollisionCells() {
    this.solidPropCells.clear();
    this.oneWayPropCells.clear();
    this.hazardPropCells.clear();
    for (const prop of this.worldProps) {
      this.markPropCells(prop);
    }
  }

  markPropCells(prop) {
    const startCol = Math.floor(prop.x / this.tileDisplaySize);
    const endCol = Math.floor((prop.x + prop.width - 1) / this.tileDisplaySize);
    const startRow = Math.floor(prop.y / this.tileDisplaySize);
    const endRow = Math.floor(
      (prop.y + prop.height - 1) / this.tileDisplaySize,
    );
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const key = `${col},${row}`; // Cell-Key fuer schnelle Set-Lookups.
        if (this.solidPropKeys.has(prop.key)) this.solidPropCells.add(key);
        if (this.oneWayPropKeys.has(prop.key)) this.oneWayPropCells.add(key);
        if (this.hazardPropKeys.has(prop.key)) this.hazardPropCells.add(key);
      }
    }
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
    this.openDoorTiles(); // Nach Aktivierung wird die blockierende Tuer durch offene Tiles ersetzt.
    return true;
  }

  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
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

  fillGround(tiles, row, startCol, endCol) {
    tiles[row][startCol] =
      startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft;
    tiles[row][endCol] =
      endCol === tiles[row].length - 1
        ? TILE_ID.grassMiddle
        : TILE_ID.grassRight;
    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = TILE_ID.grassMiddle;
    }

    this.fillRow(tiles, row + 1, startCol, endCol, TILE_ID.dirtMiddle);
    this.fillRow(tiles, row + 2, startCol, endCol, TILE_ID.dirtMiddle);
    this.patchGroundEdges(tiles, row + 1, startCol, endCol);
    this.patchGroundEdges(tiles, row + 2, startCol, endCol); // Seitliche Kanten fuer saubere Dirt-Optik.
  }

  fillPlatform(
    tiles,
    row,
    startCol,
    endCol,
    centerTileId = TILE_ID.grassMiddle,
  ) {
    tiles[row][startCol] = TILE_ID.grassLeft;
    tiles[row][endCol] = TILE_ID.grassRight;
    for (let col = startCol + 1; col < endCol; col++) {
      tiles[row][col] = centerTileId;
    }
  }

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
    tiles[row][startCol] =
      startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft;
    tiles[row][endCol] =
      endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight;
  }

  isSolidTile(col, row) {
    if (col < 0 || col >= this.cols) return true;
    if (row < 0) return true;
    if (row >= this.rows) return false; // Unterhalb der Welt kein unsichtbarer Boden.
    if (this.solidTileIds.has(this.tiles[row][col])) return true;
    return this.solidPropCells.has(`${col},${row}`);
  }

  isOneWayTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows)
      return false;
    if (this.oneWayTileIds.has(this.tiles[row][col])) return true;
    return this.oneWayPropCells.has(`${col},${row}`);
  }

  isHazardTile(col, row) {
    if (col < 0 || col >= this.cols) return false;
    if (row < 0 || row >= this.rows) return false;
    if (this.hazardTileIds.has(this.tiles[row][col])) return true;
    return this.hazardPropCells.has(`${col},${row}`);
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

  drawPropFrame(ctx, frame, x, y, width, height) {
    if (!this.propsAtlasImage || !frame) return;
    ctx.drawImage(
      this.propsAtlasImage,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height),
    );
  }

  drawWorldProps(ctx, camera, layer) {
    for (const prop of this.worldProps) {
      if (layer === "hazard" && prop.layer !== "hazard") continue;
      if (layer === "solid" && prop.layer !== "solid") continue;
      if (layer === "decoration" && prop.layer !== "decoration") continue;
      if (layer === "interactable" && prop.layer !== "interactable") continue;
      this.drawPropFrame(
        ctx,
        prop.frame,
        prop.x - camera.x,
        prop.y - camera.y,
        prop.width,
        prop.height,
      );
    }
  }

  drawSwitch(ctx, camera) {
    const frameKey = this.switchActivated ? "crank-up" : "crank-down"; // Visuelles Feedback fuer Schalterstatus.
    const frame = PROP_FRAMES[frameKey];
    const width = frame.sw * (this.tileDisplaySize / this.tileSize);
    const height = frame.sh * (this.tileDisplaySize / this.tileSize);
    this.drawPropFrame(
      ctx,
      frame,
      this.switchZone.x - camera.x,
      this.switchZone.y - camera.y,
      width,
      height,
    );
  }

  drawDoor(ctx, camera) {
    const x = Math.round(this.tileDisplaySize * 80 - camera.x);
    const y = Math.round(this.tileDisplaySize * 7 - camera.y);
    const image = this.doorOpen ? this.uiDoorOpenImage : this.uiDoorClosedImage;
    if (image) {
      ctx.drawImage(
        image,
        x,
        y,
        this.tileDisplaySize,
        this.tileDisplaySize * 2,
      );
      return; // Bevorzugt separate UI-Tuerbilder, fallback unten auf Atlas-Frame.
    }

    const frame = PROP_FRAMES.door;
    this.drawPropFrame(
      ctx,
      frame,
      x,
      y,
      this.tileDisplaySize,
      this.tileDisplaySize * 2,
    );
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

  draw(ctx, camera) {
    const startCol = Math.max(0, Math.floor(camera.x / this.tileDisplaySize));
    const endCol = Math.min(
      this.cols - 1,
      Math.ceil((camera.x + camera.width) / this.tileDisplaySize),
    );
    for (let row = 0; row < this.rows; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tileId = this.tiles[row][col];
        if (tileId === TILE_ID.empty) continue;
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
          this.tileDisplaySize,
        );
      }
    }

    this.drawWorldProps(ctx, camera, "decoration");
    this.drawWorldProps(ctx, camera, "solid");
    this.drawWorldProps(ctx, camera, "hazard");
    this.drawSwitch(ctx, camera);
    this.drawDoor(ctx, camera);
    this.drawGoalHouse(ctx, camera);
  }
}
