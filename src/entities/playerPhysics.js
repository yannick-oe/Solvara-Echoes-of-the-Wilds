/**
 * Kollisionsauflösung für den Spieler gegen die Karte.
 * @module playerPhysics
 */

import { TILE_SIZE } from '../core/constants.js';

/**
 * Horizontal-Kollision: schiebt den Spieler aus Wänden heraus.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function resolveX(player, tileMap) {
  if (player.velX === 0) return;

  const ts       = TILE_SIZE;
  const checkCol = player.velX > 0
    ? Math.floor((player.x + player.w - 1) / ts)
    : Math.floor(player.x / ts);
  const topRow    = Math.floor(player.y / ts);
  const bottomRow = Math.floor((player.y + player.h - 1) / ts);

  for (let row = topRow; row <= bottomRow; row++) {
    if (tileMap.isSolid(checkCol, row)) {
      player.x    = player.velX > 0
        ? checkCol * ts - player.w
        : (checkCol + 1) * ts;
      player.velX = 0;
      break;
    }
  }
}

/**
 * Vertikal-Kollision: erkennt Boden, Decken und One-Way-Plattformen.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function resolveY(player, tileMap) {
  const ts       = TILE_SIZE;
  const leftCol  = Math.floor(player.x / ts);
  const rightCol = Math.floor((player.x + player.w - 1) / ts);

  if (player.velY >= 0) {
    const probeY    = player.y + player.h;
    const bottomRow = Math.floor(probeY / ts);

    for (let col = leftCol; col <= rightCol; col++) {
      if (tileMap.isSolid(col, bottomRow)) {
        player.y        = bottomRow * ts - player.h;
        player.velY     = 0;
        player.onGround = true;
        return;
      }

      if (player._dropThroughTimer <= 0 && tileMap.isOneWay(col, bottomRow)) {
        const platformTop = bottomRow * ts;
        if (player._prevFeetY <= platformTop) {
          player.y        = platformTop - player.h;
          player.velY     = 0;
          player.onGround = true;
          return;
        }
      }
    }
  } else {
    const topRow = Math.floor(player.y / ts);

    for (let col = leftCol; col <= rightCol; col++) {
      if (tileMap.isSolid(col, topRow)) {
        player.y    = (topRow + 1) * ts;
        player.velY = 0;
        return;
      }
    }
  }
}
