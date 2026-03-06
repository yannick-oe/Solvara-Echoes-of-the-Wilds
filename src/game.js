import { Input } from "./input.js"; // Import a dependency used in this file.
import { ImageCache } from "./imageCache.js"; // Import a dependency used in this file.
import { Camera } from "./camera.js"; // Import a dependency used in this file.
import { ParallaxLayer } from "./parallax.js"; // Import a dependency used in this file.
import { Level } from "./level.js"; // Import a dependency used in this file.
import { Player } from "./player.js"; // Import a dependency used in this file.
import { CANVAS_HEIGHT, CANVAS_WIDTH, ASSET_PATHS, COLLECTIBLE_TYPE } from "./constants.js"; // Import a dependency used in this file.
import { SpriteSheet } from "./spriteSheet.js"; // Import a dependency used in this file.
import { HUD_FALLBACK_FRAMES, HUD_FRAMES, HUD_LAYOUT, HUD_SPRITE } from "./hudConfig.js"; // Import a dependency used in this file.
import { // Import a dependency used in this file.
    Collectible, // Execute this step in the current flow.
    Enemy, // Execute this step in the current flow.
    getDefaultCollectiblesLayout, // Execute this step in the current flow.
    getDefaultEnemyLayout, // Execute this step in the current flow.
    isBodyHit, // Execute this step in the current flow.
    isStompHit, // Execute this step in the current flow.
} from "./worldEntities.js"; // Execute this step in the current flow.

export class Game { // Declare a class that can be used by other modules.
    // This function handles the constructor behavior in this file.
    constructor(canvas) { // Execute this step in the current flow.
        this.canvas = canvas; // Store data on the current object instance.
        this.ctx = canvas.getContext("2d"); // Store data on the current object instance.
        this.ctx.imageSmoothingEnabled = false; // Store data on the current object instance.

        this.input = new Input(); // Store data on the current object instance.
        this.imageCache = new ImageCache(); // Store data on the current object instance.
        this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT); // Store data on the current object instance.

        this.level = null; // Store data on the current object instance.
        this.player = null; // Store data on the current object instance.
        this.parallaxLayers = []; // Store data on the current object instance.
        this.enemies = []; // Store data on the current object instance.
        this.collectibles = []; // Store data on the current object instance.
        this.score = 0; // Store data on the current object instance.
        this.stars = 0; // Store data on the current object instance.
        this.enemyAtlasImage = null; // Store data on the current object instance.
        this.pickupSprite = null; // Store data on the current object instance.
        this.hudSprite = null; // Store data on the current object instance.
        this.hudAnimTime = 0; // Store data on the current object instance.

        this.lastTime = 0; // Store data on the current object instance.
        this.levelCompleted = false; // Store data on the current object instance.

