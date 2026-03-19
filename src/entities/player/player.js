import { Entity } from '../entity.js';
import { updateAnim } from './playerAnimation.js';
import { updateDust } from './playerDust.js';
import { PLAYER_W, PLAYER_H } from './playerConstants.js';
import { playerStateMethods } from './playerStateMethods.js';
import { playerCombatMethods } from './playerCombatMethods.js';
import { playerMotionMethods } from './playerMotionMethods.js';
import { playerRenderMethods } from './playerRenderMethods.js';

export class Player extends Entity {
  constructor(x, y, options = {}) {
    super(x, y, PLAYER_W, PLAYER_H);
    this._initCharacterState(options);
    this._initCoreMotionState(y);
    this._initTraversalState();
    this._initRollAndFeedbackState();
    this._initCombatState();
  }

  update(dt, input, tileMap) {
    if (this._updateDying(dt)) return;
    this._tickTimers(dt);
    this._squashTick(dt);
    this._tickJumpBuffer(dt, input);
    const overlapLadder = this._prepareLadderState(input, tileMap);
    if (this._handleLadderPhase(dt, input, tileMap)) return;
    this._tryUseSpecialAction(dt, input);
    if (this._handleRollPhase(dt, input, tileMap)) return;
    this._updateCoyoteTimer(dt);
    this._tryDetectWallGrab(tileMap, input);
    const lookUp = this._resolveEffectiveLookUp(input, overlapLadder);
    this._runMovementPhase(dt, input, tileMap, lookUp, overlapLadder);
    updateAnim(this, dt, input, lookUp);
    updateDust(this._dustPool, dt);
  }
}

Object.assign(
  Player.prototype,
  playerStateMethods,
  playerCombatMethods,
  playerMotionMethods,
  playerRenderMethods,
);
