/**
 * Collision resolution for the player against the map.
 * @module playerPhysics
 */

// #region Imports
import { TILE_SIZE } from '../../core/constants.js';
// #endregion


/**
 * Horizontal collision: pushes the player out of walls.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
// #region Public Methods
/**
 * Handles resolve x.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 */
export function resolveX(player, tileMap) {
  if (player.velX === 0) return;
  const ts = TILE_SIZE;
  const checkCol = getXCheckCol(player, ts);
  const topRow = Math.floor(player.y / ts);
  const bottomRow = Math.floor((player.y + player.h - 1) / ts);
  for (let row = topRow; row <= bottomRow; row++) {
    if (!tileMap.isSolid(checkCol, row)) continue;
    snapPlayerX(player, checkCol, ts);
    break;
  }
}

/**
 * Returns the horizontal collision check column.
 * @param {object} player Input parameter.
 * @param {number} ts Input parameter.
 */
function getXCheckCol(player, ts) {
  return player.velX > 0
    ? Math.floor((player.x + player.w - 1) / ts)
    : Math.floor(player.x / ts);
}

/**
 * Snaps player against horizontal wall and clears velocity.
 * @param {object} player Input parameter.
 * @param {number} checkCol Input parameter.
 * @param {number} ts Input parameter.
 */
function snapPlayerX(player, checkCol, ts) {
  player.x = player.velX > 0
    ? checkCol * ts - player.w
    : (checkCol + 1) * ts;
  player.velX = 0;
}

/**
 * Vertical collision: detects floors, ceilings, and one-way platforms.
 * @param {import('./player.js').Player} player
 * @param {import('../world/tileMap.js').TileMap} tileMap
 */
export function resolveY(player, tileMap) {
  const ts = TILE_SIZE;
  const leftCol = Math.floor(player.x / ts);
  const rightCol = Math.floor((player.x + player.w - 1) / ts);
  if (player.velY >= 0) return resolveDown(player, tileMap, ts, leftCol, rightCol);
  resolveUp(player, tileMap, ts, leftCol, rightCol);
}

/**
 * Resolves downward movement against floor and one-way platforms.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} ts Input parameter.
 * @param {number} leftCol Input parameter.
 * @param {number} rightCol Input parameter.
 */
function resolveDown(player, tileMap, ts, leftCol, rightCol) {
  const bottomRow = Math.floor((player.y + player.h) / ts);
  for (let col = leftCol; col <= rightCol; col++) {
    if (trySolidLanding(player, tileMap, col, bottomRow, ts)) return;
    if (tryOneWayLanding(player, tileMap, col, bottomRow, ts)) return;
  }
}

/**
 * Resolves upward movement against ceilings.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} ts Input parameter.
 * @param {number} leftCol Input parameter.
 * @param {number} rightCol Input parameter.
 */
function resolveUp(player, tileMap, ts, leftCol, rightCol) {
  const topRow = Math.floor(player.y / ts);
  for (let col = leftCol; col <= rightCol; col++) {
    if (!tileMap.isSolid(col, topRow)) continue;
    player.y = (topRow + 1) * ts;
    player.velY = 0;
    return;
  }
}

/**
 * Tries landing on a solid tile.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} col Input parameter.
 * @param {number} row Input parameter.
 * @param {number} ts Input parameter.
 */
function trySolidLanding(player, tileMap, col, row, ts) {
  if (!tileMap.isSolid(col, row)) return false;
  player.y = row * ts - player.h;
  player.velY = 0;
  player.onGround = true;
  return true;
}

/**
 * Tries landing on one-way platform.
 * @param {object} player Input parameter.
 * @param {object} tileMap Input parameter.
 * @param {number} col Input parameter.
 * @param {number} row Input parameter.
 * @param {number} ts Input parameter.
 */
function tryOneWayLanding(player, tileMap, col, row, ts) {
  if (player._dropThroughTimer > 0 || !tileMap.isOneWay(col, row)) return false;
  const platformTop = row * ts;
  if (player._prevFeetY > platformTop) return false;
  player.y = platformTop - player.h;
  player.velY = 0;
  player.onGround = true;
  return true;
}
// #endregion
