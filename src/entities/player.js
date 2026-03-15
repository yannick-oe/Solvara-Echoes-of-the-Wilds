import { Entity } from './entity.js';
import { audioManager } from '../core/audioManager.js';
import { SFX_VOLUME }   from '../config/audioConfig.js';
import {
  ROLL_CHARGE_TIME,
  ROLL_SPEED_INIT,
  ROLL_FRICTION,
  ROLL_MIN_SPEED,
  INVUL_DURATION,
  HURT_DURATION,
  BLINK_INTERVAL,
  KNOCKBACK_X,
  KNOCKBACK_Y,
  WALL_SLIDE_GRAVITY,
  WALL_SLIDE_MAX_SPEED,
  WALL_JUMP_X,
  WALL_JUMP_Y,
  CLIMB_SPEED,
  COYOTE_TIME,
  JUMP_BUFFER,
} from '../config/playerConfig.js';
import {
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  JUMP_FORCE,
  PLAYER_SPEED,
} from '../core/constants.js';

const PLAYER_W = 32;
const PLAYER_H = 48;

const DRAW_W = 88;
const DRAW_H = 88;

const DRAW_OX = Math.round((PLAYER_W - DRAW_W) / 2);
const DRAW_OY = PLAYER_H - DRAW_H;

const ANIM = {
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

const FALL_FRAME = 1;

const DUST_POOL_SIZE = 24;

function makeDustPool() {
  return Array.from({ length: DUST_POOL_SIZE }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, r: 2, a: 0,
  }));
}

function spawnDust(pool, cx, groundY, count = 5) {
  let spawned = 0;
  for (const p of pool) {
    if (p.active) continue;
    const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
    const speed = 25 + Math.random() * 55;
    p.active  = true;
    p.x       = cx + (Math.random() - 0.5) * 16;
    p.y       = groundY;
    p.vx      = Math.cos(angle) * speed;
    p.vy      = Math.sin(angle) * speed - 20;
    p.life    = 0.25 + Math.random() * 0.20;
    p.maxLife = p.life;
    p.r       = 2 + Math.random() * 3;
    p.a       = 0.55 + Math.random() * 0.25;
    if (++spawned >= count) break;
  }
}

export class Player extends Entity {

  constructor(x, y) {
    super(x, y, PLAYER_W, PLAYER_H);
    this.facingRight = true;
    this.onGround    = false;

    this.state      = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;

    this._invulTimer = 0;
    this._hurtTimer  = 0;
    this.dying       = false;


    this._wallGrabSide = 0;
    this._wallLockSide = 0;


    this._onLadder           = false;
    this._climbMoving        = false;
    this._atLadderTop        = false;
    this._ladderExitCooldown = 0;


    this._coyoteTimer = 0;
    this._jumpBuffer  = 0;


    this._wallPushOffTimer = 0;


    this._rollChargeTimer = 0;
    this._rolling         = false;
    this._rollDir         = 0;
    this._rollSpeed       = 0;


    this._prevFeetY = y + PLAYER_H;

    this._dropThroughTimer = 0;


    this._squashTimer = 0;
    this._squashScale = 1.0;


    this._stepTimer = 0;


    this._dustPool = makeDustPool();
  }



  update(dt, input, tileMap) {

    if (this.dying) {
      this.velY  = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
      this.y    += this.velY * dt;
      this.x    += this.velX * dt;
      this.velX *= Math.max(0, 1 - 4 * dt);
      this._updateDust(dt);
      return;
    }


    if (this._invulTimer  > 0) this._invulTimer  = Math.max(0, this._invulTimer  - dt);
    if (this._hurtTimer   > 0) this._hurtTimer   = Math.max(0, this._hurtTimer   - dt);
    if (this._wallPushOffTimer > 0) this._wallPushOffTimer = Math.max(0, this._wallPushOffTimer - dt);
    if (this._ladderExitCooldown > 0) this._ladderExitCooldown = Math.max(0, this._ladderExitCooldown - dt);
    if (this._dropThroughTimer   > 0) this._dropThroughTimer   = Math.max(0, this._dropThroughTimer   - dt);
    if (this._stepTimer          > 0) this._stepTimer          = Math.max(0, this._stepTimer          - dt);

    if (this._squashTimer > 0) {
      this._squashTimer = Math.max(0, this._squashTimer - dt);
      this._squashScale = 0.92 + (1.0 - 0.92) * (1 - this._squashTimer / 0.10);
    } else {
      this._squashScale = 1.0;
    }


    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);



