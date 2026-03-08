import { Entity } from './entity.js';
import {
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  JUMP_FORCE,
  PLAYER_SPEED,
} from '../core/constants.js';

// ─── Kollisions-Hitbox (Weltpixel) ───────────────────────────────────────────
const PLAYER_W = 32;
const PLAYER_H = 48;

// ─── Sprite-Zeichengröße (etwas größer für präsentere Optik) ────────────────
// 72 → 88: Charakter wirkt heldenhafter, Hitbox bleibt fair.
const DRAW_W = 88;
const DRAW_H = 88;

// Offset vom Hitbox-Ursprung zum Sprite-Ursprung:
//   X: zentriert horizontal  → (32 − 88) / 2 = −28
//   Y: Füße bündig unten     → 48 − 88       = −40
const DRAW_OX = Math.round((PLAYER_W - DRAW_W) / 2);
const DRAW_OY = PLAYER_H - DRAW_H;

// ─── Animations-Konfiguration ─────────────────────────────────────────────────
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
};

const FALL_FRAME = 1;

// ─── Schaden / Unverwundbarkeit ───────────────────────────────────────────────
const INVUL_DURATION = 1.1;
const HURT_DURATION  = 0.35;
const BLINK_INTERVAL = 0.09;
const KNOCKBACK_X    = 280;
const KNOCKBACK_Y    = -340;

// ─── Wall Grab / Jump ─────────────────────────────────────────────────────────
const WALL_SLIDE_GRAVITY   = 180;   // px/s² — reduzierte Schwerkraft am Wandgriff
const WALL_SLIDE_MAX_SPEED = 90;    // px/s — maximale Gleitgeschwindigkeit
const WALL_JUMP_X          = 380;   // px/s — horizontales Abstoßen
const WALL_JUMP_Y          = -680;  // px/s — vertikale Wandsprung-Kraft
const WALL_JUMP_LOCKOUT    = 0.20;  // Sekunden kein Re-Grab derselben Seite

// ─── Leiter ───────────────────────────────────────────────────────────────────
const CLIMB_SPEED = 120;   // px/s — Klettergeschwindigkeit

// ─── Coyote-Time / Sprungpuffer ───────────────────────────────────────────────
const COYOTE_TIME = 0.10;  // Sekunden nach Plattformverlassen
const JUMP_BUFFER = 0.12;  // Sekunden Voraus-Sprungpuffer

