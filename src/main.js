import { Game } from "./game.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";

/*
  main.js
  -------
  This file connects the HTML page with the game code:
  1) It sizes the canvas container to the window.
  2) It handles fullscreen toggle.
  3) It creates and starts the Game instance.
*/

/**
 * Scales the visual game container while keeping the internal canvas resolution fixed.
 * @param {HTMLElement} container DOM node that wraps the canvas.
 * @param {number} baseWidth Internal game width (logical pixels).
 * @param {number} baseHeight Internal game height (logical pixels).
 */
function fitContainerToWindow(container, baseWidth, baseHeight) {
  const scaleX = Math.floor(window.innerWidth / baseWidth);
  const scaleY = Math.floor(window.innerHeight / baseHeight);
  const scale = Math.max(1, Math.min(scaleX, scaleY));
  const displayWidth = baseWidth * scale;
  const displayHeight = baseHeight * scale;

  container.style.width = `${displayWidth}px`;
  container.style.height = `${displayHeight}px`;
  container.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`;
  container.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`;
}

/**
 * Toggles fullscreen mode for the game container.
 * @param {HTMLElement} container DOM node to enter/exit fullscreen.
 */
async function toggleFullscreen(container) {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await container.requestFullscreen();
  }
}

/**
 * Entry point called after the page is loaded.
 * It wires window listeners and starts the game loop.
 */
function bootstrapGame() {
  const container = document.getElementById("gameContainer");
  const canvas = document.getElementById("gameCanvas");

  fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT);
  window.addEventListener("resize", function () {
    fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT);
  });

  window.addEventListener("keydown", async function (event) {
    if (event.repeat) return;
    if (event.key.toLowerCase() !== "f") return;

    try {
      await toggleFullscreen(container);
      fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT);
    } catch (error) {
      console.warn("Fullscreen request was blocked:", error);
    }
  });

  const game = new Game(canvas);
  game.start();
}

window.addEventListener("load", bootstrapGame);