    if (!this._onLadder && this._atLadderTop && this._hurtTimer <= 0 &&
        input.down && !this._rolling) {
      const _ts  = TILE_SIZE;
      const _col = Math.floor((this.x + this.w / 2) / _ts);
      const _fr  = Math.floor((this.y + this.h) / _ts);


      const _ladderRow = tileMap.isLadder(_col, _fr) ? _fr
                       : tileMap.isLadder(_col, _fr + 1) ? _fr + 1 : -1;
      if (_ladderRow >= 0) {

        this.y = _ladderRow * _ts - this.h + 2;
        this._atLadderTop = false;
        this._enterLadder();
      } else {
        this._atLadderTop = false;
      }
    }


    const canLadder     = this._hurtTimer <= 0;
    const overlapLadder = canLadder && tileMap.isOnLadder(this.x, this.y, this.w, this.h);


    if (this._atLadderTop && !this._onLadder) {
      const _ts  = TILE_SIZE;
      const _col = Math.floor((this.x + this.w / 2) / _ts);
      const _fr  = Math.floor((this.y + this.h) / _ts);

      if (!tileMap.isLadder(_col, _fr) && !tileMap.isLadder(_col, _fr + 1)) {
        this._atLadderTop = false;
      }
    }


    if (!this._onLadder && overlapLadder && this._ladderExitCooldown <= 0 && (input.up || input.down)) {
      this._atLadderTop = false;
      this._enterLadder();
    }

    if (this._onLadder) {
      if (!overlapLadder) {


        if (this.velY <= 0) {
          this.velY = 0;
          this._atLadderTop = true;
          this._ladderExitCooldown = 0.2;
        }
        this._exitLadder();
      } else if (input.jumpPressed) {
        this._exitLadder();
        this.velY        = JUMP_FORCE;
        this._jumpBuffer = 0;
      }
    }


    if (this._onLadder) {
      this._handleLadder(dt, input, tileMap);
      this._updateAnim(dt, input);
      this._updateDust(dt);
      return;
    }



    const effectiveLookUp = input.lookUp ||
      (!overlapLadder && !this._atLadderTop && !!input.mobileUpActive);


    if (this.onGround && !this._rolling && this._hurtTimer <= 0) {

      if (input.rollPressed) {
        this._startRoll(this.facingRight ? 1 : -1);
      } else {
        const holdDir = input.left ? -1 : (input.right ? 1 : 0);
        if (input.down && holdDir !== 0) {
          this._rollChargeTimer = Math.min(this._rollChargeTimer + dt, ROLL_CHARGE_TIME);
          if (this._rollChargeTimer >= ROLL_CHARGE_TIME) {
            this._startRoll(holdDir);
          }
        } else {
          this._rollChargeTimer = 0;
        }
      }
    }


    if (this._rolling) {
      this._handleRoll(dt, input, tileMap);
      this._updateAnim(dt, input);
      this._updateDust(dt);
      return;
    }


    if (this.onGround) {
      this._coyoteTimer = COYOTE_TIME;
    } else {
      this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
    }


    if (this._hurtTimer <= 0) {
      this._detectWallGrab(tileMap, input);
    }

