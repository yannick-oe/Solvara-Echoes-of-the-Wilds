// Canvas
export const CANVAS_WIDTH  = 720;
export const CANVAS_HEIGHT = 480;

// Tile-Raster
export const TILE_SIZE = 48;

// Physik (dt-basiert, Einheit: px/s bzw. px/s²)
export const GRAVITY        = 1800;   // px/s²
export const MAX_FALL_SPEED = 900;    // px/s
export const JUMP_FORCE     = -750;   // px/s  (negativ = aufwärts)
export const PLAYER_SPEED   = 220;    // px/s

// HUD
export const PLAYER_START_HEARTS = 3;
export const PLAYER_MAX_HEARTS   = 5;
export const STAR_COIN_COUNT     = 3;

// Game States
export const GAME_STATES = Object.freeze({
  LOADING:  'LOADING',
  START:    'START',
  PLAYING:  'PLAYING',
  PAUSED:   'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY:  'VICTORY',
});
