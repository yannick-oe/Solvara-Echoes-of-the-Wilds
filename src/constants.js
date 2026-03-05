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
  enemyAtlas: "assets/images/sprites/enemies/atlas.png",
  pickupAtlas: "assets/images/sprites/pickups/atlas.png",
  levelMusic: "assets/audio/music/platformer_level03_loop.ogg",
}; // Ende vom Pfad-Objekt.

export const TILE_ID = { // Hier vergeben wir Nummern für die Tile-Arten.
  empty: 0, // 0 bedeutet: kein Tile, also Luft.
  grassLeft: 1, // Linkes Gras-Ende.
  grassMiddle: 2, // Gras in der Mitte.
  grassRight: 3, // Rechtes Gras-Ende.
  grassMiddleAlt: 4, // Alternative Gras-Mitte für etwas mehr Abwechslung.
  grassSingle: 5, // Einzelnes Gras-Top-Tile.
  dirtLeft: 26, // Linkes Dreck-Ende.
  dirtMiddle: 27, // Dreck in der Mitte.
  dirtRight: 28, // Rechtes Dreck-Ende.
  dirtMiddleDark: 29, // Dunklere Dreck-Variante.
  stoneBlock: 51, // Steintile für kleine Bauwerke.
  spike: 171, // Gefahren-Tile (Spikes).

  caveWallA: 52,
  caveWallB: 53,
  caveFloor: 54,
  platformWood: 70,
  switchLever: 186,
  doorClosed: 187,
  doorOpen: 188,
  houseBase: 200,
  houseRoof: 201,
  spikeCeiling: 172,
}; // Ende vom Tile-ID-Objekt.

export const TILE_GROUPS = {
  SOLID_GROUND: [
    TILE_ID.grassLeft,
    TILE_ID.grassMiddle,
    TILE_ID.grassRight,
    TILE_ID.grassMiddleAlt,
    TILE_ID.grassSingle,
    TILE_ID.dirtLeft,
    TILE_ID.dirtMiddle,
    TILE_ID.dirtRight,
    TILE_ID.dirtMiddleDark,
    TILE_ID.stoneBlock,
    TILE_ID.caveWallA,
    TILE_ID.caveWallB,
    TILE_ID.caveFloor,
    TILE_ID.platformWood,
    TILE_ID.doorClosed,
  ],
  ONE_WAY_PLATFORM: [TILE_ID.platformWood],
  HAZARD_SPIKES: [TILE_ID.spike, TILE_ID.spikeCeiling],
  DECORATION: [TILE_ID.houseBase, TILE_ID.houseRoof],
  INTERACTABLE: [TILE_ID.switchLever, TILE_ID.doorClosed, TILE_ID.doorOpen],
};

export const SOLID_TILE_IDS = [
  TILE_ID.grassLeft,
  TILE_ID.grassMiddle,
  TILE_ID.grassRight,
  TILE_ID.grassMiddleAlt,
  TILE_ID.grassSingle,
  TILE_ID.dirtLeft,
  TILE_ID.dirtMiddle,
  TILE_ID.dirtRight,
  TILE_ID.dirtMiddleDark,
  TILE_ID.stoneBlock,
  TILE_ID.caveWallA,
  TILE_ID.caveWallB,
  TILE_ID.caveFloor,
  TILE_ID.platformWood,
  TILE_ID.doorClosed,
];

export const HAZARD_TILE_IDS = [TILE_ID.spike, TILE_ID.spikeCeiling];

export const ENEMY_TYPE = {
  possum: "possum",
  frog: "frog",
  eagle: "eagle",
};

export const COLLECTIBLE_TYPE = {
  diamond: "diamond",
  starCoin: "starCoin",
  cherry: "cherry",
};

export const GAMEPLAY = {
  startHearts: 3,
  maxHearts: 5,
  hitInvulnerabilityTime: 1.2,
  knockbackX: 180,
  knockbackY: 260,
  stompBounceFactor: 0.55,
  diamondScore: 10,
  starCoinScore: 50,
};