import { SpriteSheet } from "./spriteSheet.js";

/*
  player.js
  ---------
  Handles all player behavior:
  - movement input
  - gravity + jumping
  - tile collisions (X then Y)
  - animation state changes
  - sprite rendering + flip
*/

export class Player {
  /**
   * @param {HTMLImageElement} spriteImage Player spritesheet image.
   * @param {number} spawnX Spawn x in world pixels.
   * @param {number} spawnY Spawn y in world pixels.
   */
  constructor(spriteImage, spawnX, spawnY) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;

    this.width = 28;
    this.height = 48;

    this.x = spawnX;
    this.y = spawnY;

    this.vx = 0;
    this.vy = 0;

    this.moveSpeed = 250;
    this.jumpForce = 620;
    this.gravity = 1800;

    this.onGround = false;
    this.isDucking = false;
    this.facing = 1;

    this.sprite = new SpriteSheet(spriteImage, 33, 32);
    this.spriteScale = 3;
    this.drawOffsetX = -37;
    this.drawOffsetY = 0;

    this.animations = {
      idle: [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
        { col: 3, row: 0 },
      ],
      walk: [
        { col: 0, row: 1 },
        { col: 1, row: 1 },
        { col: 2, row: 1 },
        { col: 3, row: 1 },
        { col: 4, row: 1 },
        { col: 5, row: 1 },
      ],
      jump: [
        { col: 0, row: 3 },
        { col: 1, row: 3 },
        { col: 2, row: 3 },
        { col: 3, row: 3 },
        { col: 4, row: 3 },
        { col: 5, row: 3 },
      ],
      fall: [{ col: 5, row: 3 }],
      duck: [{ col: 1, row: 2 }],
    };

    this.currentAnimationName = "idle";
    this.currentFramePointer = 0;
    this.animationTimer = 0;
    this.animationFrameDuration = 0.1;
  }

  /**
   * Respawns the player to the original spawn point.
   */
  resetToSpawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.currentAnimationName = "idle";
    this.currentFramePointer = 0;
    this.animationTimer = 0;
  }

  /**
   * One physics update step for the player.
   * @param {number} dt Delta time in seconds.
   * @param {import("./input.js").Input} input Input helper.
   * @param {import("./level.js").Level} level Level object.
   */
  update(dt, input, level) {
    let moveX = 0;

    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) {
      moveX -= 1;
    }

    if (input.isDown("ArrowRight") || input.isDown("KeyD")) {
      moveX += 1;
    }

    this.isDucking = this.onGround && (input.isDown("ArrowDown") || input.isDown("KeyS"));

    if (!this.isDucking) {
      this.vx = moveX * this.moveSpeed;
    } else {
      this.vx = 0;
    }

    if (moveX > 0) this.facing = 1;
    if (moveX < 0) this.facing = -1;

    if (input.wasPressed("Space") && this.onGround && !this.isDucking) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }

    // Gravity always pulls down.
    this.vy += this.gravity * dt;

    // Move on X axis, then solve X collisions.
    this.x += this.vx * dt;
    this.resolveCollisionsX(level);

    // Move on Y axis, then solve Y collisions.
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveCollisionsY(level);

    if (this.y > level.pixelHeight + 220) {
      this.resetToSpawn();
    }

    this.updateAnimation(dt, moveX);
  }

  /**
   * Solves horizontal collisions against solid tiles.
   * @param {import("./level.js").Level} level Level object.
   */
  resolveCollisionsX(level) {
    const tileSize = level.tileDisplaySize;

    const left = Math.floor(this.x / tileSize);
    const right = Math.floor((this.x + this.width - 1) / tileSize);
    const top = Math.floor(this.y / tileSize);
    const bottom = Math.floor((this.y + this.height - 1) / tileSize);

    // Check every tile touched by the player's hitbox.
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (!level.isSolidTile(col, row)) continue;

        if (this.vx > 0) {
          this.x = col * tileSize - this.width;
        } else if (this.vx < 0) {
          this.x = (col + 1) * tileSize;
        }

        this.vx = 0;
      }
    }
  }

  /**
   * Solves vertical collisions against solid tiles.
   * @param {import("./level.js").Level} level Level object.
   */
  resolveCollisionsY(level) {
    const tileSize = level.tileDisplaySize;

    const left = Math.floor(this.x / tileSize);
    const right = Math.floor((this.x + this.width - 1) / tileSize);
    const top = Math.floor(this.y / tileSize);
    const bottom = Math.floor((this.y + this.height - 1) / tileSize);

    // Check every tile touched by the player's hitbox.
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (!level.isSolidTile(col, row)) continue;

        if (this.vy > 0) {
          this.y = row * tileSize - this.height;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y = (row + 1) * tileSize;
          this.vy = 0;
        }
      }
    }
  }

  /**
   * Simple AABB overlap check between player and level goal.
   * @param {{x:number,y:number,width:number,height:number}} goal Goal rectangle.
   */
  touchesGoal(goal) {
    return (
      this.x < goal.x + goal.width &&
      this.x + this.width > goal.x &&
      this.y < goal.y + goal.height &&
      this.y + this.height > goal.y
    );
  }

  /**
   * Chooses animation state and advances animation frames.
   * @param {number} dt Delta time in seconds.
   * @param {number} moveX Horizontal move intent (-1,0,1).
   */
  updateAnimation(dt, moveX) {
    let nextAnimationName = "idle";

    if (!this.onGround) {
      nextAnimationName = this.vy < 0 ? "jump" : "fall";
    } else if (this.isDucking) {
      nextAnimationName = "duck";
    } else if (moveX !== 0) {
      nextAnimationName = "walk";
    }

    if (nextAnimationName !== this.currentAnimationName) {
      this.currentAnimationName = nextAnimationName;
      this.currentFramePointer = 0;
      this.animationTimer = 0;
    }

    const currentFrames = this.animations[this.currentAnimationName];
    if (currentFrames.length <= 1) {
      this.currentFramePointer = 0;
      return;
    }

    // Accumulate time and step frame pointer in fixed animation intervals.
    this.animationTimer += dt;
    while (this.animationTimer >= this.animationFrameDuration) {
      this.animationTimer -= this.animationFrameDuration;
      this.currentFramePointer = (this.currentFramePointer + 1) % currentFrames.length;
    }
  }

  /**
   * Draws player sprite at camera-relative screen position.
   * @param {CanvasRenderingContext2D} ctx Render context.
   * @param {{x:number,y:number}} camera Camera offset.
   */
  draw(ctx, camera) {
    const currentFrames = this.animations[this.currentAnimationName];
    const framePos = currentFrames[this.currentFramePointer];
    const frame = this.sprite.frameAt(framePos.col, framePos.row);

    const drawX = Math.round(this.x + this.drawOffsetX - camera.x);
    const drawY = Math.round(this.y + this.drawOffsetY - camera.y);

    const drawWidth = frame.sw * this.spriteScale;
    const drawHeight = frame.sh * this.spriteScale;

    // Save so temporary flip transform does not affect other draws.
    ctx.save();
    if (this.facing < 0) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(this.sprite.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(
        this.sprite.image,
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }
    ctx.restore();
  }
}
