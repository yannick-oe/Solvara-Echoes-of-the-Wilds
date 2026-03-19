// #region Constants
export const CHARACTER_STORAGE_KEY = 'solvaraSelectedCharacter';
export const CHARACTER_IDS = ['fox', 'imp'];

export const FIREBALL_SPEED = 430;
export const FIREBALL_MAX_RANGE = 210;
export const FIREBALL_LIFETIME = 0.95;
export const FIREBALL_COOLDOWN = 0.22;
export const FIREBALL_W = 30;
export const FIREBALL_H = 20;

export const CHARACTER_PROFILES = {
  fox: {
    id: 'fox',
    label: 'Fox',
    ability: 'roll',
    canShootInAir: false,
    deathState: 'hurt2',
    anim: {
      idle:     { prefix: 'PLAYER_IDLE',      frames: 4, fps: 6 },
      run:      { prefix: 'PLAYER_RUN',       frames: 6, fps: 10 },
      jump:     { prefix: 'PLAYER_JUMP',      frames: 1, fps: 0 },
      fall:     { prefix: 'PLAYER_JUMP',      frames: 1, fps: 0 },
      crouch:   { prefix: 'PLAYER_CROUCH',    frames: 2, fps: 6 },
      lookUp:   { prefix: 'PLAYER_LOOK_UP',   frames: 1, fps: 0 },
      hurt:     { prefix: 'PLAYER_HURT',      frames: 2, fps: 8 },
      hurt2:    { prefix: 'PLAYER_HURT2',     frames: 1, fps: 0 },
      victory:  { prefix: 'PLAYER_VICTORY',   frames: 1, fps: 0 },
      wallGrab: { prefix: 'PLAYER_WALL_GRAB', frames: 2, fps: 4 },
      climb:    { prefix: 'PLAYER_CLIMB',     frames: 3, fps: 8 },
      roll:     { prefix: 'PLAYER_ROLL',      frames: 4, fps: 16 },
    },
  },
  imp: {
    id: 'imp',
    label: 'Imp',
    ability: 'fireball',
    canShootInAir: true,
    deathState: 'hurt',
    anim: {
      idle:       { prefix: 'IMP_PLAYER_IDLE',        frames: 4, fps: 7 },
      run:        { prefix: 'IMP_PLAYER_RUN',         frames: 8, fps: 12 },
      jump:       { prefix: 'IMP_PLAYER_JUMP',        frames: 1, fps: 0 },
      fall:       { prefix: 'IMP_PLAYER_JUMP',        frames: 1, fps: 0 },
      crouch:     { prefix: 'IMP_PLAYER_CROUCH',      frames: 3, fps: 7 },
      lookUp:     { prefix: 'IMP_PLAYER_IDLE',        frames: 1, fps: 0 },
      hurt:       { prefix: 'IMP_PLAYER_HURT',        frames: 2, fps: 8 },
      hurt2:      { prefix: 'IMP_PLAYER_HURT',        frames: 1, fps: 0 },
      victory:    { prefix: 'IMP_PLAYER_IDLE',        frames: 1, fps: 0 },
      wallGrab:   { prefix: 'IMP_PLAYER_CLIMB',       frames: 2, fps: 4 },
      climb:      { prefix: 'IMP_PLAYER_CLIMB',       frames: 4, fps: 8 },
      roll:       { prefix: 'IMP_PLAYER_SHOT',        frames: 1, fps: 0 },
      shot:       { prefix: 'IMP_PLAYER_SHOT',        frames: 4, fps: 18 },
      crouchShot: { prefix: 'IMP_PLAYER_CROUCH_SHOT', frames: 3, fps: 18 },
    },
  },
};
// #endregion

// #region Public Methods
/** Handles normalize Character Id. @param {*} value - Value to apply. @returns {*} - Resulting value. */
export function normalizeCharacterId(value) {
  return CHARACTER_IDS.includes(value) ? value : 'fox';
}

/** Gets character Profile. @param {*} characterId - Character Id value. @returns {*} - Resulting value. */
export function getCharacterProfile(characterId) {
  const key = normalizeCharacterId(characterId);
  return CHARACTER_PROFILES[key];
}

/** Loads selected Character. @returns {*} - Resulting value. */
export function loadSelectedCharacter() {
  try {
    const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    return normalizeCharacterId(raw);
  } catch {
    return 'fox';
  }
}

/** Saves selected Character. @param {*} characterId - Character Id value. @returns {void} - Nothing. */
export function saveSelectedCharacter(characterId) {
  try {
    localStorage.setItem(CHARACTER_STORAGE_KEY, normalizeCharacterId(characterId));
  } catch {}
}
// #endregion