import { // Importiert eine in dieser Datei verwendete Abhaengigkeit.
  HAZARD_TILE_IDS, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  SOLID_TILE_IDS, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_DISPLAY_SIZE, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_SIZE, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
} from "./constants.js"; // Fuehrt diesen Schritt im aktuellen Ablauf aus.
import { // Importiert eine in dieser Datei verwendete Abhaengigkeit.
  DEFAULT_WORLD_PROPS, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  PROP_FRAMES, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  WORLD_PROP_KEYS, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
} from "./worldAtlasConfig.js"; // Fuehrt diesen Schritt im aktuellen Ablauf aus.

export class Level { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor(tileSetImage, propsAtlasImage, uiDoorClosedImage, uiDoorOpenImage) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.tileSetImage = tileSetImage; // Speichert Daten in der aktuellen Objektinstanz.
    this.propsAtlasImage = propsAtlasImage; // Speichert Daten in der aktuellen Objektinstanz.
    this.uiDoorClosedImage = uiDoorClosedImage; // Speichert Daten in der aktuellen Objektinstanz.
    this.uiDoorOpenImage = uiDoorOpenImage; // Speichert Daten in der aktuellen Objektinstanz.
    this.tileSize = TILE_SIZE; // Speichert Daten in der aktuellen Objektinstanz.
    this.tileDisplaySize = TILE_DISPLAY_SIZE; // Speichert Daten in der aktuellen Objektinstanz.
    this.solidTileIds = new Set(SOLID_TILE_IDS); // Speichert Daten in der aktuellen Objektinstanz.
    this.hazardTileIds = new Set(HAZARD_TILE_IDS); // Speichert Daten in der aktuellen Objektinstanz.
    this.oneWayTileIds = new Set(); // Speichert Daten in der aktuellen Objektinstanz.

    this.solidPropKeys = new Set(WORLD_PROP_KEYS.solid); // Speichert Daten in der aktuellen Objektinstanz.
    this.oneWayPropKeys = new Set(WORLD_PROP_KEYS.oneWay); // Speichert Daten in der aktuellen Objektinstanz.
    this.hazardPropKeys = new Set(WORLD_PROP_KEYS.hazard); // Speichert Daten in der aktuellen Objektinstanz.
    this.worldProps = []; // Speichert Daten in der aktuellen Objektinstanz.
    this.solidPropCells = new Set(); // Speichert Daten in der aktuellen Objektinstanz.
    this.oneWayPropCells = new Set(); // Speichert Daten in der aktuellen Objektinstanz.
    this.hazardPropCells = new Set(); // Speichert Daten in der aktuellen Objektinstanz.

    this.tiles = this.buildSingleLevel(); // Speichert Daten in der aktuellen Objektinstanz.
    this.rows = this.tiles.length; // Speichert Daten in der aktuellen Objektinstanz.
    this.cols = this.tiles[0].length; // Speichert Daten in der aktuellen Objektinstanz.
    this.pixelWidth = this.cols * this.tileDisplaySize; // Speichert Daten in der aktuellen Objektinstanz.
    this.pixelHeight = this.rows * this.tileDisplaySize; // Speichert Daten in der aktuellen Objektinstanz.

    this.spawnX = this.tileDisplaySize * 2; // Speichert Daten in der aktuellen Objektinstanz.
    this.spawnY = this.tileDisplaySize * 6; // Speichert Daten in der aktuellen Objektinstanz.

    this.goal = this.createGoalHouse(); // Speichert Daten in der aktuellen Objektinstanz.
    this.switchZone = this.createSwitchZone(); // Speichert Daten in der aktuellen Objektinstanz.
    this.doorTiles = this.createDoorTiles(); // Speichert Daten in der aktuellen Objektinstanz.
    this.setupWorldProps(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.resetRuntimeState(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize); // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "buildSingleLevel" in dieser Datei.
  buildSingleLevel() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const width = 132; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const height = 14; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const groundRow = 8; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const tiles = this.createEmptyTiles(width, height); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    this.addStartArea(tiles, groundRow); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.addMountainPath(tiles, groundRow); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.addCaveEntrance(tiles, groundRow); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.addCave(tiles); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.addMountainTop(tiles); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.addGoalArea(tiles); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    return tiles; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "resetRuntimeState" in dieser Datei.
  resetRuntimeState() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.switchActivated = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.doorOpen = false; // Speichert Daten in der aktuellen Objektinstanz.
    this.closeDoorTiles(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "createGoalHouse" in dieser Datei.
  createGoalHouse() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      x: this.tileDisplaySize * 125, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      y: this.tileDisplaySize * 5, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      width: this.tileDisplaySize * 2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      height: this.tileDisplaySize * 3, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };
  }

