import { SpriteSheet } from "./spriteSheet.js"; // Import a dependency used in this file.
import { GAMEPLAY } from "./constants.js"; // Import a dependency used in this file.

export class Player { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor(spriteImage, spawnX, spawnY) { // Execute this step in the current flow.
    this.spawnX = spawnX; // Store data on the current object instance.
    this.spawnY = spawnY; // Store data on the current object instance.


    this.width = 28; // Store data on the current object instance.
    this.height = 48; // Store data on the current object instance.

    this.x = spawnX; // Store data on the current object instance.
    this.y = spawnY; // Store data on the current object instance.

    this.vx = 0; // Store data on the current object instance.
    this.vy = 0; // Store data on the current object instance.

    this.moveSpeed = 250; // Store data on the current object instance.
    this.jumpForce = 620; // Store data on the current object instance.
    this.gravity = 1800; // Store data on the current object instance.

    this.onGround = false; // Store data on the current object instance.
    this.facing = 1; // Store data on the current object instance.


    this.sprite = new SpriteSheet(spriteImage, 33, 32); // Store data on the current object instance.
    this.spriteScale = 3; // Store data on the current object instance.
    this.drawOffsetX = -37; // Store data on the current object instance.
    this.drawOffsetY = 0; // Store data on the current object instance.

    this.animations = { // Store data on the current object instance.
      idle: [ // Execute this step in the current flow.
        { col: 0, row: 0 }, // Execute this step in the current flow.
        { col: 1, row: 0 }, // Execute this step in the current flow.
        { col: 2, row: 0 }, // Execute this step in the current flow.
        { col: 3, row: 0 }, // Execute this step in the current flow.
      ], // Execute this step in the current flow.
      walk: [ // Execute this step in the current flow.
        { col: 0, row: 1 }, // Execute this step in the current flow.
        { col: 1, row: 1 }, // Execute this step in the current flow.
        { col: 2, row: 1 }, // Execute this step in the current flow.
        { col: 3, row: 1 }, // Execute this step in the current flow.
        { col: 4, row: 1 }, // Execute this step in the current flow.
        { col: 5, row: 1 }, // Execute this step in the current flow.
      ], // Execute this step in the current flow.
      jump: [{ col: 0, row: 5 }], // Execute this step in the current flow.
      fall: [{ col: 1, row: 5 }], // Execute this step in the current flow.
      duck: [ // Execute this step in the current flow.
        { col: 0, row: 3 }, // Execute this step in the current flow.
        { col: 1, row: 3 }, // Execute this step in the current flow.
        { col: 2, row: 3 }, // Execute this step in the current flow.
      ], // Execute this step in the current flow.
      hurt: [ // Execute this step in the current flow.
        { col: 0, row: 4 }, // Execute this step in the current flow.
        { col: 1, row: 4 }, // Execute this step in the current flow.
      ], // Execute this step in the current flow.
      climb: [ // Execute this step in the current flow.
        { col: 0, row: 2 }, // Execute this step in the current flow.
        { col: 1, row: 2 }, // Execute this step in the current flow.
        { col: 2, row: 2 }, // Execute this step in the current flow.
        { col: 3, row: 2 }, // Execute this step in the current flow.
      ], // Execute this step in the current flow.
    };

    this.currentAnimationName = "idle"; // Store data on the current object instance.
    this.currentFramePointer = 0; // Store data on the current object instance.
    this.animationTimer = 0; // Store data on the current object instance.
    this.animationFrameDuration = 0.1; // Store data on the current object instance.

    this.deathCount = 0; // Store data on the current object instance.
    this.isRespawning = false; // Store data on the current object instance.
    this.respawnDuration = 0.45; // Store data on the current object instance.
    this.respawnTimer = 0; // Store data on the current object instance.

