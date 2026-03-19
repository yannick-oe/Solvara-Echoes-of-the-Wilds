// #region Constants
export const MUSIC_IDS = {
  START_MENU: 'startMenu',
  LEVEL_01: 'level01',
  VICTORY: 'victory',
  GAME_OVER: 'gameOver',
};

export const SFX_IDS = {
  JUMP: 'jump',
  LANDING_GRASS: 'landingGrass',
  FOOTSTEP_GRASS: 'footstepGrass',
  ROLL: 'roll',
  ENEMY_KILL: 'enemyKill',
  SWITCH_TOGGLE: 'switchToggle',
  PICKUP_STAR_COIN: 'pickupStarCoin',
  PICKUP_GEM: 'pickupGem',
  PICKUP_CHERRY: 'pickupCherry',
  HURT: 'hurt',
  DEATH: 'death',
};

export const MUSIC_TRACKS = {
  [MUSIC_IDS.START_MENU]: { src: 'assets/audio/music/startMenu.ogg', volume: 0.55 },
  [MUSIC_IDS.LEVEL_01]: { src: 'assets/audio/music/level01.ogg', volume: 0.50 },
  [MUSIC_IDS.VICTORY]: { src: 'assets/audio/music/victory.mp3', volume: 0.60 },
  [MUSIC_IDS.GAME_OVER]: { src: 'assets/audio/music/gameOver.mp3', volume: 0.50 },
};

export const SFX_TRACKS = {
  [SFX_IDS.JUMP]: { src: 'assets/audio/sfx/jumpSound.mp3', volume: 0.07, cooldownMs: 80 },
  [SFX_IDS.LANDING_GRASS]: { src: 'assets/audio/sfx/grassLanding.mp3', volume: 0.18, cooldownMs: 120 },
  [SFX_IDS.FOOTSTEP_GRASS]: { src: 'assets/audio/sfx/grassLanding.mp3', volume: 0.09, cooldownMs: 120 },
  [SFX_IDS.ROLL]: { src: 'assets/audio/sfx/rollSound.mp3', volume: 0.18, cooldownMs: 180 },
  [SFX_IDS.ENEMY_KILL]: { src: 'assets/audio/sfx/enemyKill.mp3', volume: 0.32, cooldownMs: 80 },
  [SFX_IDS.SWITCH_TOGGLE]: { src: 'assets/audio/sfx/switchSound.mp3', volume: 0.22, cooldownMs: 120 },
  [SFX_IDS.PICKUP_STAR_COIN]: { src: 'assets/audio/sfx/pickUpStarCoin.mp3', volume: 0.26, cooldownMs: 80 },
  [SFX_IDS.PICKUP_GEM]: { src: 'assets/audio/sfx/pickUpGem.mp3', volume: 0.22, cooldownMs: 80 },
  [SFX_IDS.PICKUP_CHERRY]: { src: 'assets/audio/sfx/pickUpCherry.mp3', volume: 0.22, cooldownMs: 80 },
  [SFX_IDS.HURT]: { src: 'assets/audio/sfx/hurtSound.mp3', volume: 0.28, cooldownMs: 180 },
  [SFX_IDS.DEATH]: { src: 'assets/audio/sfx/deathSound.mp3', volume: 0.38, cooldownMs: 250 },
};
// #endregion

// #region Public Methods
/** Returns a music track entry. @param {string} key - The music track id. @returns {{ src: string, volume: number }|null} The configured track entry. */
export function getMusicTrack(key) {
  return MUSIC_TRACKS[key] ?? null;
}

/** Returns an sfx entry. @param {string} key - The sound effect id. @returns {{ src: string, volume: number, cooldownMs?: number }|null} The configured sfx entry. */
export function getSfxTrack(key) {
  return SFX_TRACKS[key] ?? null;
}
// #endregion
