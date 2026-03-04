import { SpriteSheet } from "../gfx/SpriteSheet.js";
import { Assets } from "../core/Assets.js";
import { Collision } from "../../world/Collision.js";
import { Entity } from "./Entity.js";
import {
  GRAVITY,
  PLAYER_SPEED,
  PLAYER_JUMP_FORCE,
  TILE_DISPLAY,
} from "../core/Constants.js";

export class Player extends Entity {
  static FRAMES_IDLE = [0, 1, 2, 3];
  static FRAMES_WALK = [6, 7, 8, 9, 10, 11];
  static FRAMES_JUMP = [18, 19, 20, 21, 22, 23];
  static FRAMES_FALL = [23];
  static FRAMES_DUCK = [13];

  /**
    * Creates the playable character.
    * @param {import("../core/ImageCache.js").ImageCache} imageCache Asset cache with preloaded images.
    * @param {{spawnCol:number,spawnRow:number}} level Level data with spawn position.
    * @param {(fn: Function, time: number) => number} setStoppableInterval Factory function for stoppable intervals.
   */
  constructor(imageCache, level, setStoppableInterval) {
    const hitW = 28;
    const hitH = 48;
    const ds = TILE_DISPLAY;
    const spawnX = level.spawnCol * ds + (ds - hitW) / 2;
    const spawnY = (level.spawnRow + 1) * ds - hitH;
    super(spawnX, spawnY, hitW, hitH);

    const img = imageCache.get(Assets.PLAYER_SHEET);
    this.sheet = new SpriteSheet(img, 33, 32);
    this.scale = 3;
    this.drawOffsetX = -37;
    this.drawOffsetY = -48;
    this.facingRight = true;
    this.isDucking = false;

    this.animations = {
      idle: Player.FRAMES_IDLE,
      walk: Player.FRAMES_WALK,
      jump: Player.FRAMES_JUMP,
      fall: Player.FRAMES_FALL,
      duck: Player.FRAMES_DUCK,
    };
    this.currentAnimationKey = "idle";
    this.currentAnimationFrames = this.animations.idle;
    this.currentImage = 0;

    this.intervalIds = [];
    this.setStoppableInterval = setStoppableInterval;
    this.#startAnimationInterval();
  }

  /**
    * Stops all intervals started by the player.
   */
  stopIntervals() {
    for (let i = 0; i < this.intervalIds.length; i++) {
      clearInterval(this.intervalIds[i]);
    }
    this.intervalIds = [];
  }

  /**
    * Creates a stoppable interval for the player.
    * @param {Function} fn The callback function to execute.
    * @param {number} time The interval in milliseconds.
   */
  #setStoppableInterval(fn, time) {
    const id = this.setStoppableInterval(fn, time);
    this.intervalIds.push(id);
    return id;
  }

  /**
    * Starts the interval for sprite frame switching.
   */
  #startAnimationInterval() {
    let self = this;
    this.#setStoppableInterval(function () {
      if (!self.active) return;
      if (self.currentAnimationFrames.length <= 1) {
        self.currentImage = 0;
        return;
      }
      self.currentImage = (self.currentImage + 1) % self.currentAnimationFrames.length;
    }, 100);
  }

  /**
    * Updates player movement, physics, and state flags.
    * @param {number} dt Delta time in seconds.
    * @param {import("../core/Input.js").Input} input Input system.
    * @param {import("../../world/Tilemap.js").Tilemap} tilemap Active tilemap.
   */
  update(dt, input, tilemap) {
    let moveX = 0;
    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) moveX -= 1;
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) moveX += 1;

    this.isDucking = this.onGround && (input.isDown("ArrowDown") || input.isDown("KeyS"));

    this.vx = this.isDucking ? 0 : moveX * PLAYER_SPEED;

    if (input.justPressed("Space") && this.onGround && !this.isDucking) {
      this.vy = -PLAYER_JUMP_FORCE;
      this.onGround = false;
    }

    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    Collision.resolveX(this, tilemap);

    this.onGround = false;
    this.y += this.vy * dt;
    Collision.resolveY(this, tilemap);

    if (!this.onGround && this.vy >= 0) {
      const ds = tilemap.displaySize;
      const feetRow = Math.floor((this.y + this.hitH) / ds);
      const leftCol = Math.floor(this.x / ds);
      const rightCol = Math.floor((this.x + this.hitW - 1) / ds);
      if (tilemap.isSolid(leftCol, feetRow) || tilemap.isSolid(rightCol, feetRow)) {
        this.y = feetRow * ds - this.hitH;
        this.vy = 0;
        this.onGround = true;
      }
    }

    const maxX = tilemap.cols * tilemap.displaySize - this.hitW;
    this.clampX(0, maxX);

    if (this.y > tilemap.rows * tilemap.displaySize + 200) {
      this.respawn();
    }

    if (moveX > 0) this.facingRight = true;
    if (moveX < 0) this.facingRight = false;

    this.#updateAnimation(dt, moveX);
  }

  /**
    * Selects the active animation based on movement state.
    * @param {number} _dt Delta time in seconds.
    * @param {number} moveX Horizontal input direction.
   */
  #updateAnimation(_dt, moveX) {
    let nextAnimationKey = "idle";
    if (!this.onGround) {
      nextAnimationKey = this.vy < 0 ? "jump" : "fall";
    } else if (this.isDucking) {
      nextAnimationKey = "duck";
    } else if (moveX !== 0) {
      nextAnimationKey = "walk";
    }

    if (nextAnimationKey !== this.currentAnimationKey) {
      this.currentAnimationKey = nextAnimationKey;
      this.currentAnimationFrames = this.animations[nextAnimationKey];
      this.currentImage = 0;
    }
  }

  /**
    * Draws the player relative to the camera.
    * @param {CanvasRenderingContext2D} ctx Rendering context.
    * @param {{x:number,y:number}} camera Camera offset.
   */
  draw(ctx, camera) {
    const frameIndex = this.currentAnimationFrames[this.currentImage];
    const f = this.sheet.frame(frameIndex);
    const screenX = Math.round(this.x + this.drawOffsetX - camera.x);
    const screenY = Math.round(this.y + this.drawOffsetY - camera.y);
    const w = f.sw * this.scale;
    const h = f.sh * this.scale;

    ctx.save();
    if (!this.facingRight) {
      ctx.translate(screenX + w, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(this.sheet.img, f.sx, f.sy, f.sw, f.sh, 0, 0, w, h);
    } else {
      ctx.drawImage(
        this.sheet.img,
        f.sx, f.sy, f.sw, f.sh,
        screenX, screenY, w, h
      );
    }
    ctx.restore();
  }
}