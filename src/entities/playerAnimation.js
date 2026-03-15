/**
 * Animations-Definitionen und Zustandsmaschine für den Spieler.
 * @module playerAnimation
 */

/** Animations-Tabelle: Zustandsname → Spritesheet-Konfiguration. */
export const ANIM = {
  idle:     { prefix: 'PLAYER_IDLE',     frames: 4, fps: 6  },
  run:      { prefix: 'PLAYER_RUN',      frames: 6, fps: 10 },
  jump:     { prefix: 'PLAYER_JUMP',     frames: 1, fps: 0  },
  fall:     { prefix: 'PLAYER_JUMP',     frames: 1, fps: 0  },
  crouch:   { prefix: 'PLAYER_CROUCH',   frames: 2, fps: 6  },
  lookUp:   { prefix: 'PLAYER_LOOK_UP',  frames: 1, fps: 0  },
  hurt:     { prefix: 'PLAYER_HURT',     frames: 2, fps: 8  },
  hurt2:    { prefix: 'PLAYER_HURT2',    frames: 1, fps: 0  },
  victory:  { prefix: 'PLAYER_VICTORY',  frames: 1, fps: 0  },
  wallGrab: { prefix: 'PLAYER_WALL_GRAB',frames: 2, fps: 4  },
  climb:    { prefix: 'PLAYER_CLIMB',    frames: 3, fps: 8  },
  roll:     { prefix: 'PLAYER_ROLL',     frames: 4, fps: 16 },
};

/**
 * Wählt den nächsten Animationszustand und rückt den Frame-Timer vor.
 * @param {import('./player.js').Player} player
 * @param {number} dt
 * @param {object} input
 * @param {boolean} [lookUpOverride=false]
 */
export function updateAnim(player, dt, input, lookUpOverride = false) {
  const FALL_THRESHOLD = 60;

  // Wandsprung-Übergangsframe fixieren
  if (player._wallPushOffTimer > 0 && player._wallGrabSide === 0) {
    if (player.state !== 'wallGrab') {
      player.state      = 'wallGrab';
      player.frameIndex = 1;
      player.frameTimer = 0;
    }
    return;
  }

  let next;
  if (player._hurtTimer > 0) {
    next = 'hurt';
  } else if (player._wallGrabSide !== 0) {
    next = 'wallGrab';
  } else if (player._onLadder) {
    next = 'climb';
  } else if (player._rolling) {
    next = 'roll';
  } else if (!player.onGround) {
    next = player.velY < FALL_THRESHOLD ? 'jump' : 'fall';
  } else if (input.down) {
    next = 'crouch';
  } else if (lookUpOverride) {
    next = 'lookUp';
  } else if (player.velX !== 0) {
    next = 'run';
  } else {
    next = 'idle';
  }

  // Klettern ohne Bewegung einfrieren
  if (next === 'climb' && !player._climbMoving) {
    if (player.state !== 'climb') {
      player.state      = 'climb';
      player.frameIndex = 0;
      player.frameTimer = 0;
    }
    return;
  }

  // Zustandswechsel: Frame-Counter zurücksetzen
  if (next !== player.state) {
    player.state      = next;
    player.frameIndex = 0;
    player.frameTimer = 0;
    return;
  }

  const anim = ANIM[player.state];
  if (anim.fps === 0) return;

  player.frameTimer += dt;
  const frameDuration = 1 / anim.fps;
  if (player.frameTimer >= frameDuration) {
    player.frameTimer -= frameDuration;
    player.frameIndex  = (player.frameIndex + 1) % anim.frames;
  }
}