    if (this._wallGrabSide !== 0) {

      this._handleWallGrab(dt, input, tileMap);
    } else {

      if (this._hurtTimer <= 0) {
        if (input.left) {
          this.velX = -PLAYER_SPEED;
          this.facingRight = false;
        } else if (input.right) {
          this.velX = PLAYER_SPEED;
          this.facingRight = true;
        } else {
          this.velX = 0;
        }


        if (this.onGround && (input.down || effectiveLookUp)) {
          this.velX = 0;
        }


        const canJump = this.onGround || this._coyoteTimer > 0;


        if (this.onGround && input.down && this._jumpBuffer > 0 && this._dropThroughTimer <= 0) {
          const _ts = TILE_SIZE;
          const _fRow = Math.floor((this.y + this.h) / _ts);
          const _lCol = Math.floor(this.x / _ts);
          const _rCol = Math.floor((this.x + this.w - 1) / _ts);
          for (let _c = _lCol; _c <= _rCol; _c++) {
            if (tileMap.isOneWay(_c, _fRow)) {
              this._dropThroughTimer = 0.18;
              this._jumpBuffer       = 0;
              this.onGround          = false;
              this._coyoteTimer      = 0;
              break;
            }
          }
        }

        if (this._jumpBuffer > 0 && canJump) {
          this.velY         = JUMP_FORCE;
          this.onGround     = false;
          this._coyoteTimer = 0;
          this._jumpBuffer  = 0;
          this._atLadderTop = false;
          audioManager.playSfx('assets/audio/sfx/jumpSound.mp3', { volume: SFX_VOLUME.jump });
          spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
        }
      }


      this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);


      this.x += this.velX * dt;
      this._resolveX(tileMap);


      const wasGrounded = this.onGround;
      this.onGround = false;
      this._prevFeetY = this.y + this.h;
      this.y += this.velY * dt;
      this._resolveY(tileMap);



      if (this._atLadderTop && !this.onGround) {
        const _ts   = TILE_SIZE;
        const _col  = Math.floor((this.x + this.w / 2) / _ts);
        const _fRow = Math.floor((this.y + this.h) / _ts);
        if (tileMap.isLadder(_col, _fRow)) {
          this.y        = _fRow * _ts - this.h;
          this.velY     = 0;
          this.onGround = true;
        } else {
          this._atLadderTop = false;
        }
      }


      if (!wasGrounded && this.onGround) {
        const landSfx = tileMap.getLandingSound(this.x + this.w / 2, this.y + this.h);
        if (landSfx) audioManager.playSfx(landSfx, { volume: SFX_VOLUME.landing });
        this._squashTimer = 0.10;
        this._squashScale = 0.92;
        this._stepTimer   = 0.20;
        spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
        this._wallLockSide = 0;
      }


