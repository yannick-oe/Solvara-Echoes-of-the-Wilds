export const CANVAS_WIDTH = 720; // Deklariert einen gemeinsamen konstanten Wert.
export const CANVAS_HEIGHT = 480; // Deklariert einen gemeinsamen konstanten Wert.

export const TILE_SIZE = 16; // Deklariert einen gemeinsamen konstanten Wert.
export const TILE_SCALE = 3; // Deklariert einen gemeinsamen konstanten Wert.
export const TILE_DISPLAY_SIZE = TILE_SIZE * TILE_SCALE; // Deklariert einen gemeinsamen konstanten Wert.

export const ASSET_PATHS = { // Deklariert einen gemeinsamen konstanten Wert.
  backgroundBack: "assets/images/backgrounds/forest/back.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  backgroundMiddle: "assets/images/backgrounds/forest/middle.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  tileSet: "assets/images/tilesets/tileset.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  propsAtlas: "assets/images/tilesets/atlas-props.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  playerSprite: "assets/images/sprites/player.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  enemyAtlas: "assets/images/sprites/enemies/atlas.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  pickupAtlas: "assets/images/sprites/pickups/atlas.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  uiDoorClosed: "assets/images/ui/door.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  uiDoorOpen: "assets/images/ui/door-opened.png", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  levelMusic: "assets/audio/music/platformer_level03_loop.ogg", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const TILE_ID = { // Deklariert einen gemeinsamen konstanten Wert.
  empty: 0, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  grassLeft: 1, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  grassMiddle: 2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  grassRight: 3, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  grassMiddleAlt: 4, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  grassSingle: 5, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  dirtLeft: 26, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  dirtMiddle: 27, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  dirtRight: 28, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  dirtMiddleDark: 29, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  stoneBlock: 51, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  spike: 171, // Fuehrt diesen Schritt im aktuellen Ablauf aus.

  caveWallA: 52, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  caveWallB: 53, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  caveFloor: 54, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  platformWood: 70, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  switchLever: 186, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  doorClosed: 187, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  doorOpen: 188, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  houseBase: 200, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  houseRoof: 201, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  spikeCeiling: 172, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const TILE_GROUPS = { // Deklariert einen gemeinsamen konstanten Wert.
  SOLID_GROUND: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.grassLeft, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.grassMiddle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.grassRight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.grassMiddleAlt, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.grassSingle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.dirtLeft, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.dirtMiddle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.dirtRight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.dirtMiddleDark, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.stoneBlock, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.caveWallA, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.caveWallB, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.caveFloor, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.platformWood, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    TILE_ID.doorClosed, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  ONE_WAY_PLATFORM: [TILE_ID.platformWood], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  HAZARD_SPIKES: [TILE_ID.spike, TILE_ID.spikeCeiling], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  DECORATION: [TILE_ID.houseBase, TILE_ID.houseRoof], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  INTERACTABLE: [TILE_ID.switchLever, TILE_ID.doorClosed, TILE_ID.doorOpen], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const SOLID_TILE_IDS = [ // Deklariert einen gemeinsamen konstanten Wert.
  TILE_ID.grassLeft, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.grassMiddle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.grassRight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.grassMiddleAlt, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.grassSingle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.dirtLeft, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.dirtMiddle, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.dirtRight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.dirtMiddleDark, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.stoneBlock, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.caveWallA, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.caveWallB, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.caveFloor, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.platformWood, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  TILE_ID.doorClosed, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
]; // Fuehrt diesen Schritt im aktuellen Ablauf aus.

export const HAZARD_TILE_IDS = [TILE_ID.spike, TILE_ID.spikeCeiling]; // Deklariert einen gemeinsamen konstanten Wert.

export const ENEMY_TYPE = { // Deklariert einen gemeinsamen konstanten Wert.
  possum: "possum", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  frog: "frog", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  eagle: "eagle", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const COLLECTIBLE_TYPE = { // Deklariert einen gemeinsamen konstanten Wert.
  diamond: "diamond", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  starCoin: "starCoin", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  cherry: "cherry", // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const GAMEPLAY = { // Deklariert einen gemeinsamen konstanten Wert.
  startHearts: 3, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  maxHearts: 5, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  hitInvulnerabilityTime: 1.2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  knockbackX: 180, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  knockbackY: 260, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  stompBounceFactor: 0.55, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  diamondScore: 10, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  starCoinScore: 50, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};
