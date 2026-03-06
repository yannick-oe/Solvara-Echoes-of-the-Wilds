import { COLLECTIBLE_TYPE, ENEMY_TYPE, GAMEPLAY } from "./constants.js"; // Import a dependency used in this file.
import { ENEMY_RECT_FRAMES } from "./worldAtlasConfig.js"; // Import a dependency used in this file.

const PICKUP_FRAMES = { // Create a local constant for this scope.
    [COLLECTIBLE_TYPE.diamond]: [ // Execute this step in the current flow.
        { sx: 1, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 18, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 35, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 52, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 69, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
    [COLLECTIBLE_TYPE.cherry]: [ // Execute this step in the current flow.
        { sx: 87, sy: 3, sw: 15, sh: 15 }, // Execute this step in the current flow.
        { sx: 108, sy: 3, sw: 17, sh: 15 }, // Execute this step in the current flow.
        { sx: 132, sy: 3, sw: 17, sh: 15 }, // Execute this step in the current flow.
        { sx: 156, sy: 3, sw: 15, sh: 15 }, // Execute this step in the current flow.
        { sx: 182, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
        { sx: 204, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
        { sx: 227, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
    [COLLECTIBLE_TYPE.starCoin]: [ // Execute this step in the current flow.
        { sx: 249, sy: 3, sw: 26, sh: 26 }, // Execute this step in the current flow.
        { sx: 281, sy: 1, sw: 18, sh: 18 }, // Execute this step in the current flow.
        { sx: 316, sy: 2, sw: 28, sh: 29 }, // Execute this step in the current flow.
        { sx: 355, sy: 7, sw: 18, sh: 18 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
};

function rectsOverlap(a, b) { // Execute this step in the current flow.
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; // Return control (and optionally a value) to the caller.
}

export class Enemy { // Declare a class that can be used by other modules.
    // This function handles the constructor behavior in this file.
    constructor(config, spriteImage) { // Execute this step in the current flow.
        this.type = config.type; // Store data on the current object instance.
        this.spawnX = config.x; // Store data on the current object instance.
        this.spawnY = config.y; // Store data on the current object instance.
        this.width = config.width; // Store data on the current object instance.
        this.height = config.height; // Store data on the current object instance.
        this.patrolMin = config.patrolMin; // Store data on the current object instance.
        this.patrolMax = config.patrolMax; // Store data on the current object instance.
        this.speed = config.speed; // Store data on the current object instance.
        this.direction = 1; // Store data on the current object instance.
        this.x = this.spawnX; // Store data on the current object instance.
        this.y = this.spawnY; // Store data on the current object instance.
        this.vx = 0; // Store data on the current object instance.
        this.vy = 0; // Store data on the current object instance.
        this.gravity = 1700; // Store data on the current object instance.
        this.alive = true; // Store data on the current object instance.
        this.jumpCooldown = 0; // Store data on the current object instance.
        this.verticalMin = config.verticalMin ?? this.spawnY; // Store data on the current object instance.
        this.verticalMax = config.verticalMax ?? this.spawnY; // Store data on the current object instance.
        this.spriteImage = spriteImage; // Store data on the current object instance.
        this.animTimer = 0; // Store data on the current object instance.
        this.animDuration = 0.12; // Store data on the current object instance.
        this.animFrame = 0; // Store data on the current object instance.
    }

    // This function handles the reset behavior in this file.
    reset() { // Execute this step in the current flow.
        this.x = this.spawnX; // Store data on the current object instance.
        this.y = this.spawnY; // Store data on the current object instance.
        this.vx = 0; // Store data on the current object instance.
        this.vy = 0; // Store data on the current object instance.
        this.direction = 1; // Store data on the current object instance.
        this.alive = true; // Store data on the current object instance.
        this.jumpCooldown = 0; // Store data on the current object instance.
        this.animTimer = 0; // Store data on the current object instance.
        this.animFrame = 0; // Store data on the current object instance.
    }

    // This function handles the getRect behavior in this file.
    getRect() { // Execute this step in the current flow.
        return { x: this.x, y: this.y, width: this.width, height: this.height }; // Return control (and optionally a value) to the caller.
    }

    // This function handles the update behavior in this file.
    update(dt, level) { // Execute this step in the current flow.
        if (!this.alive) return; // Check a condition before executing this block.
        this.advanceAnimation(dt); // Call a function to perform this step.
        if (this.type === ENEMY_TYPE.possum) this.updatePossum(dt, level); // Check a condition before executing this block.
        if (this.type === ENEMY_TYPE.frog) this.updateFrog(dt, level); // Check a condition before executing this block.
        if (this.type === ENEMY_TYPE.eagle) this.updateEagle(dt); // Check a condition before executing this block.
    }

    // This function handles the advanceAnimation behavior in this file.
    advanceAnimation(dt) { // Execute this step in the current flow.
        this.animTimer += dt; // Store data on the current object instance.
        if (this.animTimer < this.animDuration) return; // Check a condition before executing this block.
        this.animTimer -= this.animDuration; // Store data on the current object instance.
        this.animFrame += 1; // Store data on the current object instance.
    }

    // This function handles the getActiveFrames behavior in this file.
    getActiveFrames() { // Execute this step in the current flow.
        const sets = ENEMY_RECT_FRAMES[this.type]; // Create a local constant for this scope.
        if (!sets) return []; // Check a condition before executing this block.
        if (this.type === ENEMY_TYPE.possum) return sets.walk; // Check a condition before executing this block.
        if (this.type === ENEMY_TYPE.eagle) return sets.fly; // Check a condition before executing this block.
        if (this.type === ENEMY_TYPE.frog) return Math.abs(this.vy) > 30 ? sets.jump : sets.idle; // Check a condition before executing this block.
        return []; // Return control (and optionally a value) to the caller.
    }

    // This function handles the updatePossum behavior in this file.
    updatePossum(dt, level) { // Execute this step in the current flow.
        this.vx = this.speed * this.direction; // Store data on the current object instance.
        this.x += this.vx * dt; // Store data on the current object instance.
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround(); // Check a condition before executing this block.
        if (!this.hasGroundAhead(level)) this.turnAround(); // Check a condition before executing this block.
    }

    // This function handles the updateFrog behavior in this file.
    updateFrog(dt, level) { // Execute this step in the current flow.
        this.jumpCooldown -= dt; // Store data on the current object instance.
        if (this.jumpCooldown <= 0) this.startHop(); // Check a condition before executing this block.
        this.vy += this.gravity * dt; // Store data on the current object instance.
        this.x += this.vx * dt; // Store data on the current object instance.
        this.y += this.vy * dt; // Store data on the current object instance.
        this.resolveGround(level); // Call a function to perform this step.
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround(); // Check a condition before executing this block.
    }

    // This function handles the startHop behavior in this file.
    startHop() { // Execute this step in the current flow.
        this.jumpCooldown = 1.05; // Store data on the current object instance.
        this.vx = this.speed * this.direction; // Store data on the current object instance.
        this.vy = -520; // Store data on the current object instance.
    }

    // This function handles the updateEagle behavior in this file.
    updateEagle(dt) { // Execute this step in the current flow.
        this.vx = 0; // Store data on the current object instance.
        this.y += this.speed * this.direction * dt; // Store data on the current object instance.
        if (this.y <= this.verticalMin) this.direction = 1; // Check a condition before executing this block.
        if (this.y + this.height >= this.verticalMax) this.direction = -1; // Check a condition before executing this block.
    }

    // This function handles the resolveGround behavior in this file.
    resolveGround(level) { // Execute this step in the current flow.
        const tileSize = level.tileDisplaySize; // Create a local constant for this scope.
        const left = Math.floor(this.x / tileSize); // Create a local constant for this scope.
        const right = Math.floor((this.x + this.width - 1) / tileSize); // Create a local constant for this scope.
        const bottom = Math.floor((this.y + this.height - 1) / tileSize); // Create a local constant for this scope.
        // This function handles the for behavior in this file.
        for (let col = left; col <= right; col++) { // Iterate through items or indices in a loop.
            if (!level.isSolidTile(col, bottom)) continue; // Check a condition before executing this block.
            this.y = bottom * tileSize - this.height; // Store data on the current object instance.
            this.vy = 0; // Store data on the current object instance.
            return; // Return control (and optionally a value) to the caller.
        }
    }

    // This function handles the hasGroundAhead behavior in this file.
    hasGroundAhead(level) { // Execute this step in the current flow.
        const probeX = this.direction > 0 ? this.x + this.width + 2 : this.x - 2; // Create a local constant for this scope.
        const probeY = this.y + this.height + 2; // Create a local constant for this scope.
        const col = Math.floor(probeX / level.tileDisplaySize); // Create a local constant for this scope.
        const row = Math.floor(probeY / level.tileDisplaySize); // Create a local constant for this scope.
        return level.isSolidTile(col, row); // Return control (and optionally a value) to the caller.
    }

    // This function handles the turnAround behavior in this file.
    turnAround() { // Execute this step in the current flow.
        this.direction *= -1; // Store data on the current object instance.
        if (this.type === ENEMY_TYPE.frog) this.vx = this.speed * this.direction; // Check a condition before executing this block.
    }

    // This function handles the draw behavior in this file.
    draw(ctx, camera) { // Execute this step in the current flow.
        if (!this.alive) return; // Check a condition before executing this block.
        const x = Math.round(this.x - camera.x); // Create a local constant for this scope.
        const y = Math.round(this.y - camera.y); // Create a local constant for this scope.
        const frames = this.getActiveFrames(); // Create a local constant for this scope.
        // This function handles the if behavior in this file.
        if (!this.spriteImage || !frames.length) { // Check a condition before executing this block.
            if (this.type === ENEMY_TYPE.possum) ctx.fillStyle = "#8d6e63"; // Check a condition before executing this block.
            if (this.type === ENEMY_TYPE.frog) ctx.fillStyle = "#43a047"; // Check a condition before executing this block.
            if (this.type === ENEMY_TYPE.eagle) ctx.fillStyle = "#5c6bc0"; // Check a condition before executing this block.
            ctx.fillRect(x, y, this.width, this.height); // Draw a filled rectangle on the canvas.
            return; // Return control (and optionally a value) to the caller.
        }

        const frame = frames[this.animFrame % frames.length]; // Create a local constant for this scope.
        ctx.save(); // Call a function to perform this step.
        // This function handles the if behavior in this file.
        if (this.direction < 0 && this.type !== ENEMY_TYPE.eagle) { // Check a condition before executing this block.
            ctx.translate(x + this.width, y); // Call a function to perform this step.
            ctx.scale(-1, 1); // Call a function to perform this step.
            ctx.drawImage( // Render an image (or sprite region) on the canvas.
                this.spriteImage, // Execute this step in the current flow.
                frame.sx, // Execute this step in the current flow.
                frame.sy, // Execute this step in the current flow.
                frame.sw, // Execute this step in the current flow.
                frame.sh, // Execute this step in the current flow.
                0, // Execute this step in the current flow.
                0, // Execute this step in the current flow.
                this.width, // Execute this step in the current flow.
                this.height // Execute this step in the current flow.
            ); // Call a function to perform this step.
        } else { // Execute this step in the current flow.
            ctx.drawImage( // Render an image (or sprite region) on the canvas.
                this.spriteImage, // Execute this step in the current flow.
                frame.sx, // Execute this step in the current flow.
                frame.sy, // Execute this step in the current flow.
                frame.sw, // Execute this step in the current flow.
                frame.sh, // Execute this step in the current flow.
                x, // Execute this step in the current flow.
                y, // Execute this step in the current flow.
                this.width, // Execute this step in the current flow.
                this.height // Execute this step in the current flow.
            ); // Call a function to perform this step.
        }
        ctx.restore(); // Call a function to perform this step.
    }
}

export class Collectible { // Declare a class that can be used by other modules.
    // This function handles the constructor behavior in this file.
    constructor(config, sprite) { // Execute this step in the current flow.
        this.type = config.type; // Store data on the current object instance.
        this.value = config.value; // Store data on the current object instance.
        this.x = config.x; // Store data on the current object instance.
        this.y = config.y; // Store data on the current object instance.
        this.width = config.width; // Store data on the current object instance.
        this.height = config.height; // Store data on the current object instance.
        this.collected = false; // Store data on the current object instance.

        this.sprite = sprite; // Store data on the current object instance.
        this.frames = PICKUP_FRAMES[this.type] || []; // Store data on the current object instance.
        this.frameTimer = Math.random() * 0.3; // Store data on the current object instance.
        this.frameDuration = 0.11; // Store data on the current object instance.
        this.frameIndex = 0; // Store data on the current object instance.
    }

    // This function handles the reset behavior in this file.
    reset() { // Execute this step in the current flow.
        this.collected = false; // Store data on the current object instance.
        this.frameTimer = 0; // Store data on the current object instance.
        this.frameIndex = 0; // Store data on the current object instance.
    }

    // This function handles the update behavior in this file.
    update(dt) { // Execute this step in the current flow.
        if (this.collected) return; // Check a condition before executing this block.
        if (!this.frames.length) return; // Check a condition before executing this block.
        this.frameTimer += dt; // Store data on the current object instance.
        if (this.frameTimer < this.frameDuration) return; // Check a condition before executing this block.
        this.frameTimer -= this.frameDuration; // Store data on the current object instance.
        this.frameIndex = (this.frameIndex + 1) % this.frames.length; // Store data on the current object instance.
    }

    // This function handles the getRect behavior in this file.
    getRect() { // Execute this step in the current flow.
        return { x: this.x, y: this.y, width: this.width, height: this.height }; // Return control (and optionally a value) to the caller.
    }

    // This function handles the tryCollect behavior in this file.
    tryCollect(playerRect, onCollect) { // Execute this step in the current flow.
        if (this.collected) return; // Check a condition before executing this block.
        if (!rectsOverlap(this.getRect(), playerRect)) return; // Check a condition before executing this block.
        this.collected = true; // Store data on the current object instance.
        onCollect(this); // Call a function to perform this step.
    }

    // This function handles the draw behavior in this file.
    draw(ctx, camera) { // Execute this step in the current flow.
        if (this.collected) return; // Check a condition before executing this block.
        const x = Math.round(this.x - camera.x); // Create a local constant for this scope.
        const y = Math.round(this.y - camera.y); // Create a local constant for this scope.
        // This function handles the if behavior in this file.
        if (!this.sprite || !this.frames.length) { // Check a condition before executing this block.
            if (this.type === COLLECTIBLE_TYPE.diamond) ctx.fillStyle = "#4dd0e1"; // Check a condition before executing this block.
            if (this.type === COLLECTIBLE_TYPE.starCoin) ctx.fillStyle = "#ffca28"; // Check a condition before executing this block.
            if (this.type === COLLECTIBLE_TYPE.cherry) ctx.fillStyle = "#e53935"; // Check a condition before executing this block.
            ctx.fillRect(x, y, this.width, this.height); // Draw a filled rectangle on the canvas.
            return; // Return control (and optionally a value) to the caller.
        }

        const frame = this.frames[this.frameIndex]; // Create a local constant for this scope.
        const source = frame.sx !== undefined // Create a local constant for this scope.
            ? frame // Execute this step in the current flow.
            : this.sprite.frameAt(frame.col, frame.row); // Call a function to perform this step.
        ctx.drawImage( // Render an image (or sprite region) on the canvas.
            this.sprite.image, // Execute this step in the current flow.
            source.sx, // Execute this step in the current flow.
            source.sy, // Execute this step in the current flow.
            source.sw, // Execute this step in the current flow.
            source.sh, // Execute this step in the current flow.
            x, // Execute this step in the current flow.
            y, // Execute this step in the current flow.
            this.width, // Execute this step in the current flow.
            this.height // Execute this step in the current flow.
        ); // Call a function to perform this step.
    }
}

export function isStompHit(player, enemy) { // Execute this step in the current flow.
    if (!enemy.alive) return false; // Check a condition before executing this block.
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height }; // Create a local constant for this scope.
    const enemyRect = enemy.getRect(); // Create a local constant for this scope.
    if (!rectsOverlap(playerRect, enemyRect)) return false; // Check a condition before executing this block.
    const playerBottom = player.y + player.height; // Create a local constant for this scope.
    const enemyHeadLimit = enemy.y + enemy.height * 0.35; // Create a local constant for this scope.
    return player.vy > 0 && playerBottom <= enemyHeadLimit; // Return control (and optionally a value) to the caller.
}

export function isBodyHit(player, enemy) { // Execute this step in the current flow.
    if (!enemy.alive) return false; // Check a condition before executing this block.
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height }; // Create a local constant for this scope.
    return rectsOverlap(playerRect, enemy.getRect()); // Return control (and optionally a value) to the caller.
}

export function getDefaultEnemyLayout(tileSize) { // Execute this step in the current flow.
    return [ // Return control (and optionally a value) to the caller.
        {
            type: ENEMY_TYPE.possum, // Execute this step in the current flow.
            x: tileSize * 10, // Execute this step in the current flow.
            y: tileSize * 7.6, // Execute this step in the current flow.
            width: 30, // Execute this step in the current flow.
            height: 20, // Execute this step in the current flow.
            patrolMin: tileSize * 8, // Execute this step in the current flow.
            patrolMax: tileSize * 14, // Execute this step in the current flow.
            speed: 80, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
        {
            type: ENEMY_TYPE.frog, // Execute this step in the current flow.
            x: tileSize * 39, // Execute this step in the current flow.
            y: tileSize * 5.2, // Execute this step in the current flow.
            width: 30, // Execute this step in the current flow.
            height: 24, // Execute this step in the current flow.
            patrolMin: tileSize * 36, // Execute this step in the current flow.
            patrolMax: tileSize * 43, // Execute this step in the current flow.
            speed: 110, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
        {
            type: ENEMY_TYPE.eagle, // Execute this step in the current flow.
            x: tileSize * 103, // Execute this step in the current flow.
            y: tileSize * 2.2, // Execute this step in the current flow.
            width: 30, // Execute this step in the current flow.
            height: 20, // Execute this step in the current flow.
            speed: 90, // Execute this step in the current flow.
            verticalMin: tileSize * 1.2, // Execute this step in the current flow.
            verticalMax: tileSize * 5.5, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
    ]; // Execute this step in the current flow.
}

export function getDefaultCollectiblesLayout(tileSize) { // Execute this step in the current flow.
    const size = 18; // Create a local constant for this scope.
    return [ // Return control (and optionally a value) to the caller.
        ...buildDiamondLine(tileSize * 4, tileSize * 6, 7, tileSize * 1.2, size), // Execute this step in the current flow.
        ...buildDiamondArc(tileSize * 17, tileSize * 5.8, 6, tileSize * 0.8, size), // Execute this step in the current flow.
        ...buildDiamondLine(tileSize * 32, tileSize * 4.3, 5, tileSize * 1.1, size), // Execute this step in the current flow.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Execute this step in the current flow.
            value: GAMEPLAY.starCoinScore, // Execute this step in the current flow.
            x: tileSize * 44, // Execute this step in the current flow.
            y: tileSize * 2.7, // Execute this step in the current flow.
            width: 24, // Execute this step in the current flow.
            height: 24, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Execute this step in the current flow.
            value: GAMEPLAY.starCoinScore, // Execute this step in the current flow.
            x: tileSize * 81, // Execute this step in the current flow.
            y: tileSize * 6.2, // Execute this step in the current flow.
            width: 24, // Execute this step in the current flow.
            height: 24, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
        {
            type: COLLECTIBLE_TYPE.starCoin, // Execute this step in the current flow.
            value: GAMEPLAY.starCoinScore, // Execute this step in the current flow.
            x: tileSize * 111, // Execute this step in the current flow.
            y: tileSize * 1.2, // Execute this step in the current flow.
            width: 24, // Execute this step in the current flow.
            height: 24, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
        {
            type: COLLECTIBLE_TYPE.cherry, // Execute this step in the current flow.
            value: 1, // Execute this step in the current flow.
            x: tileSize * 85, // Execute this step in the current flow.
            y: tileSize * 8.2, // Execute this step in the current flow.
            width: 20, // Execute this step in the current flow.
            height: 20, // Execute this step in the current flow.
        }, // Execute this step in the current flow.
    ]; // Execute this step in the current flow.
}

function buildDiamondLine(startX, y, count, gap, size) { // Execute this step in the current flow.
    const items = []; // Create a local constant for this scope.
    // This function handles the for behavior in this file.
    for (let i = 0; i < count; i++) { // Iterate through items or indices in a loop.
        items.push({ // Execute this step in the current flow.
            type: COLLECTIBLE_TYPE.diamond, // Execute this step in the current flow.
            value: GAMEPLAY.diamondScore, // Execute this step in the current flow.
            x: startX + i * gap, // Execute this step in the current flow.
            y, // Execute this step in the current flow.
            width: size, // Execute this step in the current flow.
            height: size, // Execute this step in the current flow.
        }); // Call a function to perform this step.
    }
    return items; // Return control (and optionally a value) to the caller.
}

function buildDiamondArc(startX, startY, count, gap, size) { // Execute this step in the current flow.
    const items = []; // Create a local constant for this scope.
    // This function handles the for behavior in this file.
    for (let i = 0; i < count; i++) { // Iterate through items or indices in a loop.
        const wave = Math.sin((i / (count - 1)) * Math.PI) * 26; // Create a local constant for this scope.
        items.push({ // Execute this step in the current flow.
            type: COLLECTIBLE_TYPE.diamond, // Execute this step in the current flow.
            value: GAMEPLAY.diamondScore, // Execute this step in the current flow.
            x: startX + i * gap, // Execute this step in the current flow.
            y: startY - wave, // Execute this step in the current flow.
            width: size, // Execute this step in the current flow.
            height: size, // Execute this step in the current flow.
        }); // Call a function to perform this step.
    }
    return items; // Return control (and optionally a value) to the caller.
}
