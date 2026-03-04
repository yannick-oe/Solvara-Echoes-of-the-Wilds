import { Assets } from "./Assets.js";
import { ImageCache } from "./ImageCache.js";
import { Input } from "./Input.js";
import { CANVAS_W, CANVAS_H } from "./Constants.js";
import { Player } from "../entities/Player.js";
import { Camera } from "../../world/Camera.js";
import { Level } from "../../world/Level.js";
import { ParallaxLayer } from "../../world/Parallax.js";
import { Time } from "./Time.js";

export class Game {
  /**
  * Creates the central game instance.
  * @param {HTMLCanvasElement} canvas The game canvas.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.imageCache = new ImageCache();
    this.input = new Input();
    this.camera = new Camera(CANVAS_W, CANVAS_H);
    this.time = new Time(60);
    this.player = null;
    this.level = null;
    this.entities = [];
    this.bgLayers = [];
    this.levelPaths = [
      "assets/data/levels/level_01.json",
      "assets/data/levels/level_02.json",
    ];
    this.currentLevelIndex = 0;
    this.intervalIds = [];
    this.running = false;
    this.levelTransitioning = false;
  }

  /**
    * Loads assets and starts the game loop.
   */
  async start() {
    try {
      this.stop();
      await this.#preload();
      await this.#loadLevel(this.currentLevelIndex);
      const back = this.imageCache.get(Assets.BG_BACK);
      const middle = this.imageCache.get(Assets.BG_MIDDLE);
      const backScale = CANVAS_H / back.height;
      const midScale = (CANVAS_H * 0.55) / middle.height;
      this.bgLayers = [
        new ParallaxLayer(back, 0.1, backScale, 0),
        new ParallaxLayer(middle, 0.3, midScale, 0),
      ];
      this.running = true;
      this.levelTransitioning = false;
      let self = this;
      requestAnimationFrame(function (ts) {
        self.time.reset(ts);
        self.#loop(ts);
      });
    } catch (err) {
      console.error("Failed to start game:", err);
      const details = err instanceof Error ? err.message : String(err);
      this.#showError(`Asset load error: ${details}`);
    }
  }

  /**
    * Loads all statically registered assets.
   */
  async #preload() {
    const paths = Object.values(Assets);
    await this.imageCache.loadAll(paths);
  }

  /**
    * Loads a level by its index.
    * @param {number} levelIndex The index inside the level path array.
   */
  async #loadLevel(levelIndex) {
    const tilesetImg = this.imageCache.get(Assets.TILESET);
    this.level = await Level.load(this.levelPaths[levelIndex], tilesetImg);

    if (!(this.player instanceof Player)) {
      this.player = new Player(this.imageCache, this.level, this.setStoppableInterval.bind(this));
      this.entities = [this.player];
      return;
    }

    this.player.stopIntervals();
    this.player = new Player(this.imageCache, this.level, this.setStoppableInterval.bind(this));
    this.entities = [this.player];
  }

  /**
    * Creates a stoppable interval and stores its ID.
    * @param {Function} fn The callback function to execute.
    * @param {number} time The interval time in milliseconds.
   */
  setStoppableInterval(fn, time) {
    const id = setInterval(fn, time);
    this.intervalIds.push(id);
    return id;
  }

  /**
    * Stops all active intervals of this game instance.
   */
  stopIntervals() {
    for (let i = 0; i < this.intervalIds.length; i++) {
      clearInterval(this.intervalIds[i]);
    }
    this.intervalIds = [];
  }

  /**
    * Stops the game state and all running intervals.
   */
  stop() {
    this.running = false;
    this.levelTransitioning = false;
    if (this.player instanceof Player) {
      this.player.stopIntervals();
    }
    this.stopIntervals();
  }

  /**
    * Executes the next render frame.
    * @param {number} ts Browser frame timestamp.
   */
  #loop(ts) {
    if (!this.running) return;

    const updates = this.time.tick(ts);
    for (let i = 0; i < updates; i++) {
      this.#update(this.time.step);
    }
    this.#draw();
    let self = this;
    requestAnimationFrame(function (newTs) {
      self.#loop(newTs);
    });
  }

  /**
    * Updates game state and entities.
    * @param {number} dt Fixed delta time in seconds.
   */
  #update(dt) {
    if (!(this.player instanceof Player) || !this.level) return;

    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (!entity || !entity.active) continue;
      if (entity instanceof Player) {
        entity.update(dt, this.input, this.level.tilemap);
      }
    }

    const levelW = this.level.tilemap.cols * this.level.tilemap.displaySize;
    this.camera.follow(this.player, levelW);

    if (this.#shouldAdvanceLevel(levelW) && !this.levelTransitioning) {
      this.levelTransitioning = true;
      let self = this;
      this.#advanceLevel()
        .catch(function (err) {
          console.error("Level transition failed:", err);
        })
        .finally(function () {
          self.levelTransitioning = false;
        });
    }

    this.input.endFrame();
  }

  /**
    * Checks whether a level transition should trigger at the right edge.
    * @param {number} levelW Level width in pixels.
   */
  #shouldAdvanceLevel(levelW) {
    const threshold = levelW - this.player.hitW - 12;
    return this.player.x >= threshold;
  }

  /**
    * Switches to the next level and resets the camera.
   */
  async #advanceLevel() {
    if (this.currentLevelIndex + 1 >= this.levelPaths.length) {
      this.currentLevelIndex = 0;
    } else {
      this.currentLevelIndex += 1;
    }
    await this.#loadLevel(this.currentLevelIndex);
    this.camera.x = 0;
  }

  /**
    * Draws the current frame.
   */
  #draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.fillStyle = "#5DC8E8";
    this.ctx.fillRect(0, 0, w, h);
    if (!(this.player instanceof Player) || !this.level) return;
    for (let i = 0; i < this.bgLayers.length; i++) {
      this.bgLayers[i].draw(this.ctx, w, h, this.camera.x);
    }
    this.level.tilemap.draw(this.ctx, this.camera);
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (!entity || !entity.active) continue;
      entity.draw(this.ctx, this.camera);
    }
  }

  /**
    * Draws an error message directly on the canvas.
    * @param {string} message The error text to display.
   */
  #showError(message) {
    this.ctx.fillStyle = "#0b0f14";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px monospace";
    this.ctx.fillText(message, 20, 40);
  }
}