const IMG     = 'assets/images';
const SPRITES = `${IMG}/sprites`;

export const ASSET_PATHS = {

  BG_FOREST_BACK:   `${IMG}/backgrounds/forest/back.png`,
  BG_FOREST_MIDDLE: `${IMG}/backgrounds/forest/middle.png`,

  TILESET: `${IMG}/tilesets/tileset.png`,

  PLAYER_IDLE:     [1,2,3,4].map(n => `${SPRITES}/player/idle/player-idle-${n}.png`),
  PLAYER_RUN:      [1,2,3,4,5,6].map(n => `${SPRITES}/player/run/player-run-${n}.png`),
  PLAYER_JUMP:     [1,2].map(n => `${SPRITES}/player/jump/player-jump-${n}.png`),
  PLAYER_CROUCH:   [1,2].map(n => `${SPRITES}/player/crouch/player-crouch-${n}.png`),
  PLAYER_HURT:     [1,2].map(n => `${SPRITES}/player/hurt/player-hurt-${n}.png`),
  PLAYER_HURT2:    [`${SPRITES}/player/Hurt2/hurt-2.png`],
  PLAYER_DIZZY:    [1,2,3,4,5,6].map(n => `${SPRITES}/player/Dizzy/Dizzy${n}.png`),
  PLAYER_ROLL:     [1,2,3,4].map(n => `${SPRITES}/player/Roll/Roll${n}.png`),
  PLAYER_VICTORY:  [`${SPRITES}/player/Victory/Victory.png`],
  PLAYER_LOOK_UP:  [`${SPRITES}/player/LookUp/lookUp.png`],
  PLAYER_CLIMB:    [1,2,3].map(n => `${SPRITES}/player/climb/player-climb-${n}.png`),
  PLAYER_WALL_GRAB:[1,2].map(n => `${SPRITES}/player/WallGrab/wall-grab${n}.png`),

  ANT:       [1,2,3,4,5,6,7,8].map(n => `${SPRITES}/enemies/ant/ant-${n}.png`),
  EAGLE:     [1,2,3,4].map(n => `${SPRITES}/enemies/eagle/eagle-attack-${n}.png`),
  FROG_IDLE: [1,2,3,4].map(n => `${SPRITES}/enemies/frog/idle/frog-idle-${n}.png`),
  FROG_JUMP: [1,2].map(n => `${SPRITES}/enemies/frog/jump/frog-jump-${n}.png`),

  GEM:       [1,2,3,4,5].map(n => `${SPRITES}/pickups/gem/gem-${n}.png`),
  STAR_COIN: [1,2,3,4].map(n => `${SPRITES}/pickups/starCoin/item-feedback-${n}.png`),
  CHERRY:    [1,2,3,4,5,6,7].map(n => `${SPRITES}/pickups/cherry/cherry-${n}.png`),

  DEATH_EFFECT: [1,2,3,4].map(n => `${SPRITES}/effects/enemy-death-${n}.png`),

  PROP_CRANK_UP:     `${IMG}/props/crank-up.png`,
  PROP_CRANK_DOWN:   `${IMG}/props/crank-down.png`,
  PROP_DOOR:         `${IMG}/props/door.png`,
  PROP_DOOR_OPENED:  `${IMG}/props/door-opened.png`,
  PROP_SIGN:         `${IMG}/props/sign.png`,

  PROP_SPIKES:       `${IMG}/props/spikes.png`,
  PROP_SPIKES_TOP:   `${IMG}/props/spikes-top.png`,
};

export const AUDIO_PATHS = {
  MUSIC_LEVEL: 'assets/audio/music/platformer_level03_loop.ogg',
};

export const ASSET_ENTRIES = Object.entries(ASSET_PATHS).flatMap(([key, val]) => {
  if (Array.isArray(val)) {
    return val.map((src, i) => ({ key: `${key}_${i}`, src }));
  }
  return [{ key, src: val }];
});
