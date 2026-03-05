import { SpriteSheet } from "./spriteSheet.js";
import { GAMEPLAY } from "./constants.js";

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

    this.deathCount = 0;
    this.isRespawning = false;
    this.respawnDuration = 0.45;
    this.respawnTimer = 0;

    this.startHearts = GAMEPLAY.startHearts;
    this.hardMaxHearts = GAMEPLAY.maxHearts;
    this.maxHearts = this.startHearts;
    this.hearts = this.startHearts;
    this.hitInvulnerabilityTime = GAMEPLAY.hitInvulnerabilityTime;
    this.hitInvulnerabilityTimer = 0;
    this.worldResetRequested = false;
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

    this.maxHearts = this.startHearts;
    this.hearts = this.startHearts;
    this.hitInvulnerabilityTimer = 0;
  }

  startRespawn() {
    this.deathCount += 1;
    this.isRespawning = true;
    this.respawnTimer = this.respawnDuration;
    this.vx = 0;
    this.vy = 0;
    this.currentAnimationName = "hurt";
    this.currentFramePointer = 0;
    this.animationTimer = 0;
    this.worldResetRequested = true;
  }

  updateRespawnTimer(dt) {
    this.respawnTimer -= dt;
    if (this.respawnTimer > 0) return;
    this.isRespawning = false;
    this.resetToSpawn();
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  updateInvulnerability(dt) {
    this.hitInvulnerabilityTimer -= dt;
    if (this.hitInvulnerabilityTimer < 0) this.hitInvulnerabilityTimer = 0;
  }

  canTakeHit() {
    return this.hitInvulnerabilityTimer <= 0 && !this.isRespawning;
  }

  takeHit(hitFromX) {
    if (!this.canTakeHit()) return;
    this.hearts -= 1;
    this.hitInvulnerabilityTimer = this.hitInvulnerabilityTime;
    this.vx = hitFromX < this.x ? GAMEPLAY.knockbackX : -GAMEPLAY.knockbackX;
    this.vy = -GAMEPLAY.knockbackY;
    if (this.hearts > 0) return;
    this.startRespawn();
  }

  stompBounce() {
    this.vy = -this.jumpForce * GAMEPLAY.stompBounceFactor;
    this.onGround = false;
  }

  consumeWorldResetRequest() {
    if (!this.worldResetRequested) return false;
    this.worldResetRequested = false;
    return true;
  }

  readHorizontalInput(input) {
    let direction = 0;
    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) direction -= 1;
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) direction += 1;
    return direction;
  }

  readJumpInput(input) {
    return (
      input.wasPressed("Space") ||
      input.wasPressed("ArrowUp") ||
      input.wasPressed("KeyW")
    );
  }

  readDuckInput(input) {
    return input.isDown("ArrowDown") || input.isDown("KeyS");
  }

  updateFacing(horizontalDirection) {
    if (horizontalDirection > 0) this.facing = 1;
    if (horizontalDirection < 0) this.facing = -1;
  }

  applyHorizontalMovement(horizontalDirection, isDucking) {
    this.vx = isDucking ? 0 : horizontalDirection * this.moveSpeed;
  }

  tryJump(jumpPressed, isDucking) {
    if (!jumpPressed || !this.onGround || isDucking) return;
    this.vy = -this.jumpForce;
    this.onGround = false;
  }

  applyGravity(dt) {
    this.vy += this.gravity * dt;
  }

  moveHorizontally(level, dt) {
    this.x += this.vx * dt;
    this.resolveCollisionsX(level);
  }

  moveVertically(level, dt) {
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveCollisionsY(level);
    this.probeGround(level);
  }

  fellOutOfWorld(level) {
    const killY = level.pixelHeight + level.tileDisplaySize * 2;
    return this.y > killY;
  }

  touchesHazard(level) {
    return level.rectTouchesHazard(this.x, this.y, this.width, this.height);
  }

  shouldRespawn(level) {
    return this.fellOutOfWorld(level);
  }

  update(dt, input, level) {
    if (this.isRespawning) {
      this.updateRespawnTimer(dt);
      return;
    }

    this.updateInvulnerability(dt);

    const horizontalDirection = this.readHorizontalInput(input);
    const jumpPressed = this.readJumpInput(input);
    const isDucking = this.onGround && this.readDuckInput(input);

    this.updateFacing(horizontalDirection);
    this.applyHorizontalMovement(horizontalDirection, isDucking);
    this.tryJump(jumpPressed, isDucking);
    this.applyGravity(dt);
    this.moveHorizontally(level, dt);
    this.moveVertically(level, dt);
    if (this.touchesHazard(level)) this.takeHit(this.x - this.facing * 20);

    if (this.shouldRespawn(level)) {
      this.startRespawn();
      return;
    }

    this.updateAnimation(dt, horizontalDirection, isDucking);
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

  updateAnimation(dt, horizontalDirection, isDucking) {
    if (this.playDuckAnimation(dt, isDucking)) return;
    this.exitDuckAnimation();

    const nextAnimation = this.selectMovementAnimation(horizontalDirection);
    this.changeAnimation(nextAnimation);
    this.advanceAnimation(dt);
  }

  playDuckAnimation(dt, isDucking) {
    if (!isDucking || !this.onGround) return false;
    if (this.currentAnimationName !== "duck") {
      this.changeAnimation("duck");
      return true;
    }

    this.animationTimer += dt;
    if (this.animationTimer < this.animationFrameDuration) return true;
    this.animationTimer -= this.animationFrameDuration;
    this.currentFramePointer = this.currentFramePointer === 1 ? 2 : 1;
    if (this.currentFramePointer === 0) this.currentFramePointer = 1;
    return true;
  }

  exitDuckAnimation() {
    if (this.currentAnimationName !== "duck") return;
    this.currentFramePointer = 0;
    this.animationTimer = 0;
  }

  selectMovementAnimation(horizontalDirection) {
    if (!this.onGround) return this.vy < 0 ? "jump" : "fall";
    if (horizontalDirection !== 0) return "walk";
    return "idle";
  }

  changeAnimation(name) {
    if (this.currentAnimationName === name) return;
    this.currentAnimationName = name;
    this.currentFramePointer = 0;
    this.animationTimer = 0;
  }

  advanceAnimation(dt) {
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
    if (this.hitInvulnerabilityTimer > 0) {
      const flashVisible = Math.floor(this.hitInvulnerabilityTimer * 12) % 2 === 0;
      if (!flashVisible) return;
    }

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