// ─── Staub-Partikel ───────────────────────────────────────────────────────────
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
  /** @param {number} x  Spawn-X  @param {number} y  Spawn-Y */
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

    // Wall Grab
    this._wallGrabSide = 0;      // -1 = links, 1 = rechts, 0 = keiner
    this._wallLockout  = 0;      // Timer: verhindert sofortiges Re-Grab
    this._wallLockSide = 0;      // Seite des letzten Wandsprungs

    // Klettern
    this._onLadder    = false;
    this._climbMoving = false;

    // Coyote-Time / Sprungpuffer
    this._coyoteTimer = 0;
    this._jumpBuffer  = 0;

    // Staub-Partikel
    this._dustPool = makeDustPool();
  }

  /**
   * @param {number}                                  dt
   * @param {import('../core/input.js').InputManager} input
   * @param {import('../world/tileMap.js').TileMap}   tileMap
   */
  update(dt, input, tileMap) {
    // Während Sterbe-Animation: nur freier Fall, keine Tile-Kollision, kein Input
    if (this.dying) {
      this.velY  = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
      this.y    += this.velY * dt;
      this.x    += this.velX * dt;
      this.velX *= Math.max(0, 1 - 4 * dt);
      this._updateDust(dt);
      return;
    }

    // Timer herunterzählen
    if (this._invulTimer  > 0) this._invulTimer  = Math.max(0, this._invulTimer  - dt);
    if (this._hurtTimer   > 0) this._hurtTimer   = Math.max(0, this._hurtTimer   - dt);
    if (this._wallLockout > 0) this._wallLockout  = Math.max(0, this._wallLockout - dt);

    // Sprungpuffer: Merkt einen zu frühen Sprungdruck
    if (input.jumpPressed) this._jumpBuffer = JUMP_BUFFER;
    else if (this._jumpBuffer > 0) this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);

    // ── Leiter-Overlap prüfen ──────────────────────────────────────────────
    const canLadder    = this._hurtTimer <= 0;
    const overlapLadder = canLadder && tileMap.isOnLadder(this.x, this.y, this.w, this.h);

    // Leiter-Einstieg
    if (!this._onLadder && overlapLadder && (input.up || input.down)) {
      this._enterLadder();
    }
    // Leiter-Ausstieg
    if (this._onLadder) {
      if (!overlapLadder) {
        this._exitLadder();
      } else if (input.jumpPressed) {
        this._exitLadder();
        this.velY        = JUMP_FORCE;
        this._jumpBuffer = 0;
      }
    }

    // Leiter-Modus: eigene Physik, danach fertig
    if (this._onLadder) {
      this._handleLadder(dt, input, tileMap);
      this._updateAnim(dt, input);
      this._updateDust(dt);
      return;
    }

    // ── Coyote-Timer ──────────────────────────────────────────────────────
    if (this.onGround) {
      this._coyoteTimer = COYOTE_TIME;
    } else {
      this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
    }

    // ── Wall-Grab-Detektion ───────────────────────────────────────────────
    if (this._hurtTimer <= 0) {
      this._detectWallGrab(tileMap, input);
    }

    if (this._wallGrabSide !== 0) {
      // ── Wall-Grab-Physik ────────────────────────────────────────────────
      this._handleWallGrab(dt, input);
    } else {
      // ── Normale Eingabe ─────────────────────────────────────────────────
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

        // Crouch / LookUp unterdrücken horizontale Bewegung
        if (this.onGround && (input.down || input.up)) {
          this.velX = 0;
        }

        // Sprung mit Coyote-Time + Sprungpuffer
        const canJump = this.onGround || this._coyoteTimer > 0;
        if (this._jumpBuffer > 0 && canJump) {
          this.velY         = JUMP_FORCE;
          this.onGround     = false;
          this._coyoteTimer = 0;
          this._jumpBuffer  = 0;
          spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 4);
        }
      }

      // Schwerkraft
      this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);

      // X bewegen + Kollision
      this.x += this.velX * dt;
      this._resolveX(tileMap);

      // Y bewegen + Kollision
      const wasGrounded = this.onGround;
      this.onGround = false;
      this.y += this.velY * dt;
      this._resolveY(tileMap);

      // Landedetektion → Staub + Lockout zurücksetzen
      if (!wasGrounded && this.onGround) {
        spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h, 6);
        this._wallLockSide = 0;
      }
    }

    this._updateAnim(dt, input);
    this._updateDust(dt);
  }

  /**
   * Wendet Trefferschaden an. Gibt true zurück wenn Schaden angenommen wurde.
   * @param {number} enemyCenterX
   * @returns {boolean}
   */
  takeDamage(enemyCenterX) {
    if (this._invulTimer > 0 || this.dying) return false;
    const dir        = (this.x + this.w / 2) < enemyCenterX ? -1 : 1;
    this.velX        = dir * KNOCKBACK_X;
    this.velY        = KNOCKBACK_Y;
    this._hurtTimer  = HURT_DURATION;
    this._invulTimer = INVUL_DURATION;
    // Wandgriff + Leiter sofort abbrechen
    this._wallGrabSide = 0;
    this._exitLadder();
    return true;
  }

  /** Versetzt den Spieler in den Sterbe-Zustand. */
  startDying() {
    this.dying       = true;
    this.state       = 'hurt2';
    this.frameIndex  = 0;
    this._invulTimer = 0;
    this.velX        = 0;
    this.velY        = -200;
    this._wallGrabSide = 0;
    this._exitLadder();
  }

  /** Friert den Spieler ein und spielt die Sieges-Pose. */
  startVictoryPose() {
    this.state      = 'victory';
    this.frameIndex = 0;
    this.velX       = 0;
    this.velY       = 0;
    this._wallGrabSide = 0;
    this._exitLadder();
  }

  /**
   * Zeichnet Staub-Partikel dann den aktuellen Animations-Frame.
   * @param {CanvasRenderingContext2D}                    ctx
   * @param {*}                                          _cam  (unused)
   * @param {import('../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    this._drawDust(ctx);

    if (!this.dying) {
      if (this._invulTimer > 0 && Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0) return;
    }

    const anim = ANIM[this.state];
    let fi = this.state === 'fall' ? FALL_FRAME : this.frameIndex;

    // Wandgriff: Sprite schaut immer ZUR Wand hin
    let flipX = !this.facingRight;
    if (this.state === 'wallGrab') {
      flipX = this._wallGrabSide < 0;
    }

    const img = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;

    if (!flipX) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }

  // ─── Leiter ────────────────────────────────────────────────────────────────

  _enterLadder() {
    this._onLadder    = true;
    this._wallGrabSide = 0;
    this.velX         = 0;
    this.velY         = 0;
  }

  _exitLadder() {
    this._onLadder    = false;
    this._climbMoving = false;
  }

  _handleLadder(dt, input, tileMap) {
    const ts = TILE_SIZE;

    // Horizontal zur Leitermitten-X einrasten
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

    // Boden der Leiter: unter uns ist solid → landen + aussteigen
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

    // Obere Kante: kein Leitertile mehr → aussteigen (nach oben rausklimmen)
    const topRow = Math.floor(this.y / ts);
    if (this.velY < 0 && !tileMap.isLadder(col, topRow)) {
      this._exitLadder();
    }
  }

  // ─── Wall Grab ─────────────────────────────────────────────────────────────

  _detectWallGrab(tileMap, input) {
    if (this.onGround) {
      this._wallGrabSide = 0;
      return;
    }

    const ts = TILE_SIZE;

    // Rechte Wand
    if (input.right && this._wallGrabSide !== -1) {
      const noLockout = !(this._wallLockout > 0 && this._wallLockSide === 1);
      if (noLockout) {
        const checkCol  = Math.floor((this.x + this.w) / ts);
        const topRow    = Math.floor(this.y / ts);
        const bottomRow = Math.floor((this.y + this.h - 1) / ts);
        for (let row = topRow; row <= bottomRow; row++) {
          if (tileMap.isSolid(checkCol, row)) {
            this._wallGrabSide = 1;
            this.facingRight   = true;
            return;
          }
        }
      }
    }

    // Linke Wand
    if (input.left && this._wallGrabSide !== 1) {
      const noLockout = !(this._wallLockout > 0 && this._wallLockSide === -1);
      if (noLockout) {
        const checkCol  = Math.floor(this.x / ts) - 1;
        const topRow    = Math.floor(this.y / ts);
        const bottomRow = Math.floor((this.y + this.h - 1) / ts);
        for (let row = topRow; row <= bottomRow; row++) {
          if (tileMap.isSolid(checkCol, row)) {
            this._wallGrabSide = -1;
            this.facingRight   = false;
            return;
          }
        }
      }
    }

    // Wandgriff lösen wenn kein Wandkontakt oder kein Drücken mehr
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
      : Math.floor(this.x / ts) - 1;
    const topRow    = Math.floor(this.y / ts);
    const bottomRow = Math.floor((this.y + this.h - 1) / ts);
    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) return true;
    }
    return false;
  }

  _handleWallGrab(dt, input) {
    this.velX = 0;
    this.velY = Math.min(this.velY + WALL_SLIDE_GRAVITY * dt, WALL_SLIDE_MAX_SPEED);
    this.y   += this.velY * dt;

    if (this._jumpBuffer > 0) {
      const jumpDir        = -this._wallGrabSide;
      this.velX            = jumpDir * WALL_JUMP_X;
      this.velY            = WALL_JUMP_Y;
      this.facingRight     = jumpDir > 0;
      this._wallLockSide   = this._wallGrabSide;
      this._wallLockout    = WALL_JUMP_LOCKOUT;
      this._wallGrabSide   = 0;
      this._jumpBuffer     = 0;
      spawnDust(this._dustPool, this.x + this.w / 2, this.y + this.h / 2, 4);
    }
  }

  // ─── Animations-Hilfsmethode ───────────────────────────────────────────────

  /**
   * Wählt den richtigen State und schaltet Frames weiter.
   *
   * Priorität (absteigend):
   *   1. hurt      → Schutz-State hat immer Vorrang
   *   2. wallGrab  → Wandgriff (airborne + Wandkontakt)
   *   3. climb     → Leiter
   *   4. airborne  → jump/fall
   *   5. crouch    → Boden + down
   *   6. lookUp    → Boden + up
   *   7. run       → velX ≠ 0
   *   8. idle
   */
  _updateAnim(dt, input) {
    let next;
    const FALL_THRESHOLD = 60;

    if (this._hurtTimer > 0) {
      next = 'hurt';
    } else if (this._wallGrabSide !== 0) {
      next = 'wallGrab';
    } else if (this._onLadder) {
      next = 'climb';
    } else if (!this.onGround) {
      next = this.velY < FALL_THRESHOLD ? 'jump' : 'fall';
    } else if (input.down) {
      next = 'crouch';
    } else if (input.up) {
      next = 'lookUp';
    } else if (this.velX !== 0) {
      next = 'run';
    } else {
      next = 'idle';
    }

    // Leiter-Pose: statisch wenn keine Bewegung
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

  // ─── Staub-Partikel ────────────────────────────────────────────────────────

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
      // Erdton: weiß-grau-hellbraun — NICHT gem/cherry/star-Farben
      ctx.fillStyle   = '#c8b89a';
      ctx.shadowColor = '#a09070';
      ctx.shadowBlur  = p.r * 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * lifeF, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Interne Kollisions-Hilfsmethoden ─────────────────────────────────────

  /**
   * Löst horizontale Tile-Kollision auf.
   * @param {import('../world/tileMap.js').TileMap} tileMap
   */
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

  /**
   * Löst vertikale Tile-Kollision auf.
   * @param {import('../world/tileMap.js').TileMap} tileMap
   */
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
