import { SpriteSheet } from "./spriteSheet.js";

export class Player {
  constructor(spriteImage, spawnX, spawnY) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;

    // Hitbox (Welt-Kollision)
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
    this.facing = 1;

    // Sprite
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
      jump: [{ col: 0, row: 5 }],
      fall: [{ col: 1, row: 5 }],
      duck: [
        { col: 0, row: 3 }, // Frame 0 = "Start duck"
        { col: 1, row: 3 }, // Frame 1 = "Duck idle A"
        { col: 2, row: 3 }, // Frame 2 = "Duck idle B"
      ],
      hurt: [
        { col: 0, row: 4 },
        { col: 1, row: 4 },
      ],
    };

    this.currentAnimationName = "idle";
    this.currentFramePointer = 0;
    this.animationTimer = 0;
    this.animationFrameDuration = 0.1;
  }

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

  update(dt, input, level) {
    let moveX = 0;
    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) moveX -= 1;
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) moveX += 1;

    const jumpPressed =
      input.wasPressed("Space") ||
      input.wasPressed("ArrowUp") ||
      input.wasPressed("KeyW");

    const duckDown = input.isDown("ArrowDown") || input.isDown("KeyS");
    const isDucking = this.onGround && duckDown;

    if (moveX > 0) this.facing = 1;
    if (moveX < 0) this.facing = -1;

    // Horizontal Movement
    if (!isDucking) {
      this.vx = moveX * this.moveSpeed;
    } else {
      this.vx = 0;
    }

    // Jump
    if (jumpPressed && this.onGround && !isDucking) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }

    // Gravity
    this.vy += this.gravity * dt;

    // Move X + resolve
    this.x += this.vx * dt;
    this.resolveCollisionsX(level);

    // Move Y + resolve
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveCollisionsY(level);

    // Anti-jitter ground probe
    this.probeGround(level);

    // Respawn if too low
    if (this.y > level.pixelHeight + level.tileDisplaySize) {
      this.resetToSpawn();
      return;
    }

    this.updateAnimation(dt, moveX, isDucking);
  }

  resolveCollisionsX(level) {
    const tileSize = level.tileDisplaySize;

    const top = Math.floor(this.y / tileSize);
    const bottom = Math.floor((this.y + this.height - 1) / tileSize);

    if (this.vx > 0) {
      const right = Math.floor((this.x + this.width - 1) / tileSize);
      for (let row = top; row <= bottom; row++) {
        if (!level.isSolidTile(right, row)) continue;
        this.x = right * tileSize - this.width;
        this.vx = 0;
        return;
      }
    }

    if (this.vx < 0) {
      const left = Math.floor(this.x / tileSize);
      for (let row = top; row <= bottom; row++) {
        if (!level.isSolidTile(left, row)) continue;
        this.x = (left + 1) * tileSize;
        this.vx = 0;
        return;
      }
    }
  }

  resolveCollisionsY(level) {
    const tileSize = level.tileDisplaySize;

    const left = Math.floor(this.x / tileSize);
    const right = Math.floor((this.x + this.width - 1) / tileSize);

    if (this.vy > 0) {
      const bottom = Math.floor((this.y + this.height - 1) / tileSize);
      for (let col = left; col <= right; col++) {
        if (!level.isSolidTile(col, bottom)) continue;
        this.y = bottom * tileSize - this.height;
        this.vy = 0;
        this.onGround = true;
        return;
      }
    }

    if (this.vy < 0) {
      const top = Math.floor(this.y / tileSize);
      for (let col = left; col <= right; col++) {
        if (!level.isSolidTile(col, top)) continue;
        this.y = (top + 1) * tileSize;
        this.vy = 0;
        return;
      }
    }
  }

  probeGround(level) {
    if (this.onGround) return;
    if (this.vy < 0) return;

    const tileSize = level.tileDisplaySize;
    const feetY = this.y + this.height;
    const row = Math.floor(feetY / tileSize);

    const left = Math.floor(this.x / tileSize);
    const right = Math.floor((this.x + this.width - 1) / tileSize);

    for (let col = left; col <= right; col++) {
      if (!level.isSolidTile(col, row)) continue;

      this.y = row * tileSize - this.height;
      this.vy = 0;
      this.onGround = true;
      return;
    }
  }

  touchesGoal(goal) {
    return (
      this.x < goal.x + goal.width &&
      this.x + this.width > goal.x &&
      this.y < goal.y + goal.height &&
      this.y + this.height > goal.y
    );
  }

  updateAnimation(dt, moveX, isDucking) {
    // --- DUCK special: loop frames 1<->2, release -> frame 0 ---
    if (isDucking && this.onGround) {
      const duckFrames = this.animations.duck;

      // ensure we are in duck animation
      if (this.currentAnimationName !== "duck") {
        this.currentAnimationName = "duck";
        this.currentFramePointer = 0; // start frame
        this.animationTimer = 0;
        return; // frame 0 is shown for at least 1 tick
      }

      // loop only between index 1 and 2
      this.animationTimer += dt;
      while (this.animationTimer >= this.animationFrameDuration) {
        this.animationTimer -= this.animationFrameDuration;

        if (this.currentFramePointer < 1) {
          this.currentFramePointer = 1;
        } else {
          this.currentFramePointer = this.currentFramePointer === 1 ? 2 : 1;
        }
      }

      // safety: if array shorter, clamp
      if (duckFrames.length < 3) this.currentFramePointer = Math.min(duckFrames.length - 1, 0);

      return;
    }

    // If we were ducking and now released: show frame 0 once, then continue normal states
    if (this.currentAnimationName === "duck") {
      this.currentFramePointer = 0; // "stand up" frame
      this.animationTimer = 0;
      // fall through to normal state selection next (so in next frames idle/walk takes over)
    }

    // --- Normal state selector ---
    let next = "idle";

    if (!this.onGround) {
      next = this.vy < 0 ? "jump" : "fall";
    } else if (moveX !== 0) {
      next = "walk";
    }

    if (next !== this.currentAnimationName) {
      this.currentAnimationName = next;
      this.currentFramePointer = 0;
      this.animationTimer = 0;
    }

    const frames = this.animations[this.currentAnimationName];
    if (frames.length <= 1) {
      this.currentFramePointer = 0;
      return;
    }

    this.animationTimer += dt;
    while (this.animationTimer >= this.animationFrameDuration) {
      this.animationTimer -= this.animationFrameDuration;
      this.currentFramePointer = (this.currentFramePointer + 1) % frames.length;
    }
  }

  draw(ctx, camera) {
    const currentFrames = this.animations[this.currentAnimationName];
    const framePos = currentFrames[this.currentFramePointer];
    const frame = this.sprite.frameAt(framePos.col, framePos.row);

    const drawX = Math.round(this.x + this.drawOffsetX - camera.x);
    const drawY = Math.round(this.y + this.drawOffsetY - camera.y);

    const drawWidth = frame.sw * this.spriteScale;
    const drawHeight = frame.sh * this.spriteScale;

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