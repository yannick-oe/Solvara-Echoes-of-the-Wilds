import { // Import a dependency used in this file.
  HAZARD_TILE_IDS, // Execute this step in the current flow.
  SOLID_TILE_IDS, // Execute this step in the current flow.
  TILE_DISPLAY_SIZE, // Execute this step in the current flow.
  TILE_ID, // Execute this step in the current flow.
  TILE_SIZE, // Execute this step in the current flow.
} from "./constants.js"; // Execute this step in the current flow.
import { // Import a dependency used in this file.
  DEFAULT_WORLD_PROPS, // Execute this step in the current flow.
  PROP_FRAMES, // Execute this step in the current flow.
  WORLD_PROP_KEYS, // Execute this step in the current flow.
} from "./worldAtlasConfig.js"; // Execute this step in the current flow.

export class Level { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor(tileSetImage, propsAtlasImage, uiDoorClosedImage, uiDoorOpenImage) { // Execute this step in the current flow.
    this.tileSetImage = tileSetImage; // Store data on the current object instance.
    this.propsAtlasImage = propsAtlasImage; // Store data on the current object instance.
    this.uiDoorClosedImage = uiDoorClosedImage; // Store data on the current object instance.
    this.uiDoorOpenImage = uiDoorOpenImage; // Store data on the current object instance.
    this.tileSize = TILE_SIZE; // Store data on the current object instance.
    this.tileDisplaySize = TILE_DISPLAY_SIZE; // Store data on the current object instance.
    this.solidTileIds = new Set(SOLID_TILE_IDS); // Store data on the current object instance.
    this.hazardTileIds = new Set(HAZARD_TILE_IDS); // Store data on the current object instance.
    this.oneWayTileIds = new Set(); // Store data on the current object instance.

    this.solidPropKeys = new Set(WORLD_PROP_KEYS.solid); // Store data on the current object instance.
    this.oneWayPropKeys = new Set(WORLD_PROP_KEYS.oneWay); // Store data on the current object instance.
    this.hazardPropKeys = new Set(WORLD_PROP_KEYS.hazard); // Store data on the current object instance.
    this.worldProps = []; // Store data on the current object instance.
    this.solidPropCells = new Set(); // Store data on the current object instance.
    this.oneWayPropCells = new Set(); // Store data on the current object instance.
    this.hazardPropCells = new Set(); // Store data on the current object instance.

    this.tiles = this.buildSingleLevel(); // Store data on the current object instance.
    this.rows = this.tiles.length; // Store data on the current object instance.
    this.cols = this.tiles[0].length; // Store data on the current object instance.
    this.pixelWidth = this.cols * this.tileDisplaySize; // Store data on the current object instance.
    this.pixelHeight = this.rows * this.tileDisplaySize; // Store data on the current object instance.

    this.spawnX = this.tileDisplaySize * 2; // Store data on the current object instance.
    this.spawnY = this.tileDisplaySize * 6; // Store data on the current object instance.