    this.startHearts = GAMEPLAY.startHearts; // Store data on the current object instance.
    this.hardMaxHearts = GAMEPLAY.maxHearts; // Store data on the current object instance.
    this.maxHearts = this.startHearts; // Store data on the current object instance.
    this.hearts = this.startHearts; // Store data on the current object instance.
    this.hitInvulnerabilityTime = GAMEPLAY.hitInvulnerabilityTime; // Store data on the current object instance.
    this.hitInvulnerabilityTimer = 0; // Store data on the current object instance.
    this.worldResetRequested = false; // Store data on the current object instance.
  }

  // This function handles the resetToSpawn behavior in this file.
  resetToSpawn() { // Execute this step in the current flow.
    this.x = this.spawnX; // Store data on the current object instance.
    this.y = this.spawnY; // Store data on the current object instance.
    this.vx = 0; // Store data on the current object instance.
    this.vy = 0; // Store data on the current object instance.
    this.onGround = false; // Store data on the current object instance.

    this.currentAnimationName = "idle"; // Store data on the current object instance.
    this.currentFramePointer = 0; // Store data on the current object instance.
    this.animationTimer = 0; // Store data on the current object instance.

    this.maxHearts = this.startHearts; // Store data on the current object instance.
    this.hearts = this.startHearts; // Store data on the current object instance.
    this.hitInvulnerabilityTimer = 0; // Store data on the current object instance.
  }

  // This function handles the startRespawn behavior in this file.
  startRespawn() { // Execute this step in the current flow.
    this.deathCount += 1; // Store data on the current object instance.
    this.isRespawning = true; // Store data on the current object instance.
    this.respawnTimer = this.respawnDuration; // Store data on the current object instance.
    this.vx = 0; // Store data on the current object instance.
    this.vy = 0; // Store data on the current object instance.
    this.currentAnimationName = "hurt"; // Store data on the current object instance.
    this.currentFramePointer = 0; // Store data on the current object instance.
    this.animationTimer = 0; // Store data on the current object instance.
    this.worldResetRequested = true; // Store data on the current object instance.
  }

  // This function handles the updateRespawnTimer behavior in this file.
  updateRespawnTimer(dt) { // Execute this step in the current flow.
    this.respawnTimer -= dt; // Store data on the current object instance.
    if (this.respawnTimer > 0) return; // Check a condition before executing this block.
    this.isRespawning = false; // Store data on the current object instance.
    this.resetToSpawn(); // Call a function to perform this step.
  }

  // This function handles the getRect behavior in this file.
  getRect() { // Execute this step in the current flow.
    return { x: this.x, y: this.y, width: this.width, height: this.height }; // Return control (and optionally a value) to the caller.
  }

  // This function handles the updateInvulnerability behavior in this file.
  updateInvulnerability(dt) { // Execute this step in the current flow.
    this.hitInvulnerabilityTimer -= dt; // Store data on the current object instance.
    if (this.hitInvulnerabilityTimer < 0) this.hitInvulnerabilityTimer = 0; // Check a condition before executing this block.
  }

  // This function handles the canTakeHit behavior in this file.
  canTakeHit() { // Execute this step in the current flow.
    return this.hitInvulnerabilityTimer <= 0 && !this.isRespawning; // Return control (and optionally a value) to the caller.
  }

  // This function handles the takeHit behavior in this file.
  takeHit(hitFromX) { // Execute this step in the current flow.
    if (!this.canTakeHit()) return; // Check a condition before executing this block.
    this.hearts -= 1; // Store data on the current object instance.
    this.hitInvulnerabilityTimer = this.hitInvulnerabilityTime; // Store data on the current object instance.
    this.vx = hitFromX < this.x ? GAMEPLAY.knockbackX : -GAMEPLAY.knockbackX; // Store data on the current object instance.
    this.vy = -GAMEPLAY.knockbackY; // Store data on the current object instance.
    if (this.hearts > 0) return; // Check a condition before executing this block.
    this.startRespawn(); // Call a function to perform this step.
  }

  // This function handles the stompBounce behavior in this file.
  stompBounce() { // Execute this step in the current flow.
    this.vy = -this.jumpForce * GAMEPLAY.stompBounceFactor; // Store data on the current object instance.
    this.onGround = false; // Store data on the current object instance.
  }

