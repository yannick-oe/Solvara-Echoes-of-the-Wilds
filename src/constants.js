/*
  constants.js
  ------------
  Central place for values that are shared across the project.
  Keeping constants here avoids "magic numbers" spread across files.
*/

// Fixed internal canvas resolution.
export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 480;

// Base tile pixel size from tileset and final rendered scale on canvas.
export const TILE_SIZE = 16;
export const TILE_SCALE = 3;
export const TILE_DISPLAY_SIZE = TILE_SIZE * TILE_SCALE;

// All image paths used by the game.
export const ASSET_PATHS = {
  backgroundBack: "assets/images/backgrounds/forest/back.png",
  backgroundMiddle: "assets/images/backgrounds/forest/middle.png",
  tileSet: "assets/images/tilesets/tileset.png",
  playerSprite: "assets/images/sprites/player.png",
};

// Tile IDs from the tileset (0 means empty / no collision).
export const TILE_ID = {
  empty: 0,
  grassLeft: 1,
  grassMiddle: 2,
  grassRight: 3,
  dirtLeft: 26,
  dirtMiddle: 27,
  dirtRight: 28,
};