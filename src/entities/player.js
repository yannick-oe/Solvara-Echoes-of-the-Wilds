import { Entity } from './entity.js';
import {
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  JUMP_FORCE,
  PLAYER_SPEED,
  CANVAS_HEIGHT,
} from '../core/constants.js';

// Kollisions-Hitbox in Weltpixeln
const PLAYER_W = 32;
const PLAYER_H = 48;

// Sprite-Zeichengröße (größer als Hitbox für angenehme Optik)
const DRAW_W = 72;
const DRAW_H = 72;

// Offset vom Hitbox-Ursprung zum Sprite-Ursprung:
//   X: zentriert horizontal  → (32 − 72) / 2 = −20
//   Y: Füße bündig unten     → 48 − 72       = −24
const DRAW_OX = (PLAYER_W - DRAW_W) / 2;
const DRAW_OY = PLAYER_H - DRAW_H;

// Animation-Konfiguration: Cache-Präfix, Frameanzahl, FPS (0 = statisch)
const ANIM = {
  idle:   { prefix: 'PLAYER_IDLE',    frames: 4, fps: 6  },
  run:    { prefix: 'PLAYER_RUN',     frames: 6, fps: 10 },
  jump:   { prefix: 'PLAYER_JUMP',    frames: 1, fps: 0  },  // Frame 0: Aufstieg
  fall:   { prefix: 'PLAYER_JUMP',    frames: 1, fps: 0  },  // Frame 1: Abstieg
  crouch: { prefix: 'PLAYER_CROUCH',  frames: 2, fps: 6  },
  lookUp: { prefix: 'PLAYER_LOOK_UP', frames: 1, fps: 0  },
  hurt:   { prefix: 'PLAYER_HURT',    frames: 2, fps: 8  },
  hurt2:  { prefix: 'PLAYER_HURT2',   frames: 1, fps: 0  },  // Tod-Pose
  victory:{ prefix: 'PLAYER_VICTORY', frames: 1, fps: 0  },  // Sieges-Pose
};

// Fester Frame-Index für die Fall-Pose
const FALL_FRAME = 1;

// Schaden / Unverwundbarkeit
const INVUL_DURATION = 1.1;   // Sekunden Unverwundbarkeit nach Treffer
const HURT_DURATION  = 0.35;  // Sekunden gesperrte Eingabe im Hurt-State
const BLINK_INTERVAL = 0.09;  // Sekunden pro Blink-Tick
const KNOCKBACK_X    = 280;   // px/s horizontaler Knockback
const KNOCKBACK_Y    = -340;  // px/s vertikaler Knockback (aufwärts)

export class Player extends Entity {
  /** @param {number} x  Spawn-X  @param {number} y  Spawn-Y */
  constructor(x, y) {
    super(x, y, PLAYER_W, PLAYER_H);
    this.facingRight = true;
    this.onGround = false;

    this.state = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;

    this._invulTimer = 0;   // verbleibende Unverwundbarkeitszeit (Sekunden)
    this._hurtTimer  = 0;   // verbleibende Zeit mit gesperrter Eingabe
    this.dying       = false;
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
      // Horizontale Geschwindigkeit abbremsen
      this.velX *= Math.max(0, 1 - 4 * dt);
      return;
    }

    // Timer herunterzählen
    if (this._invulTimer > 0) this._invulTimer = Math.max(0, this._invulTimer - dt);
    if (this._hurtTimer  > 0) this._hurtTimer  = Math.max(0, this._hurtTimer  - dt);

    // --- Eingabe: Nur außerhalb der gesperrten Hurt-Phase ---
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

      // Crouch und LookUp unterdrücken horizontale Bewegung
      if (this.onGround && (input.down || input.up)) {
        this.velX = 0;
      }

