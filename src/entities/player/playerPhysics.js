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
/** Resolves x. @param {*} player - Player value. @param {*} tileMap - Current tile map. @returns {void} - Nothing. */
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

/** Gets xCheck Col. @param {*} player - Player value. @param {*} ts - Ts value. @returns {*} - Resulting value. */
function getXCheckCol(player, ts) {
  return player.velX > 0
    ? Math.floor((player.x + player.w - 1) / ts)
    : Math.floor(player.x / ts);
}

/** Handles snap Player X. @param {*} player - Player value. @param {*} checkCol - Check Col value. @param {*} ts - Ts value. @returns {void} - Nothing. */
function snapPlayerX(player, checkCol, ts) {
  player.x = player.velX > 0
    ? checkCol * ts - player.w
    : (checkCol + 1) * ts;
  player.velX = 0;
}

/** Resolves y. @param {*} player - Player value. @param {*} tileMap - Current tile map. @returns {*} - Resulting value. */
export function resolveY(player, tileMap) {
  const ts = TILE_SIZE;
  const leftCol = Math.floor(player.x / ts);
  const rightCol = Math.floor((player.x + player.w - 1) / ts);
  if (player.velY >= 0) return resolveDown(player, tileMap, ts, leftCol, rightCol);
  resolveUp(player, tileMap, ts, leftCol, rightCol);
}

/** Resolves down. @param {*} player - Player value. @param {*} tileMap - Current tile map. @param {*} ts - Ts value. @param {*} leftCol - Left Col value. @param {*} rightCol - Right Col value. @returns {void} - Nothing. */
function resolveDown(player, tileMap, ts, leftCol, rightCol) {
  const bottomRow = Math.floor((player.y + player.h) / ts);
  for (let col = leftCol; col <= rightCol; col++) {
    if (trySolidLanding(player, tileMap, col, bottomRow, ts)) return;
    if (tryOneWayLanding(player, tileMap, col, bottomRow, ts)) return;
  }
}

/** Resolves up. @param {*} player - Player value. @param {*} tileMap - Current tile map. @param {*} ts - Ts value. @param {*} leftCol - Left Col value. @param {*} rightCol - Right Col value. @returns {void} - Nothing. */
function resolveUp(player, tileMap, ts, leftCol, rightCol) {
  const topRow = Math.floor(player.y / ts);
  for (let col = leftCol; col <= rightCol; col++) {
    if (!tileMap.isSolid(col, topRow)) continue;
    player.y = (topRow + 1) * ts;
    player.velY = 0;
    return;
  }
}

/** Handles try Solid Landing. @param {*} player - Player value. @param {*} tileMap - Current tile map. @param {*} col - Col value. @param {*} row - Row value. @param {*} ts - Ts value. @returns {boolean} - Whether the check passes. */
function trySolidLanding(player, tileMap, col, row, ts) {
  if (!tileMap.isSolid(col, row)) return false;
  player.y = row * ts - player.h;
  player.velY = 0;
  player.onGround = true;
  return true;
}

/** Handles try One Way Landing. @param {*} player - Player value. @param {*} tileMap - Current tile map. @param {*} col - Col value. @param {*} row - Row value. @param {*} ts - Ts value. @returns {boolean} - Whether the check passes. */
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
