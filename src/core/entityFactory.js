/**
 * Creates and spawns all game-world entities from level data.
 * @module entityFactory
 */

// #region Imports
import { TILE_SIZE } from './constants.js';
import { Player }    from '../entities/player.js';
import { AntEnemy }  from '../entities/enemies/ant.js';
import { FrogEnemy } from '../entities/enemies/frog.js';
import { EagleEnemy } from '../entities/enemies/eagle.js';
import { Gem }       from '../entities/pickups/gem.js';
import { StarCoin }  from '../entities/pickups/starCoin.js';
import { Cherry }    from '../entities/pickups/cherry.js';
import { Door }      from '../entities/interactables/door.js';
import { Switch }    from '../entities/interactables/switch.js';
import { FloorSpike }   from '../entities/hazards/floorSpike.js';
import { CeilingSpike } from '../entities/hazards/ceilingSpike.js';
import { PROP_REGISTRY } from '../config/propConfig.js';
// #endregion

/**
 * Creates the player at the spawn position from the level.
 * @param {object} levelContent
 */
// #region Public Methods
/**
 * Handles create player.
 * @param {object} levelContent Input parameter.
 */
export function createPlayer(levelContent) {
  const spawn = levelContent?.playerSpawn;
  const x = spawn?.x ?? 2 * TILE_SIZE;
  const y = spawn?.y ?? (8 * TILE_SIZE - 48);
  return new Player(x, y);
}

/**
 * Creates all enemies from level data.
 * @param {object} levelContent
 */
export function spawnEnemies(levelContent) {
  const defs = levelContent?.enemies ?? [];
  return defs.map(def => {
    switch (def.type) {
      case 'ant':   return new AntEnemy(def.x, def.y);
      case 'frog':  return new FrogEnemy(def.x, def.y);
      case 'eagle': return new EagleEnemy(def.x, def.minY, def.maxY);
      default:      return null;
    }
  }).filter(Boolean);
}

/**
 * Creates all collectibles from level data.
 * @param {object} levelContent
 */
export function spawnPickups(levelContent) {
  const defs = levelContent?.pickups ?? [];
  return defs.map(def => {
    switch (def.type) {
      case 'gem':      return new Gem(def.x, def.y);
      case 'starCoin': return new StarCoin(def.x, def.y, def.slotIndex);
      case 'cherry':   return new Cherry(def.x, def.y);
      default:         return null;
    }
  }).filter(Boolean);
}

/**
 * Creates doors and switches from level data.
 * @param {object} levelContent
 */
export function spawnInteractables(levelContent) {
  const defs  = levelContent?.interactables ?? [];
  const doors = {};
  for (const def of defs) {
    if (def.type === 'door') doors[def.id] = new Door(def.x, def.y);
  }
  const result = Object.values(doors);
  for (const def of defs) {
    if (def.type === 'switch') {
      result.push(new Switch(def.x, def.y, doors[def.linkedDoor ?? 0]));
    }
  }
  return result;
}

/**
 * Creates all hazards (spikes, etc.) from level data.
 * @param {object} levelContent
 */
export function spawnHazards(levelContent) {
  const defs = levelContent?.hazards ?? [];
  return defs.map(def => {
    switch (def.type) {
      case 'floorSpike':
        return new FloorSpike(def.x, def.y);
      case 'ceilingSpike':
        return new CeilingSpike(def.x, def.y, def.triggers ?? false, def.triggerRange ?? 88);
      default:
        return null;
    }
  }).filter(Boolean);
}

/**
 * Creates all decorative props from level data.
 * @param {object} levelContent
 */
export function spawnProps(levelContent) {
  const defs = levelContent?.props ?? [];
  return defs.map(def => {
    const entry = PROP_REGISTRY[def.asset];
    if (!entry) return null;
    const base   = entry.defaultScale ?? 1;
    const instU  = def.scale  ?? 1;
    return {
      key:    entry.key,
      x:      def.x     ?? 0,
      y:      def.y     ?? 0,
      layer:  def.layer ?? 'back',
      scaleX: base * (def.scaleX ?? instU),
      scaleY: base * (def.scaleY ?? instU),
      flipX:  def.flipX ?? false,
      flipY:  def.flipY ?? false,
      alpha:  def.alpha ?? 1,
    };
  }).filter(Boolean);
}
// #endregion