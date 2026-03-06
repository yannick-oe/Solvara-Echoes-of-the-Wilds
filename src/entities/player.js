import { Entity } from './entity.js';

export const PLAYER_STATE = Object.freeze({
  IDLE:      'idle',
  RUN:       'run',
  JUMP:      'jump',
  CROUCH:    'crouch',
  LOOK_UP:   'lookUp',
  HURT:      'hurt',
  DIZZY:     'dizzy',
  ROLL:      'roll',
  WALL_GRAB: 'wallGrab',
  CLIMB:     'climb',
  VICTORY:   'victory',
});

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 48);

    this.state       = PLAYER_STATE.IDLE;
    this.facingRight = true;
    this.onGround    = false;
    this.hearts      = 3;

    this._frameIndex  = 0;
    this._frameTick   = 0;
  }

  /**
   * @param {number} dt
   * @param {import('../core/input.js').InputManager} input
   * @param {import('../world/tileMap.js').TileMap}   tileMap
   */
  update(dt, input, tileMap) {
    // TODO: State Machine, Physik, Tile-Kollision
  }

  draw(ctx, cam, imageCache) {
    // TODO: Sprite je nach state + facingRight zeichnen
  }
}
