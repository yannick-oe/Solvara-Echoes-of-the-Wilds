// Globale Basiswerte fuer Rendering und Gameplay-Logik in Solvara.
export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 480;
export const TILE_SIZE = 16;
export const TILE_SCALE = 3;
// Reale Tile-Groesse im Spiel (16px Atlas-Tile * 3x Darstellung).
export const TILE_DISPLAY_SIZE = TILE_SIZE * TILE_SCALE;

// Zentrale Asset-Pfade; werden beim Spielstart in den ImageCache geladen.
export const ASSET_PATHS = {
  backgroundBack: "assets/images/backgrounds/forest/back.png",
  backgroundMiddle: "assets/images/backgrounds/forest/middle.png",
  tileSet: "assets/images/tilesets/tileset.png",
  propsAtlas: "assets/images/tilesets/atlas-props.png",
  playerSprite: "assets/images/sprites/player.png",
  enemyAtlas: "assets/images/sprites/enemies/atlas.png",
  pickupAtlas: "assets/images/sprites/pickups/atlas.png",
  uiDoorClosed: "assets/images/ui/door.png",
  uiDoorOpen: "assets/images/ui/door-opened.png",
  levelMusic: "assets/audio/music/platformer_level03_loop.ogg",
};

// IDs muessen zum verwendeten Tileset passen, sonst werden falsche Kacheln gezeichnet.
export const TILE_ID = {
  empty: 0,
  grassLeft: 1,
  grassMiddle: 2,
  grassRight: 3,
  grassMiddleAlt: 4,
  grassSingle: 5,
  dirtLeft: 26,
  dirtMiddle: 27,
  dirtRight: 28,
  dirtMiddleDark: 29,
  stoneBlock: 51,
  spike: 171,
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
};

// Semantische Gruppen fuer Kollision, Logik und Editor-nahe Lesbarkeit.
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

// Aktive Kollisionstiles fuer die Runtime-Abfragen in level.js.
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

// Typen-Schluessel, damit Welt-Layouts und Runtime dieselben Bezeichner verwenden.
export const ENEMY_TYPE = { possum: "possum", frog: "frog", eagle: "eagle" };

export const COLLECTIBLE_TYPE = {
  diamond: "diamond",
  starCoin: "starCoin",
  cherry: "cherry",
};

export const GAMEPLAY = {
  // Startwert bei Spawn; kann per Cherry bis maxHearts wachsen.
  startHearts: 3,
  maxHearts: 5,
  // Zeitfenster nach Treffer, in dem der Spieler keinen weiteren Schaden bekommt.
  hitInvulnerabilityTime: 1.2,
  // Rueckstoss nach Treffer in X/Y-Richtung.
  knockbackX: 180,
  knockbackY: 260,
  // Multiplikator fuer den Aufwaertsbounce nach Stomp auf Gegner.
  stompBounceFactor: 0.55,
  diamondScore: 10,
  starCoinScore: 50,
};
