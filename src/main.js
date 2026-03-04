import { Game } from "./core/Game.js";
import { fitCanvasToWindow } from "./core/Resize.js";
import { toggleFullscreen } from "./core/Fullscreen.js";

/**
 * Starts the game and registers global event listeners.
 * @param {Event} _event The window load event.
 */
function bootstrapGame(_event) {
  const container = document.getElementById("gameContainer");
  const canvas = document.getElementById("gameCanvas");
  fitCanvasToWindow(container, 720, 480);
  window.addEventListener("resize", () => fitCanvasToWindow(container, 720, 480));
  window.addEventListener("keydown", async (e) => {
    if (e.repeat) return;

    if (e.key.toLowerCase() === "f") {
      try {
        await toggleFullscreen(container);
        fitCanvasToWindow(container, 720, 480);
      } catch (err) {
        console.warn("Fullscreen blocked by browser:", err);
      }
    }
  });

  const game = new Game(canvas);
  game.start();
}

window.addEventListener("load", bootstrapGame);