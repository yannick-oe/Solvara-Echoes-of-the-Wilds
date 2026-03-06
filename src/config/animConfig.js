/**
 * Animations-Konfiguration.
 * frameCount  – Anzahl der Frames
 * ms          – Millisekunden pro Frame (Intervall)
 *
 * Cache-Keys werden nach folgendem Muster gebildet:
 *   ASSET_PATHS-Key + '_' + frameIndex   (z.B. PLAYER_IDLE_0, PLAYER_IDLE_1 …)
 */
export const ANIM_CONFIG = {
  // Spieler
  playerIdle:     { frameCount: 4, ms: 150, key: 'PLAYER_IDLE'      },
  playerRun:      { frameCount: 6, ms: 80,  key: 'PLAYER_RUN'       },
  playerJump:     { frameCount: 2, ms: 100, key: 'PLAYER_JUMP'      },
  playerCrouch:   { frameCount: 2, ms: 200, key: 'PLAYER_CROUCH'    },
  playerHurt:     { frameCount: 2, ms: 120, key: 'PLAYER_HURT'      },
  playerDizzy:    { frameCount: 6, ms: 100, key: 'PLAYER_DIZZY'     },
  playerRoll:     { frameCount: 4, ms: 60,  key: 'PLAYER_ROLL'      },
  playerClimb:    { frameCount: 3, ms: 120, key: 'PLAYER_CLIMB'     },
  playerWallGrab: { frameCount: 2, ms: 200, key: 'PLAYER_WALL_GRAB' },

  // Gegner
  ant:      { frameCount: 8, ms: 80,  key: 'ANT'       },
  eagle:    { frameCount: 4, ms: 100, key: 'EAGLE'     },
  frogIdle: { frameCount: 4, ms: 150, key: 'FROG_IDLE' },
  frogJump: { frameCount: 2, ms: 100, key: 'FROG_JUMP' },

  // Pickups
  gem:      { frameCount: 5, ms: 100, key: 'GEM'       },
  starCoin: { frameCount: 4, ms: 100, key: 'STAR_COIN' },
  cherry:   { frameCount: 7, ms: 100, key: 'CHERRY'    },

  // Effekte
  deathEffect: { frameCount: 4, ms: 80, key: 'DEATH_EFFECT' },
};
