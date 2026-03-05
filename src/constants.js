export const CANVAS_WIDTH = 720; // Das ist die feste innere Breite vom Spiel-Canvas.
export const CANVAS_HEIGHT = 480; // Das ist die feste innere Höhe vom Spiel-Canvas.

export const TILE_SIZE = 16; // Ein Tile ist im Original-Bild 16 Pixel groß.
export const TILE_SCALE = 3; // Beim Zeichnen machen wir jedes Tile 3x größer.
export const TILE_DISPLAY_SIZE = TILE_SIZE * TILE_SCALE; // Das ist die echte Größe von einem Tile auf dem Bildschirm.

export const ASSET_PATHS = { // Hier sammeln wir alle Bild-Pfade an einer Stelle.
  backgroundBack: "assets/images/backgrounds/forest/back.png", // Pfad zum hinteren Hintergrund.
  backgroundMiddle: "assets/images/backgrounds/forest/middle.png", // Pfad zum mittleren Hintergrund.
  tileSet: "assets/images/tilesets/tileset.png", // Pfad zum Tileset-Bild.
  playerSprite: "assets/images/sprites/player.png", // Pfad zum Spieler-Spritesheet.
}; // Ende vom Pfad-Objekt.

export const TILE_ID = { // Hier vergeben wir Nummern für die Tile-Arten.
  empty: 0, // 0 bedeutet: kein Tile, also Luft.
  grassLeft: 1, // Linkes Gras-Ende.
  grassMiddle: 2, // Gras in der Mitte.
  grassRight: 3, // Rechtes Gras-Ende.
  dirtLeft: 26, // Linkes Dreck-Ende.
  dirtMiddle: 27, // Dreck in der Mitte.
  dirtRight: 28, // Rechtes Dreck-Ende.
}; // Ende vom Tile-ID-Objekt.