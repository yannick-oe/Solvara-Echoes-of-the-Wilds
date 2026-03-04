import { Input } from "./input.js";
import { ImageCache } from "./imageCache.js";
import { Camera } from "./camera.js";
import { ParallaxLayer } from "./parallax.js";
import { Level } from "./level.js";
import { Player } from "./player.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ASSET_PATHS } from "./constants.js";

/*
  game.js
  -------
  This is the "orchestrator" of the game.
  It owns the main loop and tells all systems when to update and draw.
*/

export class Game {
  /**
   * Creates the game object and all core helper systems.
   * @param {HTMLCanvasElement} canvas Canvas where everything is rendered.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.input = new Input();
    this.imageCache = new ImageCache();
    this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

    this.level = null;
    this.player = null;
    this.parallaxLayers = [];

    this.lastTime = 0;
    this.levelCompleted = false;
  }

  /**
   * Loads assets, creates world objects, then starts requestAnimationFrame loop.
   */
  async start() {
    await this.loadAssets();

    const tileset = this.imageCache.get(ASSET_PATHS.tileSet);
    const playerSprite = this.imageCache.get(ASSET_PATHS.playerSprite);
    const bgBack = this.imageCache.get(ASSET_PATHS.backgroundBack);
    const bgMiddle = this.imageCache.get(ASSET_PATHS.backgroundMiddle);

    this.level = new Level(tileset);
    this.player = new Player(playerSprite, this.level.spawnX, this.level.spawnY);

    const backScale = CANVAS_HEIGHT / bgBack.height;
    const middleScale = (CANVAS_HEIGHT * 0.55) / bgMiddle.height;
    this.parallaxLayers = [
      new ParallaxLayer(bgBack, 0.1, backScale, 0),
      new ParallaxLayer(bgMiddle, 0.3, middleScale, 0),
    ];

    let self = this;
    requestAnimationFrame(function (timestamp) {
      self.lastTime = timestamp;
      self.loop(timestamp);
    });
  }

  /**
   * Loads all required image files before gameplay starts.
   */
  async loadAssets() {
    await this.imageCache.loadAll([
      ASSET_PATHS.backgroundBack,
      ASSET_PATHS.backgroundMiddle,
      ASSET_PATHS.tileSet,
      ASSET_PATHS.playerSprite,
    ]);
  }

  /**
   * Main frame function called by requestAnimationFrame.
   * @param {number} timestamp Browser timestamp in milliseconds.
   */
  loop(timestamp) {
    // Delta time makes movement frame-rate independent.
    const rawDt = (timestamp - this.lastTime) / 1000;
    // Clamp prevents huge physics jumps when a frame stalls.
    const dt = Math.min(0.05, rawDt);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    let self = this;
    requestAnimationFrame(function (nextTimestamp) {
      self.loop(nextTimestamp);
    });
  }

  /**
   * Updates game logic (player, camera, win check).
   * @param {number} dt Delta time in seconds.
   */
  update(dt) {
    if (!this.level || !this.player) {
      return;
    }

    if (!this.levelCompleted) {
      this.player.update(dt, this.input, this.level);
      this.camera.follow(this.player, this.level.pixelWidth);

      if (this.player.touchesGoal(this.level.goal)) {
        this.levelCompleted = true;
      }
    }

    this.input.endFrame();
  }

  /**
   * Renders one full frame in draw order.
   */
  draw() {
    this.ctx.fillStyle = "#5DC8E8";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.level || !this.player) {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "18px monospace";
      this.ctx.fillText("Loading assets...", 230, 240);
      return;
    }

    for (let i = 0; i < this.parallaxLayers.length; i++) {
      this.parallaxLayers[i].draw(this.ctx, this.canvas.width, this.canvas.height, this.camera.x);
    }

    this.level.draw(this.ctx, this.camera);
    this.player.draw(this.ctx, this.camera);

    this.drawText();
  }

  /**
   * Draws simple UI helper text and win message.
   */
  drawText() {
    this.ctx.fillStyle = "#0d1b2a";
    this.ctx.font = "16px monospace";
    this.ctx.fillText("Move: A/D or Arrow Keys | Jump: Space | Duck: S/ArrowDown", 12, 24);
    this.ctx.fillText("Fullscreen: F", 12, 46);

    if (this.levelCompleted) {
      this.ctx.fillStyle = "#1b5e20";
      this.ctx.font = "24px monospace";
      this.ctx.fillText("Level complete!", 250, 120);
    }
  }
}