  // This function handles the consumeWorldResetRequest behavior in this file.
  consumeWorldResetRequest() { // Execute this step in the current flow.
    if (!this.worldResetRequested) return false; // Check a condition before executing this block.
    this.worldResetRequested = false; // Store data on the current object instance.
    return true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the readHorizontalInput behavior in this file.
  readHorizontalInput(input) { // Execute this step in the current flow.
    let direction = 0; // Create a local variable that may change.
    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) direction -= 1; // Check a condition before executing this block.
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) direction += 1; // Check a condition before executing this block.
    return direction; // Return control (and optionally a value) to the caller.
  }

  // This function handles the readJumpInput behavior in this file.
  readJumpInput(input) { // Execute this step in the current flow.
    return ( // Return control (and optionally a value) to the caller.
      input.wasPressed("Space") || // Execute this step in the current flow.
      input.wasPressed("ArrowUp") || // Execute this step in the current flow.
      input.wasPressed("KeyW") // Execute this step in the current flow.
    ); // Call a function to perform this step.
  }

  // This function handles the readDuckInput behavior in this file.
  readDuckInput(input) { // Execute this step in the current flow.
    return input.isDown("ArrowDown") || input.isDown("KeyS"); // Return control (and optionally a value) to the caller.
  }

  // This function handles the updateFacing behavior in this file.
  updateFacing(horizontalDirection) { // Execute this step in the current flow.
    if (horizontalDirection > 0) this.facing = 1; // Check a condition before executing this block.
    if (horizontalDirection < 0) this.facing = -1; // Check a condition before executing this block.
  }

  // This function handles the applyHorizontalMovement behavior in this file.
  applyHorizontalMovement(horizontalDirection, isDucking) { // Execute this step in the current flow.
    this.vx = isDucking ? 0 : horizontalDirection * this.moveSpeed; // Store data on the current object instance.
  }

  // This function handles the tryJump behavior in this file.
  tryJump(jumpPressed, isDucking) { // Execute this step in the current flow.
    if (!jumpPressed || !this.onGround || isDucking) return; // Check a condition before executing this block.
    this.vy = -this.jumpForce; // Store data on the current object instance.
    this.onGround = false; // Store data on the current object instance.
  }

  // This function handles the applyGravity behavior in this file.
  applyGravity(dt) { // Execute this step in the current flow.
    this.vy += this.gravity * dt; // Store data on the current object instance.
  }

  // This function handles the moveHorizontally behavior in this file.
  moveHorizontally(level, dt) { // Execute this step in the current flow.
    this.x += this.vx * dt; // Store data on the current object instance.
    this.resolveCollisionsX(level); // Call a function to perform this step.
  }

  // This function handles the moveVertically behavior in this file.
  moveVertically(level, dt) { // Execute this step in the current flow.
    const previousBottom = this.y + this.height; // Create a local constant for this scope.
    this.y += this.vy * dt; // Store data on the current object instance.
    this.onGround = false; // Store data on the current object instance.
    this.resolveCollisionsY(level, previousBottom); // Call a function to perform this step.
    this.probeGround(level); // Call a function to perform this step.
  }

  // This function handles the fellOutOfWorld behavior in this file.
  fellOutOfWorld(level) { // Execute this step in the current flow.
    const killY = level.pixelHeight + level.tileDisplaySize * 2; // Create a local constant for this scope.
    return this.y > killY; // Return control (and optionally a value) to the caller.
  }

  // This function handles the touchesHazard behavior in this file.
  touchesHazard(level) { // Execute this step in the current flow.
    return level.rectTouchesHazard(this.x, this.y, this.width, this.height); // Return control (and optionally a value) to the caller.
  }

  // This function handles the shouldRespawn behavior in this file.
  shouldRespawn(level) { // Execute this step in the current flow.
    return this.fellOutOfWorld(level); // Return control (and optionally a value) to the caller.
  }

  // This function handles the update behavior in this file.
  update(dt, input, level) { // Execute this step in the current flow.
    // This function handles the if behavior in this file.
    if (this.isRespawning) { // Check a condition before executing this block.
      this.updateRespawnTimer(dt); // Call a function to perform this step.
      return; // Return control (and optionally a value) to the caller.
    }

    this.updateInvulnerability(dt); // Call a function to perform this step.

    const horizontalDirection = this.readHorizontalInput(input); // Create a local constant for this scope.
    const jumpPressed = this.readJumpInput(input); // Create a local constant for this scope.
    const isDucking = this.onGround && this.readDuckInput(input); // Create a local constant for this scope.

    this.updateFacing(horizontalDirection); // Call a function to perform this step.
    this.applyHorizontalMovement(horizontalDirection, isDucking); // Call a function to perform this step.
    this.tryJump(jumpPressed, isDucking); // Call a function to perform this step.
    this.applyGravity(dt); // Call a function to perform this step.
    this.moveHorizontally(level, dt); // Call a function to perform this step.
    this.moveVertically(level, dt); // Call a function to perform this step.
    if (this.touchesHazard(level)) this.takeHit(this.x - this.facing * 20); // Check a condition before executing this block.

    // This function handles the if behavior in this file.
    if (this.shouldRespawn(level)) { // Check a condition before executing this block.
      this.startRespawn(); // Call a function to perform this step.
      return; // Return control (and optionally a value) to the caller.
    }

    this.updateAnimation(dt, horizontalDirection, isDucking); // Call a function to perform this step.
  }

  // This function handles the resolveCollisionsX behavior in this file.
  resolveCollisionsX(level) { // Execute this step in the current flow.
    const tileSize = level.tileDisplaySize; // Create a local constant for this scope.

    const top = Math.floor(this.y / tileSize); // Create a local constant for this scope.
    const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Create a local constant for this scope.

    // This function handles the if behavior in this file.
    if (this.vx > 0) { // Check a condition before executing this block.
      const right = Math.floor((this.x + this.width - 1) / tileSize); // Create a local constant for this scope.
      // This function handles the for behavior in this file.
      for (let row = top; row <= bottom; row++) { // Iterate through items or indices in a loop.
        if (!level.isSolidTile(right, row)) continue; // Check a condition before executing this block.
        this.x = right * tileSize - this.width; // Store data on the current object instance.
        this.vx = 0; // Store data on the current object instance.
        return; // Return control (and optionally a value) to the caller.
      }
    }

    // This function handles the if behavior in this file.
    if (this.vx < 0) { // Check a condition before executing this block.
      const left = Math.floor(this.x / tileSize); // Create a local constant for this scope.
      // This function handles the for behavior in this file.
      for (let row = top; row <= bottom; row++) { // Iterate through items or indices in a loop.
        if (!level.isSolidTile(left, row)) continue; // Check a condition before executing this block.
        this.x = (left + 1) * tileSize; // Store data on the current object instance.
        this.vx = 0; // Store data on the current object instance.
        return; // Return control (and optionally a value) to the caller.
      }
    }
  }

  // This function handles the resolveCollisionsY behavior in this file.
  resolveCollisionsY(level, previousBottom) { // Execute this step in the current flow.
    const tileSize = level.tileDisplaySize; // Create a local constant for this scope.

    const left = Math.floor(this.x / tileSize); // Create a local constant for this scope.
    const right = Math.floor((this.x + this.width - 1) / tileSize); // Create a local constant for this scope.

    // This function handles the if behavior in this file.
    if (this.vy > 0) { // Check a condition before executing this block.
      const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Create a local constant for this scope.
      // This function handles the for behavior in this file.
      for (let col = left; col <= right; col++) { // Iterate through items or indices in a loop.
        const tileTop = bottom * tileSize; // Create a local constant for this scope.
        const hitsSolid = level.isSolidTile(col, bottom); // Create a local constant for this scope.
        const hitsOneWay = level.isOneWayTile(col, bottom) && previousBottom <= tileTop + 2; // Create a local constant for this scope.
        if (!hitsSolid && !hitsOneWay) continue; // Check a condition before executing this block.
        this.y = bottom * tileSize - this.height; // Store data on the current object instance.
        this.vy = 0; // Store data on the current object instance.
        this.onGround = true; // Store data on the current object instance.
        return; // Return control (and optionally a value) to the caller.
      }
    }

    // This function handles the if behavior in this file.
    if (this.vy < 0) { // Check a condition before executing this block.
      const top = Math.floor(this.y / tileSize); // Create a local constant for this scope.
      // This function handles the for behavior in this file.
      for (let col = left; col <= right; col++) { // Iterate through items or indices in a loop.
        if (!level.isSolidTile(col, top)) continue; // Check a condition before executing this block.
        this.y = (top + 1) * tileSize; // Store data on the current object instance.
        this.vy = 0; // Store data on the current object instance.
        return; // Return control (and optionally a value) to the caller.
      }
    }
  }

  // This function handles the probeGround behavior in this file.
  probeGround(level) { // Execute this step in the current flow.
    if (this.onGround) return; // Check a condition before executing this block.
    if (this.vy < 0) return; // Check a condition before executing this block.

    const tileSize = level.tileDisplaySize; // Create a local constant for this scope.
    const feetY = this.y + this.height; // Create a local constant for this scope.
    const row = Math.floor(feetY / tileSize); // Create a local constant for this scope.

    const left = Math.floor(this.x / tileSize); // Create a local constant for this scope.
    const right = Math.floor((this.x + this.width - 1) / tileSize); // Create a local constant for this scope.

    // This function handles the for behavior in this file.
    for (let col = left; col <= right; col++) { // Iterate through items or indices in a loop.
      if (!level.isSolidTile(col, row)) continue; // Check a condition before executing this block.

      this.y = row * tileSize - this.height; // Store data on the current object instance.
      this.vy = 0; // Store data on the current object instance.
      this.onGround = true; // Store data on the current object instance.
      return; // Return control (and optionally a value) to the caller.
    }
  }

  // This function handles the touchesGoal behavior in this file.
  touchesGoal(goal) { // Execute this step in the current flow.
    return ( // Return control (and optionally a value) to the caller.
      this.x < goal.x + goal.width && // Execute this step in the current flow.
      this.x + this.width > goal.x && // Execute this step in the current flow.
      this.y < goal.y + goal.height && // Execute this step in the current flow.
      this.y + this.height > goal.y // Execute this step in the current flow.
    ); // Call a function to perform this step.
  }

  // This function handles the updateAnimation behavior in this file.
  updateAnimation(dt, horizontalDirection, isDucking) { // Execute this step in the current flow.
    if (this.playDuckAnimation(dt, isDucking)) return; // Check a condition before executing this block.
    this.exitDuckAnimation(); // Call a function to perform this step.

    const nextAnimation = this.selectMovementAnimation(horizontalDirection); // Create a local constant for this scope.
    this.changeAnimation(nextAnimation); // Call a function to perform this step.
    this.advanceAnimation(dt); // Call a function to perform this step.
  }

  // This function handles the playDuckAnimation behavior in this file.
  playDuckAnimation(dt, isDucking) { // Execute this step in the current flow.
    if (!isDucking || !this.onGround) return false; // Check a condition before executing this block.
    // This function handles the if behavior in this file.
    if (this.currentAnimationName !== "duck") { // Check a condition before executing this block.
      this.changeAnimation("duck"); // Call a function to perform this step.
      return true; // Return control (and optionally a value) to the caller.
    }

    this.animationTimer += dt; // Store data on the current object instance.
    if (this.animationTimer < this.animationFrameDuration) return true; // Check a condition before executing this block.
    this.animationTimer -= this.animationFrameDuration; // Store data on the current object instance.
    this.currentFramePointer = this.currentFramePointer === 1 ? 2 : 1; // Store data on the current object instance.
    if (this.currentFramePointer === 0) this.currentFramePointer = 1; // Check a condition before executing this block.
    return true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the exitDuckAnimation behavior in this file.
  exitDuckAnimation() { // Execute this step in the current flow.
    if (this.currentAnimationName !== "duck") return; // Check a condition before executing this block.
    this.currentFramePointer = 0; // Store data on the current object instance.
    this.animationTimer = 0; // Store data on the current object instance.
  }

  // This function handles the selectMovementAnimation behavior in this file.
  selectMovementAnimation(horizontalDirection) { // Execute this step in the current flow.
    if (!this.onGround) return this.vy < 0 ? "jump" : "fall"; // Check a condition before executing this block.
    if (horizontalDirection !== 0) return "walk"; // Check a condition before executing this block.
    return "idle"; // Return control (and optionally a value) to the caller.
  }

  // This function handles the changeAnimation behavior in this file.
  changeAnimation(name) { // Execute this step in the current flow.
    if (this.currentAnimationName === name) return; // Check a condition before executing this block.
    this.currentAnimationName = name; // Store data on the current object instance.
    this.currentFramePointer = 0; // Store data on the current object instance.
    this.animationTimer = 0; // Store data on the current object instance.
  }

  // This function handles the advanceAnimation behavior in this file.
  advanceAnimation(dt) { // Execute this step in the current flow.
    const frames = this.animations[this.currentAnimationName]; // Create a local constant for this scope.
    // This function handles the if behavior in this file.
    if (frames.length <= 1) { // Check a condition before executing this block.
      this.currentFramePointer = 0; // Store data on the current object instance.
      return; // Return control (and optionally a value) to the caller.
    }

    this.animationTimer += dt; // Store data on the current object instance.
    // This function handles the while behavior in this file.
    while (this.animationTimer >= this.animationFrameDuration) { // Repeat this block while the condition is true.
      this.animationTimer -= this.animationFrameDuration; // Store data on the current object instance.
      this.currentFramePointer = (this.currentFramePointer + 1) % frames.length; // Store data on the current object instance.
    }
  }

  // This function handles the draw behavior in this file.
  draw(ctx, camera) { // Execute this step in the current flow.
    // This function handles the if behavior in this file.
    if (this.hitInvulnerabilityTimer > 0) { // Check a condition before executing this block.
      const flashVisible = Math.floor(this.hitInvulnerabilityTimer * 12) % 2 === 0; // Create a local constant for this scope.
      if (!flashVisible) return; // Check a condition before executing this block.
    }

    const currentFrames = this.animations[this.currentAnimationName]; // Create a local constant for this scope.
    const framePos = currentFrames[this.currentFramePointer]; // Create a local constant for this scope.
    const frame = this.sprite.frameAt(framePos.col, framePos.row); // Create a local constant for this scope.

    const drawX = Math.round(this.x + this.drawOffsetX - camera.x); // Create a local constant for this scope.
    const drawY = Math.round(this.y + this.drawOffsetY - camera.y); // Create a local constant for this scope.

    const drawWidth = frame.sw * this.spriteScale; // Create a local constant for this scope.
    const drawHeight = frame.sh * this.spriteScale; // Create a local constant for this scope.

    ctx.save(); // Call a function to perform this step.
    // This function handles the if behavior in this file.
    if (this.facing < 0) { // Check a condition before executing this block.
      ctx.translate(drawX + drawWidth, drawY); // Call a function to perform this step.
      ctx.scale(-1, 1); // Call a function to perform this step.
      ctx.drawImage(this.sprite.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, drawWidth, drawHeight); // Render an image (or sprite region) on the canvas.
    } else { // Execute this step in the current flow.
      ctx.drawImage( // Render an image (or sprite region) on the canvas.
        this.sprite.image, // Execute this step in the current flow.
        frame.sx, // Execute this step in the current flow.
        frame.sy, // Execute this step in the current flow.
        frame.sw, // Execute this step in the current flow.
        frame.sh, // Execute this step in the current flow.
        drawX, // Execute this step in the current flow.
        drawY, // Execute this step in the current flow.
        drawWidth, // Execute this step in the current flow.
        drawHeight // Execute this step in the current flow.
      ); // Call a function to perform this step.
    }
    ctx.restore(); // Call a function to perform this step.
  }
}
