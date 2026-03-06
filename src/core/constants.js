// Canvas
export const CANVAS_WIDTH  = 720;
export const CANVAS_HEIGHT = 480;

// Tile-Raster
export const TILE_SIZE = 16;

// Physik-Basis (werden in Player verfeinert)
export const GRAVITY       = 0.5;
export const MAX_FALL_SPEED = 14;
export const JUMP_FORCE    = -12;

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