      if (this.onGround && this._hurtTimer <= 0 && Math.abs(this.velX) > 20) {
        if (this._stepTimer <= 0) {
          const stepSfx = tileMap.getFootstepSound(this.x + this.w / 2, this.y + this.h);
          if (stepSfx) audioManager.playSfx(stepSfx, { volume: SFX_VOLUME.footstep });
          this._stepTimer = 0.30;
        }
      }
    }

    this._updateAnim(dt, input, effectiveLookUp);
    this._updateDust(dt);
  }



  takeDamage(enemyCenterX) {
    if (this._invulTimer > 0 || this.dying) return false;
    const dir        = (this.x + this.w / 2) < enemyCenterX ? -1 : 1;
    this.velX        = dir * KNOCKBACK_X;
    this.velY        = KNOCKBACK_Y;
    this._hurtTimer  = HURT_DURATION;
    this._invulTimer = INVUL_DURATION;

    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    this._exitLadder();
    this._exitRoll();
    return true;
  }


  startDying() {
    this.dying       = true;
    this.state       = 'hurt2';
    this.frameIndex  = 0;
    this._invulTimer = 0;
    this.velX        = 0;
    this.velY        = -200;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    this._exitLadder();
    this._exitRoll();
  }


  startVictoryPose() {
    this.state      = 'victory';
    this.frameIndex = 0;
    this.velX       = 0;
    this.velY       = 0;
    this._wallGrabSide = 0;
    this._atLadderTop  = false;
    this._exitLadder();
    this._exitRoll();
  }



  draw(ctx, _cam, imageCache) {
    this._drawDust(ctx);

    if (!this.dying) {
      if (this._invulTimer > 0 && Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0) return;
    }

    const anim = ANIM[this.state];
    let fi = this.state === 'fall' ? FALL_FRAME : this.frameIndex;

    if (this.state === 'wallGrab') {
      fi = this._wallPushOffTimer > 0 ? 1 : 0;
    }


    let flipX = !this.facingRight;
    if (this.state === 'wallGrab') {
      flipX = this._wallGrabSide < 0;
    }

    const img = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;


    if (this._squashScale !== 1.0) {
      const squashH = DRAW_H * this._squashScale;
      const squashY = dy + (DRAW_H - squashH);
      if (!flipX) {
        ctx.drawImage(img, dx, squashY, DRAW_W, squashH);
      } else {
        ctx.save();
        ctx.translate(dx + DRAW_W, squashY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, DRAW_W, squashH);
        ctx.restore();
      }
    } else if (!flipX) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }



  _enterLadder() {
    this._onLadder     = true;
    this._atLadderTop  = false;
    this._wallGrabSide = 0;
    this.velX          = 0;
    this.velY          = 0;
    this._exitRoll();
  }

  _exitLadder() {
    this._onLadder    = false;
    this._climbMoving = false;
  }

  _handleLadder(dt, input, tileMap) {
    const ts = TILE_SIZE;


    const midCol   = Math.floor((this.x + this.w / 2) / ts);
    const ladderCX = midCol * ts + ts / 2;
    this.x        += (ladderCX - this.w / 2 - this.x) * Math.min(8 * dt, 1);

    this._climbMoving = false;
    if (input.up) {
      this.velY         = -CLIMB_SPEED;
      this._climbMoving = true;
    } else if (input.down) {
      this.velY         =  CLIMB_SPEED;
      this._climbMoving = true;
    } else {
      this.velY = 0;
    }
    this.velX = 0;
    this.y   += this.velY * dt;


    const probeY    = this.y + this.h;
    const bottomRow = Math.floor(probeY / ts);
    const col       = Math.floor((this.x + this.w / 2) / ts);
    if (this.velY >= 0 && tileMap.isSolid(col, bottomRow)) {
      this.y        = bottomRow * ts - this.h;
      this.velY     = 0;
      this.onGround = true;
      this._exitLadder();
      return;
    }


    const topRow = Math.floor(this.y / ts);
    if (this.velY < 0 && !tileMap.isLadder(col, topRow)) {


      this.y    = (topRow + 1) * ts - this.h;
      this.velY = 0;

      if (tileMap.isSolid(col, topRow)) {
        this.y = topRow * ts - this.h;
      }

      this.onGround            = true;
      this._atLadderTop        = true;
      this._ladderExitCooldown  = 0.15;
      this._exitLadder();
    }
  }



  _detectWallGrab(tileMap, input) {
    if (this.onGround) {
      this._wallGrabSide = 0;
      return;
    }

    const ts = TILE_SIZE;


    if (input.right && this._wallGrabSide !== -1 && this._wallLockSide !== 1) {
      const checkCol  = Math.floor((this.x + this.w) / ts);
      const topRow    = Math.floor(this.y / ts);
      const bottomRow = Math.floor((this.y + this.h - 1) / ts);
      for (let row = topRow; row <= bottomRow; row++) {
        if (tileMap.isSolid(checkCol, row)) {
          this._wallGrabSide = 1;
          this._wallLockSide = 0;
          this.facingRight   = true;
          return;
        }
      }
    }


    if (input.left && this._wallGrabSide !== 1 && this._wallLockSide !== -1) {
      const checkCol  = Math.floor((this.x - 1) / ts);
      const topRow    = Math.floor(this.y / ts);
      const bottomRow = Math.floor((this.y + this.h - 1) / ts);
      for (let row = topRow; row <= bottomRow; row++) {
        if (tileMap.isSolid(checkCol, row)) {
          this._wallGrabSide = -1;
          this._wallLockSide = 0;
          this.facingRight   = false;
          return;
        }
      }
    }


    if (this._wallGrabSide !== 0) {
      const stillTouch = this._isAgainstWall(tileMap, this._wallGrabSide);
      const stillPress = (this._wallGrabSide > 0 && input.right) ||
                         (this._wallGrabSide < 0 && input.left);
      if (!stillTouch || !stillPress) this._wallGrabSide = 0;
    }
  }

  _isAgainstWall(tileMap, side) {
    const ts       = TILE_SIZE;
    const checkCol = side > 0
      ? Math.floor((this.x + this.w) / ts)
      : Math.floor((this.x - 1) / ts);
    const topRow    = Math.floor(this.y / ts);
    const bottomRow = Math.floor((this.y + this.h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) return true;
    }
    return false;
  }

  _handleWallGrab(dt, input, tileMap) {
    this.velX = 0;

    if (this.velY < 0) this.velY = 0;
    this.velY = Math.min(this.velY + WALL_SLIDE_GRAVITY * dt, WALL_SLIDE_MAX_SPEED);


    const wasGrounded = this.onGround;
    this.onGround = false;
    this._prevFeetY = this.y + this.h;
    this.y += this.velY * dt;
    this._resolveY(tileMap);
    if (!wasGrounded && this.onGround) {
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
      this._wallLockSide = 0;
      this._wallGrabSide = 0;
      return;
    }

    if (this._jumpBuffer > 0) {
      const jumpDir          = -this._wallGrabSide;
      this.velX              = jumpDir * WALL_JUMP_X;
      this.velY              = WALL_JUMP_Y;
      this.facingRight       = jumpDir > 0;
      this._wallLockSide     = this._wallGrabSide;
      this._wallPushOffTimer = 0.10;
      this._wallGrabSide     = 0;
      this._jumpBuffer       = 0;
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 4);
    }
  }




  isRolling() { return this._rolling; }


  _startRoll(dir) {
    this._rolling         = true;
    this._rollDir         = dir;
    this._rollSpeed       = ROLL_SPEED_INIT;
    this._rollChargeTimer = 0;
    this.facingRight      = dir > 0;
    audioManager.playLoopedSfx('roll', 'assets/audio/sfx/rollSound.mp3', { volume: SFX_VOLUME.roll });
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
  }


  _exitRoll() {
    this._rolling         = false;
    this._rollSpeed       = 0;
    this._rollDir         = 0;
    this._rollChargeTimer = 0;
    audioManager.stopLoopedSfx('roll');
  }



  rollHit() {
    this._rollSpeed *= 0.75;
    spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 5);
  }



  _handleRoll(dt, input, tileMap) {

    if (this._jumpBuffer > 0 && this.onGround) {
      this.velY        = JUMP_FORCE;
      this.onGround    = false;
      this._jumpBuffer = 0;
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
      this._exitRoll();
      return;
    }


    this._rollSpeed = Math.max(0, this._rollSpeed - ROLL_FRICTION * dt);
    if (this._rollSpeed < ROLL_MIN_SPEED) {
      this._exitRoll();
      return;
    }


    if (this.onGround && this._rollSpeed > ROLL_SPEED_INIT * 0.4) {
      if (Math.random() < 0.25) {
        spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 1);
      }
    }


    this.velX = this._rollDir * this._rollSpeed;
    this.x   += this.velX * dt;
    this._resolveX(tileMap);
    if (this.velX === 0) {
      this._exitRoll();
      return;
    }


    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
    const wasGrounded = this.onGround;
    this.onGround = false;
    this._prevFeetY = this.y + this.h;
    this.y += this.velY * dt;
    this._resolveY(tileMap);
    if (!wasGrounded && this.onGround) {
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
      this._wallLockSide = 0;
    }
  }





  _updateAnim(dt, input, lookUpOverride = false) {
    let next;
    const FALL_THRESHOLD = 60;


    if (this._wallPushOffTimer > 0 && this._wallGrabSide === 0) {
      if (this.state !== 'wallGrab') {
        this.state      = 'wallGrab';
        this.frameIndex = 1;
        this.frameTimer = 0;
      }
      return;
    }

    if (this._hurtTimer > 0) {
      next = 'hurt';
    } else if (this._wallGrabSide !== 0) {
      next = 'wallGrab';
    } else if (this._onLadder) {
      next = 'climb';
    } else if (this._rolling) {
      next = 'roll';
    } else if (!this.onGround) {
      next = this.velY < FALL_THRESHOLD ? 'jump' : 'fall';
    } else if (input.down) {
      next = 'crouch';
    } else if (lookUpOverride) {
      next = 'lookUp';
    } else if (this.velX !== 0) {
      next = 'run';
    } else {
      next = 'idle';
    }


    if (next === 'climb' && !this._climbMoving) {
      if (this.state !== 'climb') {
        this.state      = 'climb';
        this.frameIndex = 0;
        this.frameTimer = 0;
      }
      return;
    }

    if (next !== this.state) {
      this.state      = next;
      this.frameIndex = 0;
      this.frameTimer = 0;
      return;
    }

    const anim = ANIM[this.state];
    if (anim.fps === 0) return;

    this.frameTimer += dt;
    const frameDuration = 1 / anim.fps;
    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.frameIndex  = (this.frameIndex + 1) % anim.frames;
    }
  }



  _updateDust(dt) {
    for (const p of this._dustPool) {
      if (!p.active) continue;
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 80 * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }

  _drawDust(ctx) {
    ctx.save();
    for (const p of this._dustPool) {
      if (!p.active) continue;
      const lifeF = p.life / p.maxLife;
      ctx.globalAlpha = p.a * lifeF;

      ctx.fillStyle   = '#c8b89a';
      ctx.shadowColor = '#a09070';
      ctx.shadowBlur  = p.r * 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * lifeF, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }





  _resolveX(tileMap) {
    if (this.velX === 0) return;

    const ts       = TILE_SIZE;
    const checkCol = this.velX > 0
      ? Math.floor((this.x + this.w - 1) / ts)
      : Math.floor(this.x / ts);
    const topRow    = Math.floor(this.y / ts);
    const bottomRow = Math.floor((this.y + this.h - 1) / ts);

    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        this.x    = this.velX > 0
          ? checkCol * ts - this.w
          : (checkCol + 1) * ts;
        this.velX = 0;
        break;
      }
    }
  }



  _resolveY(tileMap) {
    const ts       = TILE_SIZE;
    const leftCol  = Math.floor(this.x / ts);
    const rightCol = Math.floor((this.x + this.w - 1) / ts);

    if (this.velY >= 0) {
      const probeY    = this.y + this.h;
      const bottomRow = Math.floor(probeY / ts);

      for (let col = leftCol; col <= rightCol; col++) {

        if (tileMap.isSolid(col, bottomRow)) {
          this.y        = bottomRow * ts - this.h;
          this.velY     = 0;
          this.onGround = true;
          return;
        }

        if (this._dropThroughTimer <= 0 && tileMap.isOneWay(col, bottomRow)) {
          const platformTop = bottomRow * ts;
          if (this._prevFeetY <= platformTop) {
            this.y        = platformTop - this.h;
            this.velY     = 0;
            this.onGround = true;
            return;
          }
        }
      }
    } else {
      const topRow = Math.floor(this.y / ts);

      for (let col = leftCol; col <= rightCol; col++) {
        if (tileMap.isSolid(col, topRow)) {
          this.y    = (topRow + 1) * ts;
          this.velY = 0;
          return;
        }
      }
    }
  }
}
