/* Canvas */
export const CANVAS_W = 720;
export const CANVAS_H = 480;

/* Tiles */
export const TILE_SIZE = 16;
export const TILE_SCALE = 3;
export const TILE_DISPLAY = TILE_SIZE * TILE_SCALE; // 48 px

/* Physics */
export const GRAVITY = 1800;
export const PLAYER_SPEED = 250;
export const PLAYER_JUMP_FORCE = 620;

/* Tile-IDs (1-based; 0 = empty; tileset index = id - 1)
   Sunny Land forest tileset: 25 cols x 23 rows, 16x16 px.
   Adjust these numbers if tiles look wrong. */
export const TileID = {
  EMPTY: 0,
  GRASS_LEFT: 1,
  GRASS_MID: 2,
  GRASS_RIGHT: 3,
  DIRT_LEFT: 26,
  DIRT: 27,
  DIRT_RIGHT: 28,
};
