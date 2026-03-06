export const CANVAS_WIDTH = 720; // Declare a shared constant value.
export const CANVAS_HEIGHT = 480; // Declare a shared constant value.

export const TILE_SIZE = 16; // Declare a shared constant value.
export const TILE_SCALE = 3; // Declare a shared constant value.
export const TILE_DISPLAY_SIZE = TILE_SIZE * TILE_SCALE; // Declare a shared constant value.

export const ASSET_PATHS = { // Declare a shared constant value.
  backgroundBack: "assets/images/backgrounds/forest/back.png", // Execute this step in the current flow.
  backgroundMiddle: "assets/images/backgrounds/forest/middle.png", // Execute this step in the current flow.
  tileSet: "assets/images/tilesets/tileset.png", // Execute this step in the current flow.
  propsAtlas: "assets/images/tilesets/atlas-props.png", // Execute this step in the current flow.
  playerSprite: "assets/images/sprites/player.png", // Execute this step in the current flow.
  enemyAtlas: "assets/images/sprites/enemies/atlas.png", // Execute this step in the current flow.
  pickupAtlas: "assets/images/sprites/pickups/atlas.png", // Execute this step in the current flow.
  uiDoorClosed: "assets/images/ui/door.png", // Execute this step in the current flow.
  uiDoorOpen: "assets/images/ui/door-opened.png", // Execute this step in the current flow.
  levelMusic: "assets/audio/music/platformer_level03_loop.ogg", // Execute this step in the current flow.
};

export const TILE_ID = { // Declare a shared constant value.
  empty: 0, // Execute this step in the current flow.
  grassLeft: 1, // Execute this step in the current flow.
  grassMiddle: 2, // Execute this step in the current flow.
  grassRight: 3, // Execute this step in the current flow.
  grassMiddleAlt: 4, // Execute this step in the current flow.
  grassSingle: 5, // Execute this step in the current flow.
  dirtLeft: 26, // Execute this step in the current flow.
  dirtMiddle: 27, // Execute this step in the current flow.
  dirtRight: 28, // Execute this step in the current flow.
  dirtMiddleDark: 29, // Execute this step in the current flow.
  stoneBlock: 51, // Execute this step in the current flow.
  spike: 171, // Execute this step in the current flow.

  caveWallA: 52, // Execute this step in the current flow.
  caveWallB: 53, // Execute this step in the current flow.
  caveFloor: 54, // Execute this step in the current flow.
  platformWood: 70, // Execute this step in the current flow.
  switchLever: 186, // Execute this step in the current flow.
  doorClosed: 187, // Execute this step in the current flow.
  doorOpen: 188, // Execute this step in the current flow.
  houseBase: 200, // Execute this step in the current flow.
  houseRoof: 201, // Execute this step in the current flow.
  spikeCeiling: 172, // Execute this step in the current flow.
};

export const TILE_GROUPS = { // Declare a shared constant value.
  SOLID_GROUND: [ // Execute this step in the current flow.
    TILE_ID.grassLeft, // Execute this step in the current flow.
    TILE_ID.grassMiddle, // Execute this step in the current flow.
    TILE_ID.grassRight, // Execute this step in the current flow.
    TILE_ID.grassMiddleAlt, // Execute this step in the current flow.
    TILE_ID.grassSingle, // Execute this step in the current flow.
    TILE_ID.dirtLeft, // Execute this step in the current flow.
    TILE_ID.dirtMiddle, // Execute this step in the current flow.
    TILE_ID.dirtRight, // Execute this step in the current flow.
    TILE_ID.dirtMiddleDark, // Execute this step in the current flow.
    TILE_ID.stoneBlock, // Execute this step in the current flow.
    TILE_ID.caveWallA, // Execute this step in the current flow.
    TILE_ID.caveWallB, // Execute this step in the current flow.
    TILE_ID.caveFloor, // Execute this step in the current flow.
    TILE_ID.platformWood, // Execute this step in the current flow.
    TILE_ID.doorClosed, // Execute this step in the current flow.
  ], // Execute this step in the current flow.
  ONE_WAY_PLATFORM: [TILE_ID.platformWood], // Execute this step in the current flow.
  HAZARD_SPIKES: [TILE_ID.spike, TILE_ID.spikeCeiling], // Execute this step in the current flow.
  DECORATION: [TILE_ID.houseBase, TILE_ID.houseRoof], // Execute this step in the current flow.
  INTERACTABLE: [TILE_ID.switchLever, TILE_ID.doorClosed, TILE_ID.doorOpen], // Execute this step in the current flow.
};

export const SOLID_TILE_IDS = [ // Declare a shared constant value.
  TILE_ID.grassLeft, // Execute this step in the current flow.
  TILE_ID.grassMiddle, // Execute this step in the current flow.
  TILE_ID.grassRight, // Execute this step in the current flow.
  TILE_ID.grassMiddleAlt, // Execute this step in the current flow.
  TILE_ID.grassSingle, // Execute this step in the current flow.
  TILE_ID.dirtLeft, // Execute this step in the current flow.
  TILE_ID.dirtMiddle, // Execute this step in the current flow.
  TILE_ID.dirtRight, // Execute this step in the current flow.
  TILE_ID.dirtMiddleDark, // Execute this step in the current flow.
  TILE_ID.stoneBlock, // Execute this step in the current flow.
  TILE_ID.caveWallA, // Execute this step in the current flow.
  TILE_ID.caveWallB, // Execute this step in the current flow.
  TILE_ID.caveFloor, // Execute this step in the current flow.
  TILE_ID.platformWood, // Execute this step in the current flow.
  TILE_ID.doorClosed, // Execute this step in the current flow.
]; // Execute this step in the current flow.

export const HAZARD_TILE_IDS = [TILE_ID.spike, TILE_ID.spikeCeiling]; // Declare a shared constant value.

export const ENEMY_TYPE = { // Declare a shared constant value.
  possum: "possum", // Execute this step in the current flow.
  frog: "frog", // Execute this step in the current flow.
  eagle: "eagle", // Execute this step in the current flow.
};

export const COLLECTIBLE_TYPE = { // Declare a shared constant value.
  diamond: "diamond", // Execute this step in the current flow.
  starCoin: "starCoin", // Execute this step in the current flow.
  cherry: "cherry", // Execute this step in the current flow.
};

export const GAMEPLAY = { // Declare a shared constant value.
  startHearts: 3, // Execute this step in the current flow.
  maxHearts: 5, // Execute this step in the current flow.
  hitInvulnerabilityTime: 1.2, // Execute this step in the current flow.
  knockbackX: 180, // Execute this step in the current flow.
  knockbackY: 260, // Execute this step in the current flow.
  stompBounceFactor: 0.55, // Execute this step in the current flow.
  diamondScore: 10, // Execute this step in the current flow.
  starCoinScore: 50, // Execute this step in the current flow.
};