  // Diese Funktion verarbeitet das Verhalten "createSwitchZone" in dieser Datei.
  createSwitchZone() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      x: this.tileDisplaySize * 72, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      y: this.tileDisplaySize * 9, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      width: this.tileDisplaySize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      height: this.tileDisplaySize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };
  }

  // Diese Funktion verarbeitet das Verhalten "createDoorTiles" in dieser Datei.
  createDoorTiles() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return [ // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      { col: 80, row: 7 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { col: 80, row: 8 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      { col: 80, row: 9 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  }

  // Diese Funktion verarbeitet das Verhalten "setupWorldProps" in dieser Datei.
  setupWorldProps() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.worldProps = DEFAULT_WORLD_PROPS.map((item) => this.createWorldProp(item)); // Speichert Daten in der aktuellen Objektinstanz.
    this.rebuildPropCollisionCells(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "createWorldProp" in dieser Datei.
  createWorldProp(item) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const frame = PROP_FRAMES[item.key]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const worldX = item.col * this.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const worldY = item.row * this.tileDisplaySize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const worldWidth = Math.round(frame.sw * (this.tileDisplaySize / this.tileSize)); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const worldHeight = Math.round(frame.sh * (this.tileDisplaySize / this.tileSize)); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    return { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      key: item.key, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      layer: item.layer, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      col: item.col, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      row: item.row, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      x: worldX, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      y: worldY, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      width: worldWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      height: worldHeight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };
  }

  // Diese Funktion verarbeitet das Verhalten "rebuildPropCollisionCells" in dieser Datei.
  rebuildPropCollisionCells() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.solidPropCells.clear(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.oneWayPropCells.clear(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.hazardPropCells.clear(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (const prop of this.worldProps) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      this.markPropCells(prop); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "markPropCells" in dieser Datei.
  markPropCells(prop) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const startCol = Math.floor(prop.x / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const endCol = Math.floor((prop.x + prop.width - 1) / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const startRow = Math.floor(prop.y / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const endRow = Math.floor((prop.y + prop.height - 1) / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let row = startRow; row <= endRow; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = startCol; col <= endCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        const key = `${col},${row}`; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        if (this.solidPropKeys.has(prop.key)) this.solidPropCells.add(key); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.oneWayPropKeys.has(prop.key)) this.oneWayPropCells.add(key); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        if (this.hazardPropKeys.has(prop.key)) this.hazardPropCells.add(key); // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      }
    }
  }

  // Diese Funktion verarbeitet das Verhalten "closeDoorTiles" in dieser Datei.
  closeDoorTiles() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (const tile of this.doorTiles) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorClosed); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "openDoorTiles" in dieser Datei.
  openDoorTiles() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (const tile of this.doorTiles) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      this.fillBlock(this.tiles, tile.row, tile.col, TILE_ID.doorOpen); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "tryActivateSwitch" in dieser Datei.
  tryActivateSwitch(playerRect, wantsInteract) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!wantsInteract || this.switchActivated) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (!this.rectsOverlap(playerRect, this.switchZone)) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    this.switchActivated = true; // Speichert Daten in der aktuellen Objektinstanz.
    this.doorOpen = true; // Speichert Daten in der aktuellen Objektinstanz.
    this.openDoorTiles(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    return true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "rectsOverlap" in dieser Datei.
  rectsOverlap(a, b) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "createEmptyTiles" in dieser Datei.
  createEmptyTiles(width, height) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const tiles = []; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let row = 0; row < height; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      tiles[row] = []; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = 0; col < width; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        tiles[row][col] = TILE_ID.empty; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
      }
    }
    return tiles; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "addStartArea" in dieser Datei.
  addStartArea(tiles, groundRow) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillGround(tiles, groundRow, 0, 20); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillGround(tiles, groundRow, 23, 34); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 7, 5, 7); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 7, 9, 11); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 6, 13, 15); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 6, 17, 19); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "addMountainPath" in dieser Datei.
  addMountainPath(tiles, groundRow) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillGround(tiles, groundRow, 36, 50); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 7, 41, 44); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 6, 46, 49); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 5, 52, 55); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 4, 57, 60); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 3, 64, 67); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "addCaveEntrance" in dieser Datei.
  addCaveEntrance(tiles, groundRow) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillGround(tiles, groundRow + 1, 61, 73); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 9, 66, 69); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 10, 70, 73); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "addCave" in dieser Datei.
  addCave(tiles) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillGround(tiles, 10, 74, 95); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillRow(tiles, 11, 74, 95, TILE_ID.dirtMiddleDark); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillRow(tiles, 9, 84, 86, TILE_ID.spike); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillRow(tiles, 9, 91, 92, TILE_ID.spike); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 8, 75, 78, TILE_ID.grassMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 8, 88, 90, TILE_ID.grassMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "addMountainTop" in dieser Datei.
  addMountainTop(tiles) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillGround(tiles, 8, 96, 131); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 6, 102, 106); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 5, 109, 112); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillPlatform(tiles, 4, 116, 120); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "addGoalArea" in dieser Datei.
  addGoalArea(tiles) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.fillPlatform(tiles, 7, 123, 126); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillBlock(tiles, 8, 125, TILE_ID.dirtMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillBlock(tiles, 9, 125, TILE_ID.dirtMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "fillGround" in dieser Datei.
  fillGround(tiles, row, startCol, endCol) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.grassMiddle : TILE_ID.grassRight; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let col = startCol + 1; col < endCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      tiles[row][col] = TILE_ID.grassMiddle; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }

    this.fillRow(tiles, row + 1, startCol, endCol, TILE_ID.dirtMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.fillRow(tiles, row + 2, startCol, endCol, TILE_ID.dirtMiddle); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.patchGroundEdges(tiles, row + 1, startCol, endCol); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.patchGroundEdges(tiles, row + 2, startCol, endCol); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "fillPlatform" in dieser Datei.
  fillPlatform(tiles, row, startCol, endCol, centerTileId = TILE_ID.grassMiddle) { // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    tiles[row][startCol] = TILE_ID.grassLeft; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    tiles[row][endCol] = TILE_ID.grassRight; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let col = startCol + 1; col < endCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      tiles[row][col] = centerTileId; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "fillRow" in dieser Datei.
  fillRow(tiles, row, startCol, endCol, tileId) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (row < 0 || row >= tiles.length) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let col = startCol; col <= endCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      if (col < 0 || col >= tiles[row].length) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      tiles[row][col] = tileId; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "fillBlock" in dieser Datei.
  fillBlock(tiles, row, col, tileId) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (row < 0 || row >= tiles.length) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (col < 0 || col >= tiles[row].length) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    tiles[row][col] = tileId; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
  }

  // Diese Funktion verarbeitet das Verhalten "patchGroundEdges" in dieser Datei.
  patchGroundEdges(tiles, row, startCol, endCol) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (row < 0 || row >= tiles.length) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
  }

  // Diese Funktion verarbeitet das Verhalten "isSolidTile" in dieser Datei.
  isSolidTile(col, row) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (col < 0 || col >= this.cols) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (row < 0) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (row >= this.rows) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (this.solidTileIds.has(this.tiles[row][col])) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return this.solidPropCells.has(`${col},${row}`); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "isOneWayTile" in dieser Datei.
  isOneWayTile(col, row) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (this.oneWayTileIds.has(this.tiles[row][col])) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return this.oneWayPropCells.has(`${col},${row}`); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "isHazardTile" in dieser Datei.
  isHazardTile(col, row) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (col < 0 || col >= this.cols) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (row < 0 || row >= this.rows) return false; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (this.hazardTileIds.has(this.tiles[row][col])) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    return this.hazardPropCells.has(`${col},${row}`); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "rectTouchesHazard" in dieser Datei.
  rectTouchesHazard(x, y, width, height) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const leftCol = Math.floor(x / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const rightCol = Math.floor((x + width - 1) / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const topRow = Math.floor(y / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const bottomRow = Math.floor((y + height - 1) / this.tileDisplaySize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let row = topRow; row <= bottomRow; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = leftCol; col <= rightCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        if (this.isHazardTile(col, row)) return true; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      }
    }
    return false; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "touchesGoalHouse" in dieser Datei.
  touchesGoalHouse(rect) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.rectsOverlap(rect, this.goal); // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "drawPropFrame" in dieser Datei.
  drawPropFrame(ctx, frame, x, y, width, height) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (!this.propsAtlasImage || !frame) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
      this.propsAtlasImage, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame.sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame.sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame.sw, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame.sh, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      Math.round(x), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      Math.round(y), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      Math.round(width), // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      Math.round(height) // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "drawWorldProps" in dieser Datei.
  drawWorldProps(ctx, camera, layer) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (const prop of this.worldProps) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      if (layer === "hazard" && prop.layer !== "hazard") continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      if (layer === "solid" && prop.layer !== "solid") continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      if (layer === "decoration" && prop.layer !== "decoration") continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      if (layer === "interactable" && prop.layer !== "interactable") continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.drawPropFrame( // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ctx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        prop.frame, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        prop.x - camera.x, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        prop.y - camera.y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        prop.width, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        prop.height // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
  }

  // Diese Funktion verarbeitet das Verhalten "drawSwitch" in dieser Datei.
  drawSwitch(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const frameKey = this.switchActivated ? "crank-up" : "crank-down"; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const frame = PROP_FRAMES[frameKey]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const width = frame.sw * (this.tileDisplaySize / this.tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const height = frame.sh * (this.tileDisplaySize / this.tileSize); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    this.drawPropFrame( // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ctx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.switchZone.x - camera.x, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.switchZone.y - camera.y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      width, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      height // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "drawDoor" in dieser Datei.
  drawDoor(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const x = Math.round(this.tileDisplaySize * 80 - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const y = Math.round(this.tileDisplaySize * 7 - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const image = this.doorOpen ? this.uiDoorOpenImage : this.uiDoorClosedImage; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (image) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      ctx.drawImage(image, x, y, this.tileDisplaySize, this.tileDisplaySize * 2); // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
      return; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
    }

    const frame = PROP_FRAMES.door; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    this.drawPropFrame( // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      ctx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      frame, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      x, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      y, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.tileDisplaySize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      this.tileDisplaySize * 2 // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "drawGoalHouse" in dieser Datei.
  drawGoalHouse(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const x = Math.round(this.goal.x - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const y = Math.round(this.goal.y - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    ctx.fillStyle = "#ffcc80"; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    ctx.fillRect(x, y, this.goal.width, this.goal.height); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.
    ctx.fillStyle = "#8d6e63"; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    ctx.fillRect(x - 6, y - 18, this.goal.width + 12, 20); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.
    ctx.fillStyle = "#5d4037"; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    ctx.fillRect(x + 28, y + 78, 20, 66); // Zeichnet ein gefuelltes Rechteck auf dem Canvas.
  }

  // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
  draw(ctx, camera) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const startCol = Math.max(0, Math.floor(camera.x / this.tileDisplaySize)); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / this.tileDisplaySize)); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let row = 0; row < this.rows; row++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
      for (let col = startCol; col <= endCol; col++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
        const tileId = this.tiles[row][col]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        if (tileId === TILE_ID.empty) continue; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.

        const sourceIndex = tileId - 1; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const sourceCol = sourceIndex % this.tileSetColumns; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const sourceRow = Math.floor(sourceIndex / this.tileSetColumns); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

        const sx = sourceCol * this.tileSize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const sy = sourceRow * this.tileSize; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const dx = Math.round(col * this.tileDisplaySize - camera.x); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
        const dy = Math.round(row * this.tileDisplaySize - camera.y); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

        ctx.drawImage( // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
          this.tileSetImage, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          sx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          sy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          this.tileSize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          this.tileSize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          dx, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          dy, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          this.tileDisplaySize, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
          this.tileDisplaySize // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        ); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      }
    }

    this.drawWorldProps(ctx, camera, "decoration"); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.drawWorldProps(ctx, camera, "solid"); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.drawWorldProps(ctx, camera, "hazard"); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

    this.drawSwitch(ctx, camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.drawDoor(ctx, camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    this.drawGoalHouse(ctx, camera); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }
}