      // --- Sprung (nur wenn Boden berührt, einmaliger Tastendruck) ---
      if (input.jumpPressed && this.onGround) {
        this.velY = JUMP_FORCE;
        this.onGround = false;
      }
    }

    // --- Schwerkraft ---
    this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);

    // --- X bewegen → X-Kollision auflösen ---
    this.x += this.velX * dt;
    this._resolveX(tileMap);

    // --- Y bewegen → Y-Kollision auflösen ---
    this.onGround = false;
    this.y += this.velY * dt;
    this._resolveY(tileMap);

    // --- Animation ---
    this._updateAnim(dt, input);
  }

  /**
   * Wendet Trefferschaden an. Gibt true zurück wenn Schaden angenommen wurde.
   * @param {number} enemyCenterX  X-Mittelpunkt des angreifenden Gegners
   * @returns {boolean}
   */
  takeDamage(enemyCenterX) {
    if (this._invulTimer > 0 || this.dying) return false;
    const dir    = (this.x + this.w / 2) < enemyCenterX ? -1 : 1;
    this.velX        = dir * KNOCKBACK_X;
    this.velY        = KNOCKBACK_Y;
    this._hurtTimer  = HURT_DURATION;
    this._invulTimer = INVUL_DURATION;
    return true;
  }

  /** Versetzt den Spieler in den Sterbe-Zustand. Kein Input mehr, Death-Pose. */
  startDying() {
    this.dying       = true;
    this.state       = 'hurt2';
    this.frameIndex  = 0;
    this._invulTimer = 0;   // Blinken stoppen
    this.velX        = 0;
    this.velY        = -200;
  }

  /**
   * Friert den Spieler ein und spielt die Sieges-Pose.
   * Wird vom GameManager aufgerufen; keine Physik/Input danach mehr.
   */
  startVictoryPose() {
    this.state      = 'victory';
    this.frameIndex = 0;
    this.velX       = 0;
    this.velY       = 0;
  }

  /**
   * Zeichnet den aktuellen Animations-Frame; spiegelt wenn links schauend.
   * @param {CanvasRenderingContext2D}                    ctx
   * @param {*}                                          _cam  (unused)
   * @param {import('../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    // Während des Sterbens: immer zeichnen, kein Blinken
    if (!this.dying) {
      // Blinken während Unverwundbarkeit: jeden zweiten Tick ausblenden
      if (this._invulTimer > 0 && Math.floor(this._invulTimer / BLINK_INTERVAL) % 2 === 0) return;
    }

    const anim = ANIM[this.state];
    const fi   = this.state === 'fall' ? FALL_FRAME : this.frameIndex;
    const img  = imageCache.get(`${anim.prefix}_${fi}`);
    if (!img) return;

    // Sprite-Position: Hitbox-Ursprung + Zeichenoffset
    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;

    if (this.facingRight) {
      ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
    } else {
      ctx.save();
      ctx.translate(dx + DRAW_W, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // Animations-Hilfsmethode
  // ---------------------------------------------------------------------------

  /**
   * Wählt den richtigen State und schaltet Frames weiter.
   *
   * Priorität (absteigend):
   *   1. Airborne  → jump (velY < 0) | fall (velY > FALL_THRESHOLD)
   *   2. Ducken    → crouch  (input.down, am Boden)
   *   3. Hochschau → lookUp  (input.up,   am Boden)
   *   4. Bewegt    → run
   *   5. Stehen    → idle
   *
   * Crouch/LookUp haben Vorrang vor run, weil velX bereits auf 0
   * gesetzt wird wenn down oder up gehalten wird (siehe update()).
   *
   * @param {number} dt
   * @param {import('../core/input.js').InputManager} input
   */
  _updateAnim(dt, input) {
    let next;

    const FALL_THRESHOLD = 60;

    // Hurt-Phase: Hurt-Animation hat Vorrang
    if (this._hurtTimer > 0) {
      next = 'hurt';
    } else if (!this.onGround) {
      next = this.velY < 0 || this.velY <= FALL_THRESHOLD ? 'jump' : 'fall';
    } else if (input.down) {
      next = 'crouch';
    } else if (input.up) {
      next = 'lookUp';
    } else if (this.velX !== 0) {
      next = 'run';
    } else {
      next = 'idle';
    }

    // State-Wechsel: Frame zurücksetzen
    if (next !== this.state) {
      this.state = next;
      this.frameIndex = 0;
      this.frameTimer = 0;
      return;
    }

    const anim = ANIM[this.state];
    if (anim.fps === 0) return;   // statischer Frame

    this.frameTimer += dt;
    const frameDuration = 1 / anim.fps;
    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.frameIndex = (this.frameIndex + 1) % anim.frames;
    }
  }

  // ---------------------------------------------------------------------------
  // Interne Kollisions-Hilfsmethoden (AABB, Tile-basiert)
  // ---------------------------------------------------------------------------

  /**
   * Löst horizontale Tile-Kollision auf.
   * Prüft nur die führende Kante in Bewegungsrichtung.
   * @param {import('../world/tileMap.js').TileMap} tileMap
   */
  _resolveX(tileMap) {
    if (this.velX === 0) return;

    const ts = TILE_SIZE;
    // Führende Spalte: rechts wenn velX>0, links wenn velX<0
    // -1 vermeidet False-Positive bei exakter Kachelgrenze
    const checkCol = this.velX > 0
      ? Math.floor((this.x + this.w - 1) / ts)
      : Math.floor(this.x / ts);
    const topRow = Math.floor(this.y / ts);
    const bottomRow = Math.floor((this.y + this.h - 1) / ts);

    for (let row = topRow; row <= bottomRow; row++) {
      if (tileMap.isSolid(checkCol, row)) {
        this.x = this.velX > 0
          ? checkCol * ts - this.w       // rechts stoppen
          : (checkCol + 1) * ts;         // links stoppen
        this.velX = 0;
        break;
      }
    }
  }

  /**
   * Löst vertikale Tile-Kollision auf.
   * Bei velY≥0 Boden/Plattform prüfen, bei velY<0 Decke prüfen.
   * Setzt this.onGround=true wenn auf einer Kachel gelandet.
   * @param {import('../world/tileMap.js').TileMap} tileMap
   */
  _resolveY(tileMap) {
    const ts = TILE_SIZE;
    const leftCol = Math.floor(this.x / ts);
    const rightCol = Math.floor((this.x + this.w - 1) / ts);

    if (this.velY >= 0) {
      // WICHTIG:
      // Beim Fallen / Stehen prüfen wir leicht UNTER den Füßen,
      // damit Bodenkontakt auch bei Mini-Bewegungen stabil erkannt wird.
      const probeY = this.y + this.h;
      const bottomRow = Math.floor(probeY / ts);

      for (let col = leftCol; col <= rightCol; col++) {
        if (tileMap.isSolid(col, bottomRow)) {
          this.y = bottomRow * ts - this.h;
          this.velY = 0;
          this.onGround = true;
          return;
        }
      }
    } else {
      const topRow = Math.floor(this.y / ts);

      for (let col = leftCol; col <= rightCol; col++) {
        if (tileMap.isSolid(col, topRow)) {
          this.y = (topRow + 1) * ts;
          this.velY = 0;
          return;
        }
      }
    }
  }
}