        this._rafId = null; // Store data on the current object instance.
        this._running = false; // Store data on the current object instance.
    }

    // This function handles the start behavior in this file.
    async start() { // Execute this step in the current flow.
        if (this._running) return; // Check a condition before executing this block.
        this._running = true; // Store data on the current object instance.

        await this.loadAssets(); // Wait for the async operation to finish.

        const tileset = this.imageCache.get(ASSET_PATHS.tileSet); // Create a local constant for this scope.
        const propsAtlas = this.imageCache.get(ASSET_PATHS.propsAtlas); // Create a local constant for this scope.
        const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite); // Create a local constant for this scope.
        const enemyAtlas = this.imageCache.get(ASSET_PATHS.enemyAtlas); // Create a local constant for this scope.
        const pickupAtlas = this.imageCache.get(ASSET_PATHS.pickupAtlas); // Create a local constant for this scope.
        const uiDoorClosed = this.imageCache.get(ASSET_PATHS.uiDoorClosed); // Create a local constant for this scope.
        const uiDoorOpen = this.imageCache.get(ASSET_PATHS.uiDoorOpen); // Create a local constant for this scope.
        const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack); // Create a local constant for this scope.
        const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle); // Create a local constant for this scope.

        this.level = new Level(tileset, propsAtlas, uiDoorClosed, uiDoorOpen); // Store data on the current object instance.
        this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY); // Store data on the current object instance.
        this.enemyAtlasImage = enemyAtlas; // Store data on the current object instance.
        this.pickupSprite = new SpriteSheet( // Store data on the current object instance.
            pickupAtlas, // Execute this step in the current flow.
            HUD_SPRITE.frameWidth, // Execute this step in the current flow.
            HUD_SPRITE.frameHeight // Execute this step in the current flow.
        ); // Call a function to perform this step.
        this.hudSprite = this.pickupSprite; // Store data on the current object instance.
        this.enemies = this.createEnemies(); // Store data on the current object instance.
        this.collectibles = this.createCollectibles(); // Store data on the current object instance.

        const backScale = CANVAS_HEIGHT / bgBack.height; // Create a local constant for this scope.
        const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height; // Create a local constant for this scope.
        this.parallaxLayers = [ // Store data on the current object instance.
            new ParallaxLayer(bgBack, 0.1, backScale, 0), // Execute this step in the current flow.
            new ParallaxLayer(bgMiddle, 0.3, middleScale, 0), // Execute this step in the current flow.
        ]; // Execute this step in the current flow.

        this.lastTime = performance.now(); // Store data on the current object instance.
        this._rafId = requestAnimationFrame(this.loop.bind(this)); // Store data on the current object instance.
    }

    // This function handles the createEnemies behavior in this file.
    createEnemies() { // Execute this step in the current flow.
        const layout = getDefaultEnemyLayout(this.level.tileDisplaySize); // Create a local constant for this scope.
        return layout.map((config) => new Enemy(config, this.enemyAtlasImage)); // Return control (and optionally a value) to the caller.
    }

    // This function handles the createCollectibles behavior in this file.
    createCollectibles() { // Execute this step in the current flow.
        const layout = getDefaultCollectiblesLayout(this.level.tileDisplaySize); // Create a local constant for this scope.
        return layout.map((config) => new Collectible(config, this.pickupSprite)); // Return control (and optionally a value) to the caller.
    }

    // This function handles the resetWorldState behavior in this file.
    resetWorldState() { // Execute this step in the current flow.
        this.level.resetRuntimeState(); // Call a function to perform this step.
        for (const enemy of this.enemies) enemy.reset(); // Iterate through items or indices in a loop.
        for (const item of this.collectibles) item.reset(); // Iterate through items or indices in a loop.
        this.score = 0; // Store data on the current object instance.
        this.stars = 0; // Store data on the current object instance.
    }

    // This function handles the loadAssets behavior in this file.
    async loadAssets() { // Execute this step in the current flow.
        await this.imageCache.loadAll([ // Wait for the async operation to finish.
            ASSET_PATHS.backgroundBack, // Execute this step in the current flow.
            ASSET_PATHS.backgroundMiddle, // Execute this step in the current flow.
            ASSET_PATHS.tileSet, // Execute this step in the current flow.
            ASSET_PATHS.propsAtlas, // Execute this step in the current flow.
            ASSET_PATHS.playerSprite, // Execute this step in the current flow.
            ASSET_PATHS.enemyAtlas, // Execute this step in the current flow.
            ASSET_PATHS.pickupAtlas, // Execute this step in the current flow.
            ASSET_PATHS.uiDoorClosed, // Execute this step in the current flow.
            ASSET_PATHS.uiDoorOpen, // Execute this step in the current flow.
        ]); // Call a function to perform this step.
    }

    // This function handles the loop behavior in this file.
    loop(timestamp) { // Execute this step in the current flow.
        const rawDt = (timestamp - this.lastTime) / 1000; // Create a local constant for this scope.
        const dt = Math.min(0.05, rawDt); // Create a local constant for this scope.
        this.lastTime = timestamp; // Store data on the current object instance.

        this.update(dt); // Call a function to perform this step.
        this.draw(); // Call a function to perform this step.

        this._rafId = requestAnimationFrame(this.loop.bind(this)); // Store data on the current object instance.
    }

    // This function handles the update behavior in this file.
    update(dt) { // Execute this step in the current flow.
        // This function handles the if behavior in this file.
        if (!this.level || !this.player) { // Check a condition before executing this block.
            return; // Return control (and optionally a value) to the caller.
        }

        // This function handles the if behavior in this file.
        if (!this.levelCompleted) { // Check a condition before executing this block.
            this.player.update(dt, this.input, this.level); // Call a function to perform this step.
            this.updateHudAnimation(dt); // Call a function to perform this step.
            this.updateSwitch(); // Call a function to perform this step.
            this.updateEnemies(dt); // Call a function to perform this step.
            this.updateCollectibles(dt); // Call a function to perform this step.
            this.tryApplyWorldReset(); // Call a function to perform this step.
            this.camera.follow(this.player, this.level.pixelWidth); // Call a function to perform this step.

            // This function handles the if behavior in this file.
            if (this.level.touchesGoalHouse(this.player.getRect())) { // Check a condition before executing this block.
                this.levelCompleted = true; // Store data on the current object instance.
            }
        }

        this.input.endFrame(); // Call a function to perform this step.
    }

    // This function handles the draw behavior in this file.
    draw() { // Execute this step in the current flow.
        this.ctx.fillStyle = "#5DC8E8"; // Store data on the current object instance.
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw a filled rectangle on the canvas.

        // This function handles the if behavior in this file.
        if (!this.level || !this.player) { // Check a condition before executing this block.
            return; // Return control (and optionally a value) to the caller.
        }

        // This function handles the for behavior in this file.
        for (let i = 0; i < this.parallaxLayers.length; i++) { // Iterate through items or indices in a loop.
            this.parallaxLayers[i].draw(this.ctx, this.canvas.width, this.canvas.height, this.camera.x); // Call a function to perform this step.
        }

        this.level.draw(this.ctx, this.camera); // Call a function to perform this step.
        this.drawCollectibles(); // Call a function to perform this step.
        this.drawEnemies(); // Call a function to perform this step.
        this.player.draw(this.ctx, this.camera); // Call a function to perform this step.

        this.drawHud(); // Call a function to perform this step.
    }

    // This function handles the updateHudAnimation behavior in this file.
    updateHudAnimation(dt) { // Execute this step in the current flow.
        this.hudAnimTime += dt; // Store data on the current object instance.
    }

    // This function handles the getAnimatedHudFrame behavior in this file.
    getAnimatedHudFrame(frames, fallback) { // Execute this step in the current flow.
        if (!frames || frames.length === 0) return fallback; // Check a condition before executing this block.
        const index = Math.floor(this.hudAnimTime * 10) % frames.length; // Create a local constant for this scope.
        return frames[index]; // Return control (and optionally a value) to the caller.
    }

    // This function handles the getPulseHudFrame behavior in this file.
    getPulseHudFrame(frames, fallback) { // Execute this step in the current flow.
        if (!frames || frames.length === 0) return fallback; // Check a condition before executing this block.
        const loopLength = frames.length * 2 - 2; // Create a local constant for this scope.
        if (loopLength <= 0) return frames[0]; // Check a condition before executing this block.
        const index = Math.floor(this.hudAnimTime * 6) % loopLength; // Create a local constant for this scope.
        const pingPongIndex = index < frames.length ? index : loopLength - index; // Create a local constant for this scope.
        return frames[pingPongIndex]; // Return control (and optionally a value) to the caller.
    }

    // This function handles the drawHudIcon behavior in this file.
    drawHudIcon(frame, x, y, alpha = 1) { // Compute and store a value for later use.
        if (!this.hudSprite) return; // Check a condition before executing this block.
        const source = frame.sx !== undefined // Create a local constant for this scope.
            ? frame // Execute this step in the current flow.
            : this.hudSprite.frameAt(frame.col, frame.row); // Call a function to perform this step.
        const size = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Create a local constant for this scope.
        this.ctx.save(); // Call a function to perform this step.
        this.ctx.globalAlpha = alpha; // Store data on the current object instance.
        this.ctx.drawImage( // Render an image (or sprite region) on the canvas.
            this.hudSprite.image, // Execute this step in the current flow.
            source.sx, // Execute this step in the current flow.
            source.sy, // Execute this step in the current flow.
            source.sw, // Execute this step in the current flow.
            source.sh, // Execute this step in the current flow.
            Math.round(x), // Execute this step in the current flow.
            Math.round(y), // Execute this step in the current flow.
            size, // Execute this step in the current flow.
            size // Execute this step in the current flow.
        ); // Call a function to perform this step.
        this.ctx.restore(); // Call a function to perform this step.
    }

    // This function handles the drawHeartsHud behavior in this file.
    drawHeartsHud(startX, startY) { // Execute this step in the current flow.
        const frame = this.getPulseHudFrame(HUD_FRAMES.hearts, HUD_FALLBACK_FRAMES.heart); // Create a local constant for this scope.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Create a local constant for this scope.
        const iconStep = iconSize + HUD_LAYOUT.iconGap; // Create a local constant for this scope.
        // This function handles the for behavior in this file.
        for (let i = 0; i < this.player.maxHearts; i++) { // Iterate through items or indices in a loop.
            const alpha = i < this.player.hearts ? 1 : 0.25; // Create a local constant for this scope.
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha); // Call a function to perform this step.
        }
    }

    // This function handles the drawDiamondHud behavior in this file.
    drawDiamondHud(startX, startY) { // Execute this step in the current flow.
        const frame = this.getAnimatedHudFrame(HUD_FRAMES.diamondSpin, HUD_FALLBACK_FRAMES.diamond); // Create a local constant for this scope.
        this.drawHudIcon(frame, startX, startY); // Call a function to perform this step.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Create a local constant for this scope.
        this.ctx.fillStyle = "#ffffff"; // Store data on the current object instance.
        this.ctx.font = "24px monospace"; // Store data on the current object instance.
        this.ctx.fillText(String(this.score), startX + iconSize + HUD_LAYOUT.scoreGap, startY + iconSize - 7); // Draw text on the canvas.
    }

    // This function handles the drawStarsHud behavior in this file.
    drawStarsHud(startX, startY) { // Execute this step in the current flow.
        const idleFrame = HUD_FRAMES.starCoinSpin[0] || HUD_FALLBACK_FRAMES.starCoin; // Create a local constant for this scope.
        const spinFrame = this.getAnimatedHudFrame(HUD_FRAMES.starCoinSpin, HUD_FALLBACK_FRAMES.starCoin); // Create a local constant for this scope.
        const iconSize = HUD_SPRITE.frameWidth * HUD_SPRITE.scale; // Create a local constant for this scope.
        const iconStep = iconSize + HUD_LAYOUT.iconGap; // Create a local constant for this scope.
        // This function handles the for behavior in this file.
        for (let i = 0; i < HUD_LAYOUT.maxStars; i++) { // Iterate through items or indices in a loop.
            const collected = i < this.stars; // Create a local constant for this scope.
            const frame = collected ? spinFrame : idleFrame; // Create a local constant for this scope.
            const alpha = collected ? 1 : 0.25; // Create a local constant for this scope.
            this.drawHudIcon(frame, startX + i * iconStep, startY, alpha); // Call a function to perform this step.
        }
    }

    // This function handles the drawHud behavior in this file.
    drawHud() { // Execute this step in the current flow.
        this.drawHeartsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.heartsY); // Call a function to perform this step.
        this.drawStarsHud(HUD_LAYOUT.leftX, HUD_LAYOUT.starsY); // Call a function to perform this step.
        this.drawDiamondHud(HUD_LAYOUT.leftX, HUD_LAYOUT.diamondsY); // Call a function to perform this step.
    }

    // This function handles the updateSwitch behavior in this file.
    updateSwitch() { // Execute this step in the current flow.
        const wantsInteract = this.input.wasPressed("KeyE") || this.input.wasPressed("ArrowUp"); // Create a local constant for this scope.
        this.level.tryActivateSwitch(this.player.getRect(), wantsInteract); // Call a function to perform this step.
    }

    // This function handles the updateEnemies behavior in this file.
    updateEnemies(dt) { // Execute this step in the current flow.
        // This function handles the for behavior in this file.
        for (const enemy of this.enemies) { // Iterate through items or indices in a loop.
            enemy.update(dt, this.level); // Call a function to perform this step.
            this.resolveEnemyContact(enemy); // Call a function to perform this step.
        }
    }

    // This function handles the resolveEnemyContact behavior in this file.
    resolveEnemyContact(enemy) { // Execute this step in the current flow.
        if (!enemy.alive) return; // Check a condition before executing this block.
        // This function handles the if behavior in this file.
        if (isStompHit(this.player, enemy)) { // Check a condition before executing this block.
            enemy.alive = false; // Compute and store a value for later use.
            this.player.stompBounce(); // Call a function to perform this step.
            this.score += 25; // Store data on the current object instance.
            return; // Return control (and optionally a value) to the caller.
        }

        // This function handles the if behavior in this file.
        if (isBodyHit(this.player, enemy)) { // Check a condition before executing this block.
            this.player.takeHit(enemy.x); // Call a function to perform this step.
        }
    }

    // This function handles the updateCollectibles behavior in this file.
    updateCollectibles(dt) { // Execute this step in the current flow.
        const playerRect = this.player.getRect(); // Create a local constant for this scope.
        // This function handles the for behavior in this file.
        for (const item of this.collectibles) { // Iterate through items or indices in a loop.
            item.update(dt); // Call a function to perform this step.
            item.tryCollect(playerRect, (collected) => this.onCollect(collected)); // Call a function to perform this step.
        }
    }

    // This function handles the onCollect behavior in this file.
    onCollect(collected) { // Execute this step in the current flow.
        if (collected.type === COLLECTIBLE_TYPE.diamond) this.score += collected.value; // Check a condition before executing this block.
        // This function handles the if behavior in this file.
        if (collected.type === COLLECTIBLE_TYPE.starCoin) { // Check a condition before executing this block.
            this.score += collected.value; // Store data on the current object instance.
            this.stars += 1; // Store data on the current object instance.
        }
        // This function handles the if behavior in this file.
        if (collected.type === COLLECTIBLE_TYPE.cherry) { // Check a condition before executing this block.
            // This function handles the if behavior in this file.
            if (this.player.maxHearts < this.player.hardMaxHearts) { // Check a condition before executing this block.
                this.player.maxHearts += 1; // Store data on the current object instance.
                this.player.hearts = this.player.maxHearts; // Store data on the current object instance.
                return; // Return control (and optionally a value) to the caller.
            }
            this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + 1); // Store data on the current object instance.
        }
    }

    // This function handles the tryApplyWorldReset behavior in this file.
    tryApplyWorldReset() { // Execute this step in the current flow.
        if (!this.player.consumeWorldResetRequest()) return; // Check a condition before executing this block.
        this.resetWorldState(); // Call a function to perform this step.
    }

    // This function handles the drawEnemies behavior in this file.
    drawEnemies() { // Execute this step in the current flow.
        // This function handles the for behavior in this file.
        for (const enemy of this.enemies) { // Iterate through items or indices in a loop.
            enemy.draw(this.ctx, this.camera); // Call a function to perform this step.
        }
    }

    // This function handles the drawCollectibles behavior in this file.
    drawCollectibles() { // Execute this step in the current flow.
        // This function handles the for behavior in this file.
        for (const item of this.collectibles) { // Iterate through items or indices in a loop.
            item.draw(this.ctx, this.camera); // Call a function to perform this step.
        }
    }
}
