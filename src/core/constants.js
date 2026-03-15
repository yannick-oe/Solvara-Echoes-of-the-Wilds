export const CANVAS_WIDTH  = 720;
export const CANVAS_HEIGHT = 480;

export const TILE_SIZE = 48;

export const GRAVITY        = 1800;
export const MAX_FALL_SPEED = 900;
export const JUMP_FORCE     = -750;
export const PLAYER_SPEED   = 220;

export const PLAYER_START_HEARTS = 3;
export const PLAYER_MAX_HEARTS   = 5;
export const STAR_COIN_COUNT     = 3;

export const GAME_STATES = Object.freeze({
  LOADING:  'LOADING',
  START:    'START',
  PLAYING:  'PLAYING',
  PAUSED:   'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY:  'VICTORY',
});
