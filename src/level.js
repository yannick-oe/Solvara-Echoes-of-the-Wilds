import { TILE_DISPLAY_SIZE, TILE_ID, TILE_SIZE } from "./constants.js"; // Wir holen gemeinsame Tile-Werte aus den Konstanten.

export class Level { // Diese Klasse baut und zeichnet unser Level.
  constructor(tileSetImage) { // Hier starten wir das Level mit dem Tileset-Bild.
    this.tileSetImage = tileSetImage; // Wir speichern das Tileset-Bild.
    this.tileSize = TILE_SIZE; // Original-Größe eines Tiles im Tileset.
    this.tileDisplaySize = TILE_DISPLAY_SIZE; // Gezeichnete Größe eines Tiles auf dem Bildschirm.

    this.tiles = this.buildSingleLevel(); // Wir bauen die Tile-Matrix für das Level.
    this.rows = this.tiles.length; // Anzahl der Reihen im Level.
    this.cols = this.tiles[0].length; // Anzahl der Spalten im Level.

    this.pixelWidth = this.cols * this.tileDisplaySize; // Gesamte Level-Breite in Pixeln.
    this.pixelHeight = this.rows * this.tileDisplaySize; // Gesamte Level-Höhe in Pixeln.

    this.spawnX = this.tileDisplaySize * 3; // Spieler startet 3 Tiles von links.
    this.spawnY = this.tileDisplaySize * 7 - 48; // Spieler startet auf passender Y-Höhe über dem Boden.

    this.goal = { // Hier legen wir das Ziel-Rechteck fest.
      x: this.pixelWidth - 50, // Ziel ist nahe am rechten Level-Ende.
      y: this.tileDisplaySize * 7, // Ziel liegt auf Bodenhöhe.
      width: 18, // Ziel-Breite.
      height: this.tileDisplaySize, // Ziel-Höhe.
    }; // Ende Ziel-Objekt.

    this.tileSetColumns = Math.floor(this.tileSetImage.width / this.tileSize); // So viele Tile-Spalten hat das Tileset-Bild.
  } // Ende vom Konstruktor.

  buildSingleLevel() { // Diese Funktion baut die komplette Level-Matrix.
    const width = 80; // Das Level hat 80 Spalten.
    const height = 10; // Das Level hat 10 Reihen.
    const groundRow = 8; // Der Boden liegt in Reihe 8.

    const tiles = []; // Hier speichern wir alle Tiles.

    for (let row = 0; row < height; row++) { // Wir gehen jede Reihe durch.
      tiles[row] = []; // Für jede Reihe machen wir ein leeres Array.
      for (let col = 0; col < width; col++) { // Wir gehen jede Spalte in dieser Reihe durch.
        tiles[row][col] = TILE_ID.empty; // Standard ist: Luft.
      } // Ende innere Spalten-Schleife.
    } // Ende äußere Reihen-Schleife.

    const groundSections = [ // Diese Abschnitte werden zu Boden gemacht.
      [0, 17], // Bodenstück 1.
      [21, 41], // Bodenstück 2.
      [46, 79], // Bodenstück 3.
    ]; // Ende Boden-Abschnitte.

    for (let i = 0; i < groundSections.length; i++) { // Wir gehen jeden Boden-Abschnitt durch.
      this.fillGround(tiles, groundRow, groundSections[i][0], groundSections[i][1]); // Wir füllen den Boden in diesem Abschnitt.
    } // Ende Boden-Schleife.

    this.fillPlatform(tiles, 6, 26, 31); // Wir bauen eine Plattform in Reihe 6.
    this.fillPlatform(tiles, 5, 55, 60); // Wir bauen eine zweite Plattform in Reihe 5.

    return tiles; // Wir geben die fertige Matrix zurück.
  } // Ende von buildSingleLevel.

  fillGround(tiles, row, startCol, endCol) { // Diese Funktion baut ein Bodenstück mit Gras oben und Dreck darunter.
    tiles[row][startCol] = startCol === 0 ? TILE_ID.grassMiddle : TILE_ID.grassLeft; // Linkes Ende setzen.
    tiles[row][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.grassMiddle : TILE_ID.grassRight; // Rechtes Ende setzen.

    for (let col = startCol + 1; col < endCol; col++) { // Mitte zwischen den Enden durchgehen.
      tiles[row][col] = TILE_ID.grassMiddle; // Mitte mit Gras füllen.
    } // Ende Gras-Mitte.

    if (row + 1 < tiles.length) { // Nur wenn unter dem Boden noch eine Reihe existiert...
      tiles[row + 1][startCol] = startCol === 0 ? TILE_ID.dirtMiddle : TILE_ID.dirtLeft; // Linkes Dreck-Ende setzen.
      tiles[row + 1][endCol] = endCol === tiles[row].length - 1 ? TILE_ID.dirtMiddle : TILE_ID.dirtRight; // Rechtes Dreck-Ende setzen.

      for (let col = startCol + 1; col < endCol; col++) { // Mitte darunter durchgehen.
        tiles[row + 1][col] = TILE_ID.dirtMiddle; // Mitte mit Dreck füllen.
      } // Ende Dreck-Mitte.
    } // Ende untere Reihe-Check.
  } // Ende von fillGround.

  fillPlatform(tiles, row, startCol, endCol) { // Diese Funktion baut eine schwebende Plattform.
    tiles[row][startCol] = TILE_ID.grassLeft; // Linkes Ende der Plattform.
    tiles[row][endCol] = TILE_ID.grassRight; // Rechtes Ende der Plattform.

    for (let col = startCol + 1; col < endCol; col++) { // Spalten zwischen den Enden durchgehen.
      tiles[row][col] = TILE_ID.grassMiddle; // Mitte mit Gras füllen.
    } // Ende Plattform-Mitte.
  } // Ende von fillPlatform.

  isSolidTile(col, row) { // Diese Funktion prüft, ob ein Tile fest ist.
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) { // Wenn außerhalb vom Level...
      return true; // ...behandeln wir es als Wand.
    } // Ende Rand-Check.

    return this.tiles[row][col] !== TILE_ID.empty; // Alles außer Luft ist fest.
  } // Ende von isSolidTile.

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