    this.goal = this.createGoalHouse(); // Store data on the current object instance.
    this.switchZone = this.createSwitchZone(); // Store data on the current object instance.
    this.doorTiles = this.createDoorTiles(); // Store data on the current object instance.
    this.setupWorldProps(); // Call a function to perform this step.
    this.resetRuntimeState(); // Call a function to perform this step.

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize); // Store data on the current object instance.
  }

  // This function handles the buildSingleLevel behavior in this file.
  buildSingleLevel() { // Execute this step in the current flow.
    const width = 132; // Create a local constant for this scope.
    const height = 14; // Create a local constant for this scope.
    const groundRow = 8; // Create a local constant for this scope.

    const tiles = this.createEmptyTiles(width, height); // Create a local constant for this scope.
    this.addStartArea(tiles, groundRow); // Call a function to perform this step.
    this.addMountainPath(tiles, groundRow); // Call a function to perform this step.
    this.addCaveEntrance(tiles, groundRow); // Call a function to perform this step.
    this.addCave(tiles); // Call a function to perform this step.
    this.addMountainTop(tiles); // Call a function to perform this step.
    this.addGoalArea(tiles); // Call a function to perform this step.
    return tiles; // Return control (and optionally a value) to the caller.
  }

  // This function handles the resetRuntimeState behavior in this file.
  resetRuntimeState() { // Execute this step in the current flow.
    this.switchActivated = false; // Store data on the current object instance.
    this.doorOpen = false; // Store data on the current object instance.
    this.closeDoorTiles(); // Call a function to perform this step.
  }

  // This function handles the createGoalHouse behavior in this file.
  createGoalHouse() { // Execute this step in the current flow.
    return { // Return control (and optionally a value) to the caller.
      x: this.tileDisplaySize * 125, // Execute this step in the current flow.
      y: this.tileDisplaySize * 5, // Execute this step in the current flow.
      width: this.tileDisplaySize * 2, // Execute this step in the current flow.
      height: this.tileDisplaySize * 3, // Execute this step in the current flow.
    };
  }

  // This function handles the createSwitchZone behavior in this file.
  createSwitchZone() { // Execute this step in the current flow.
    return { // Return control (and optionally a value) to the caller.
      x: this.tileDisplaySize * 72, // Execute this step in the current flow.
      y: this.tileDisplaySize * 9, // Execute this step in the current flow.
      width: this.tileDisplaySize, // Execute this step in the current flow.
      height: this.tileDisplaySize, // Execute this step in the current flow.
    };
  }

  // This function handles the createDoorTiles behavior in this file.
  createDoorTiles() { // Execute this step in the current flow.
    return [ // Return control (and optionally a value) to the caller.
      { col: 80, row: 7 }, // Execute this step in the current flow.
      { col: 80, row: 8 }, // Execute this step in the current flow.
      { col: 80, row: 9 }, // Execute this step in the current flow.
    ]; // Execute this step in the current flow.
  }

  // This function handles the setupWorldProps behavior in this file.
  setupWorldProps() { // Execute this step in the current flow.
    this.worldProps = DEFAULT_WORLD_PROPS.map((item) => this.createWorldProp(item)); // Store data on the current object instance.
    this.rebuildPropCollisionCells(); // Call a function to perform this step.
  }

  // This function handles the createWorldProp behavior in this file.
  createWorldProp(item) { // Execute this step in the current flow.
    const frame = PROP_FRAMES[item.key]; // Create a local constant for this scope.
    const worldX = item.col * this.tileDisplaySize; // Create a local constant for this scope.
    const worldY = item.row * this.tileDisplaySize; // Create a local constant for this scope.
    const worldWidth = Math.round(frame.sw * (this.tileDisplaySize / this.tileSize)); // Create a local constant for this scope.
    const worldHeight = Math.round(frame.sh * (this.tileDisplaySize / this.tileSize)); // Create a local constant for this scope.
    return { // Return control (and optionally a value) to the caller.
      key: item.key, // Execute this step in the current flow.
      layer: item.layer, // Execute this step in the current flow.
      frame, // Execute this step in the current flow.
      col: item.col, // Execute this step in the current flow.
      row: item.row, // Execute this step in the current flow.
      x: worldX, // Execute this step in the current flow.
      y: worldY, // Execute this step in the current flow.
      width: worldWidth, // Execute this step in the current flow.
      height: worldHeight, // Execute this step in the current flow.
    };
  }

  // This function handles the rebuildPropCollisionCells behavior in this file.
  rebuildPropCollisionCells() { // Execute this step in the current flow.
    this.solidPropCells.clear(); // Call a function to perform this step.
    this.oneWayPropCells.clear(); // Call a function to perform this step.
    this.hazardPropCells.clear(); // Call a function to perform this step.
    // This function handles the for behavior in this file.
    for (const prop of this.worldProps) { // Iterate through items or indices in a loop.
      this.markPropCells(prop); // Call a function to perform this step.
    }
  }

  // This function handles the markPropCells behavior in this file.
  markPropCells(prop) { // Execute this step in the current flow.
    const startCol = Math.floor(prop.x / this.tileDisplaySize); // Create a local constant for this scope.
    const endCol = Math.floor((prop.x + prop.width - 1) / this.tileDisplaySize); // Create a local constant for this scope.
    const startRow = Math.floor(prop.y / this.tileDisplaySize); // Create a local constant for this scope.
    const endRow = Math.floor((prop.y + prop.height - 1) / this.tileDisplaySize); // Create a local constant for this scope.

    // This function handles the for behavior in this file.
    for (let row = startRow; row <= endRow; row++) { // Iterate through items or indices in a loop.
      // This function handles the for behavior in this file.
      for (let col = startCol; col <= endCol; col++) { // Iterate through items or indices in a loop.
        const key = `${col},${row}`; // Create a local constant for this scope.
        if (this.solidPropKeys.has(prop.key)) this.solidPropCells.add(key); // Check a condition before executing this block.
        if (this.oneWayPropKeys.has(prop.key)) this.oneWayPropCells.add(key); // Check a condition before executing this block.
        if (this.hazardPropKeys.has(prop.key)) this.hazardPropCells.add(key); // Check a condition before executing this block.
      }
    }
  }

  // This function handles the closeDoorTiles behavior in this file.
  closeDoorTiles() { // Execute this step in the current flow.
    // This function handles the for behavior in this file.
    for (const tile of this.doorTiles) { // Iterate through items or indices in a loop.
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorClosed); // Call a function to perform this step.
    }
  }

  // This function handles the openDoorTiles behavior in this file.
  openDoorTiles() { // Execute this step in the current flow.
    // This function handles the for behavior in this file.
    for (const tile of this.doorTiles) { // Iterate through items or indices in a loop.
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorOpen); // Call a function to perform this step.
    }
  }

  // This function handles the tryActivateSwitch behavior in this file.
  tryActivateSwitch(playerRect, wantsInteract) { // Execute this step in the current flow.
    if (!wantsInteract || this.switchActivated) return false; // Check a condition before executing this block.
    if (!this.rectsOverlap(playerRect, this.switchZone)) return false; // Check a condition before executing this block.
    this.switchActivated = true; // Store data on the current object instance.
    this.doorOpen = true; // Store data on the current object instance.
    this.openDoorTiles(); // Call a function to perform this step.
    return true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the rectsOverlap behavior in this file.
  rectsOverlap(a, b) { // Execute this step in the current flow.
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; // Return control (and optionally a value) to the caller.
  }

  // This function handles the createEmptyTiles behavior in this file.
  createEmptyTiles(width, height) { // Execute this step in the current flow.
    const tiles = []; // Create a local constant for this scope.
    // This function handles the for behavior in this file.
    for (let row = 0; row < height; row++) { // Iterate through items or indices in a loop.
      tiles[row] = []; // Compute and store a value for later use.
      // This function handles the for behavior in this file.
      for (let col = 0; col < width; col++) { // Iterate through items or indices in a loop.
        tiles[row][col] = TILE_ID.empty; // Compute and store a value for later use.
      }
    }
    return tiles; // Return control (and optionally a value) to the caller.
  }

  // This function handles the addStartArea behavior in this file.
  addStartArea(tiles, groundRow) { // Execute this step in the current flow.
    this.fillGround(tiles, groundRow, 0, 20); // Call a function to perform this step.
    this.fillGround(tiles, groundRow, 23, 34); // Call a function to perform this step.
    this.fillPlatform(tiles, 7, 5, 7); // Call a function to perform this step.
    this.fillPlatform(tiles, 7, 9, 11); // Call a function to perform this step.
    this.fillPlatform(tiles, 6, 13, 15); // Call a function to perform this step.
    this.fillPlatform(tiles, 6, 17, 19); // Call a function to perform this step.
  }

  // This function handles the addMountainPath behavior in this file.
  addMountainPath(tiles, groundRow) { // Execute this step in the current flow.
    this.fillGround(tiles, groundRow, 36, 50); // Call a function to perform this step.
    this.fillPlatform(tiles, 7, 41, 44); // Call a function to perform this step.
    this.fillPlatform(tiles, 6, 46, 49); // Call a function to perform this step.
    this.fillPlatform(tiles, 5, 52, 55); // Call a function to perform this step.
    this.fillPlatform(tiles, 4, 57, 60); // Call a function to perform this step.
    this.fillPlatform(tiles, 3, 64, 67); // Call a function to perform this step.
  }

  // This function handles the addCaveEntrance behavior in this file.
  addCaveEntrance(tiles, groundRow) { // Execute this step in the current flow.
    this.fillGround(tiles, groundRow + 1, 61, 73); // Call a function to perform this step.
    this.fillPlatform(tiles, 9, 66, 69); // Call a function to perform this step.
    this.fillPlatform(tiles, 10, 70, 73); // Call a function to perform this step.
  }

  // This function handles the addCave behavior in this file.
  addCave(tiles) { // Execute this step in the current flow.
    this.fillGround(tiles, 10, 74, 95); // Call a function to perform this step.
    this.fillRow(tiles, 11, 74, 95, TILE_ID.dirtMiddleDark); // Call a function to perform this step.
    this.fillRow(tiles, 9, 84, 86, TILE_ID.spike); // Call a function to perform this step.
    this.fillRow(tiles, 9, 91, 92, TILE_ID.spike); // Call a function to perform this step.
    this.fillPlatform(tiles, 8, 75, 78, TILE_ID.grassMiddle); // Call a function to perform this step.
    this.fillPlatform(tiles, 8, 88, 90, TILE_ID.grassMiddle); // Call a function to perform this step.
  }

  // This function handles the addMountainTop behavior in this file.
  addMountainTop(tiles) { // Execute this step in the current flow.
    this.fillGround(tiles, 8, 96, 131); // Call a function to perform this step.
    this.fillPlatform(tiles, 6, 102, 106); // Call a function to perform this step.
    this.fillPlatform(tiles, 5, 109, 112); // Call a function to perform this step.
    this.fillPlatform(tiles, 4, 116, 120); // Call a function to perform this step.
  }

  // This function handles the addGoalArea behavior in this file.
  addGoalArea(tiles) { // Execute this step in the current flow.
    this.fillPlatform(tiles, 7, 123, 126); // Call a function to perform this step.
    this.fillBlock(tiles, 8, 125, TILE_ID.dirtMiddle); // Call a function to perform this step.
    this.fillBlock(tiles, 9, 125, TILE_ID.dirtMiddle); // Call a function to perform this step.
  }

  // This function handles the fillGround behavior in this file.
  fillGround(tiles, row, startCol, endCol) { // Execute this step in the current flow.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft; // Compute and store a value for later use.
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.grassMiddle : TILE_ID.grassRight; // Compute and store a value for later use.

    // This function handles the for behavior in this file.
    for (let col = startCol + 1; col < endCol; col++) { // Iterate through items or indices in a loop.
      tiles[row][col] = TILE_ID.grassMiddle; // Compute and store a value for later use.
    }

    this.fillRow(tiles, row + 1, startCol, endCol, TILE_ID.dirtMiddle); // Call a function to perform this step.
    this.fillRow(tiles, row + 2, startCol, endCol, TILE_ID.dirtMiddle); // Call a function to perform this step.
    this.patchGroundEdges(tiles, row + 1, startCol, endCol); // Call a function to perform this step.
    this.patchGroundEdges(tiles, row + 2, startCol, endCol); // Call a function to perform this step.
  }

  // This function handles the fillPlatform behavior in this file.
  fillPlatform(tiles, row, startCol, endCol, centerTileId = TILE_ID.grassMiddle) { // Compute and store a value for later use.
    tiles[row][startCol] = TILE_ID.grassLeft; // Compute and store a value for later use.
    tiles[row][endCol] = TILE_ID.grassRight; // Compute and store a value for later use.

    // This function handles the for behavior in this file.
    for (let col = startCol + 1; col < endCol; col++) { // Iterate through items or indices in a loop.
      tiles[row][col] = centerTileId; // Compute and store a value for later use.
    }
  }

  // This function handles the fillRow behavior in this file.
  fillRow(tiles, row, startCol, endCol, tileId) { // Execute this step in the current flow.
    if (row < 0 || row >= tiles.length) return; // Check a condition before executing this block.
    // This function handles the for behavior in this file.
    for (let col = startCol; col <= endCol; col++) { // Iterate through items or indices in a loop.
      if (col < 0 || col >= tiles[row].length) continue; // Check a condition before executing this block.
      tiles[row][col] = tileId; // Compute and store a value for later use.
    }
  }

  // This function handles the fillBlock behavior in this file.
  fillBlock(tiles, row, col, tileId) { // Execute this step in the current flow.
    if (row < 0 || row >= tiles.length) return; // Check a condition before executing this block.
    if (col < 0 || col >= tiles[row].length) return; // Check a condition before executing this block.
    tiles[row][col] = tileId; // Compute and store a value for later use.
  }

  // This function handles the patchGroundEdges behavior in this file.
  patchGroundEdges(tiles, row, startCol, endCol) { // Execute this step in the current flow.
    if (row < 0 || row >= tiles.length) return; // Check a condition before executing this block.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft; // Compute and store a value for later use.
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight; // Compute and store a value for later use.
  }

  // This function handles the isSolidTile behavior in this file.
  isSolidTile(col, row) { // Execute this step in the current flow.
    if (col < 0 || col >= this.cols) return true; // Check a condition before executing this block.
    if (row < 0) return true; // Check a condition before executing this block.
    if (row >= this.rows) return false; // Check a condition before executing this block.
    if (this.solidTileIds.has(this.tiles[row][col])) return true; // Check a condition before executing this block.
    return this.solidPropCells.has(`${col},${row}`); // Return control (and optionally a value) to the caller.
  }

  // This function handles the isOneWayTile behavior in this file.
  isOneWayTile(col, row) { // Execute this step in the current flow.
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false; // Check a condition before executing this block.
    if (this.oneWayTileIds.has(this.tiles[row][col])) return true; // Check a condition before executing this block.
    return this.oneWayPropCells.has(`${col},${row}`); // Return control (and optionally a value) to the caller.
  }

  // This function handles the isHazardTile behavior in this file.
  isHazardTile(col, row) { // Execute this step in the current flow.
    if (col < 0 || col >= this.cols) return false; // Check a condition before executing this block.
    if (row < 0 || row >= this.rows) return false; // Check a condition before executing this block.
    if (this.hazardTileIds.has(this.tiles[row][col])) return true; // Check a condition before executing this block.
    return this.hazardPropCells.has(`${col},${row}`); // Return control (and optionally a value) to the caller.
  }

  // This function handles the rectTouchesHazard behavior in this file.
  rectTouchesHazard(x, y, width, height) { // Execute this step in the current flow.
    const leftCol = Math.floor(x / this.tileDisplaySize); // Create a local constant for this scope.
    const rightCol = Math.floor((x + width - 1) / this.tileDisplaySize); // Create a local constant for this scope.
    const topRow = Math.floor(y / this.tileDisplaySize); // Create a local constant for this scope.
    const bottomRow = Math.floor((y + height - 1) / this.tileDisplaySize); // Create a local constant for this scope.

    // This function handles the for behavior in this file.
    for (let row = topRow; row <= bottomRow; row++) { // Iterate through items or indices in a loop.
      // This function handles the for behavior in this file.
      for (let col = leftCol; col <= rightCol; col++) { // Iterate through items or indices in a loop.
        if (this.isHazardTile(col, row)) return true; // Check a condition before executing this block.
      }
    }
    return false; // Return control (and optionally a value) to the caller.
  }

  // This function handles the touchesGoalHouse behavior in this file.
  touchesGoalHouse(rect) { // Execute this step in the current flow.
    return this.rectsOverlap(rect, this.goal); // Return control (and optionally a value) to the caller.
  }

  // This function handles the drawPropFrame behavior in this file.
  drawPropFrame(ctx, frame, x, y, width, height) { // Execute this step in the current flow.
    if (!this.propsAtlasImage || !frame) return; // Check a condition before executing this block.
    ctx.drawImage( // Render an image (or sprite region) on the canvas.
      this.propsAtlasImage, // Execute this step in the current flow.
      frame.sx, // Execute this step in the current flow.
      frame.sy, // Execute this step in the current flow.
      frame.sw, // Execute this step in the current flow.
      frame.sh, // Execute this step in the current flow.
      Math.round(x), // Execute this step in the current flow.
      Math.round(y), // Execute this step in the current flow.
      Math.round(width), // Execute this step in the current flow.
      Math.round(height) // Execute this step in the current flow.
    ); // Call a function to perform this step.
  }

  // This function handles the drawWorldProps behavior in this file.
  drawWorldProps(ctx, camera, layer) { // Execute this step in the current flow.
    // This function handles the for behavior in this file.
    for (const prop of this.worldProps) { // Iterate through items or indices in a loop.
      if (layer === "hazard" && prop.layer !== "hazard") continue; // Check a condition before executing this block.
      if (layer === "solid" && prop.layer !== "solid") continue; // Check a condition before executing this block.
      if (layer === "decoration" && prop.layer !== "decoration") continue; // Check a condition before executing this block.
      if (layer === "interactable" && prop.layer !== "interactable") continue; // Check a condition before executing this block.
      this.drawPropFrame( // Execute this step in the current flow.
        ctx, // Execute this step in the current flow.
        prop.frame, // Execute this step in the current flow.
        prop.x - camera.x, // Execute this step in the current flow.
        prop.y - camera.y, // Execute this step in the current flow.
        prop.width, // Execute this step in the current flow.
        prop.height // Execute this step in the current flow.
      ); // Call a function to perform this step.
    }
  }

  // This function handles the drawSwitch behavior in this file.
  drawSwitch(ctx, camera) { // Execute this step in the current flow.
    const frameKey = this.switchActivated ? "crank-up" : "crank-down"; // Create a local constant for this scope.
    const frame = PROP_FRAMES[frameKey]; // Create a local constant for this scope.
    const width = frame.sw * (this.tileDisplaySize / this.tileSize); // Create a local constant for this scope.
    const height = frame.sh * (this.tileDisplaySize / this.tileSize); // Create a local constant for this scope.
    this.drawPropFrame( // Execute this step in the current flow.
      ctx, // Execute this step in the current flow.
      frame, // Execute this step in the current flow.
      this.switchZone.x - camera.x, // Execute this step in the current flow.
      this.switchZone.y - camera.y, // Execute this step in the current flow.
      width, // Execute this step in the current flow.
      height // Execute this step in the current flow.
    ); // Call a function to perform this step.
  }

  // This function handles the drawDoor behavior in this file.
  drawDoor(ctx, camera) { // Execute this step in the current flow.
    const x = Math.round(this.tileDisplaySize * 80 - camera.x); // Create a local constant for this scope.
    const y = Math.round(this.tileDisplaySize * 7 - camera.y); // Create a local constant for this scope.
    const image = this.doorOpen ? this.uiDoorOpenImage : this.uiDoorClosedImage; // Create a local constant for this scope.
    // This function handles the if behavior in this file.
    if (image) { // Check a condition before executing this block.
      ctx.drawImage(image, x, y, this.tileDisplaySize, this.tileDisplaySize * 2); // Render an image (or sprite region) on the canvas.
      return; // Return control (and optionally a value) to the caller.
    }

    const frame = PROP_FRAMES.door; // Create a local constant for this scope.
    this.drawPropFrame( // Execute this step in the current flow.
      ctx, // Execute this step in the current flow.
      frame, // Execute this step in the current flow.
      x, // Execute this step in the current flow.
      y, // Execute this step in the current flow.
      this.tileDisplaySize, // Execute this step in the current flow.
      this.tileDisplaySize * 2 // Execute this step in the current flow.
    ); // Call a function to perform this step.
  }

  // This function handles the drawGoalHouse behavior in this file.
  drawGoalHouse(ctx, camera) { // Execute this step in the current flow.
    const x = Math.round(this.goal.x - camera.x); // Create a local constant for this scope.
    const y = Math.round(this.goal.y - camera.y); // Create a local constant for this scope.
    ctx.fillStyle = "#ffcc80"; // Compute and store a value for later use.
    ctx.fillRect(x, y, this.goal.width, this.goal.height); // Draw a filled rectangle on the canvas.
    ctx.fillStyle = "#8d6e63"; // Compute and store a value for later use.
    ctx.fillRect(x - 6, y - 18, this.goal.width + 12, 20); // Draw a filled rectangle on the canvas.
    ctx.fillStyle = "#5d4037"; // Compute and store a value for later use.
    ctx.fillRect(x + 28, y + 78, 20, 66); // Draw a filled rectangle on the canvas.
  }

  // This function handles the draw behavior in this file.
  draw(ctx, camera) { // Execute this step in the current flow.
    const startCol = Math.max(0, Math.floor(camera.x / this.tileDisplaySize)); // Create a local constant for this scope.
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / this.tileDisplaySize)); // Create a local constant for this scope.

    // This function handles the for behavior in this file.
    for (let row = 0; row < this.rows; row++) { // Iterate through items or indices in a loop.
      // This function handles the for behavior in this file.
      for (let col = startCol; col <= endCol; col++) { // Iterate through items or indices in a loop.
        const tileId = this.tiles[row][col]; // Create a local constant for this scope.
        if (tileId === TILE_ID.empty) continue; // Check a condition before executing this block.

        const sourceIndex = tileId - 1; // Create a local constant for this scope.
        const sourceCol = sourceIndex % this.tileSetColumns; // Create a local constant for this scope.
        const sourceRow = Math.floor(sourceIndex / this.tileSetColumns); // Create a local constant for this scope.

        const sx = sourceCol * this.tileSize; // Create a local constant for this scope.
        const sy = sourceRow * this.tileSize; // Create a local constant for this scope.
        const dx = Math.round(col * this.tileDisplaySize - camera.x); // Create a local constant for this scope.
        const dy = Math.round(row * this.tileDisplaySize - camera.y); // Create a local constant for this scope.

        ctx.drawImage( // Render an image (or sprite region) on the canvas.
          this.tileSetImage, // Execute this step in the current flow.
          sx, // Execute this step in the current flow.
          sy, // Execute this step in the current flow.
          this.tileSize, // Execute this step in the current flow.
          this.tileSize, // Execute this step in the current flow.
          dx, // Execute this step in the current flow.
          dy, // Execute this step in the current flow.
          this.tileDisplaySize, // Execute this step in the current flow.
          this.tileDisplaySize // Execute this step in the current flow.
        ); // Call a function to perform this step.
      }
    }

    this.drawWorldProps(ctx, camera, "decoration"); // Call a function to perform this step.
    this.drawWorldProps(ctx, camera, "solid"); // Call a function to perform this step.
    this.drawWorldProps(ctx, camera, "hazard"); // Call a function to perform this step.

    this.drawSwitch(ctx, camera); // Call a function to perform this step.
    this.drawDoor(ctx, camera); // Call a function to perform this step.
    this.drawGoalHouse(ctx, camera); // Call a function to perform this step.
  }
}
