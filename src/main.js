import { Game } from "./game.js"; // Import a dependency used in this file.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js"; // Import a dependency used in this file.

function fitContainerToWindow(container, baseWidth, baseHeight) { // Execute this step in the current flow.
  const scaleX = Math.floor(window.innerWidth / baseWidth); // Create a local constant for this scope.
  const scaleY = Math.floor(window.innerHeight / baseHeight); // Create a local constant for this scope.
  const scale = Math.max(1, Math.min(scaleX, scaleY)); // Create a local constant for this scope.
  const displayWidth = baseWidth * scale; // Create a local constant for this scope.
  const displayHeight = baseHeight * scale; // Create a local constant for this scope.

  container.style.width = `${displayWidth}px`; // Compute and store a value for later use.
  container.style.height = `${displayHeight}px`; // Compute and store a value for later use.
  container.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`; // Compute and store a value for later use.
  container.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`; // Compute and store a value for later use.
}

async function toggleFullscreen(container) { // Execute this step in the current flow.
  // This function handles the if behavior in this file.
  if (document.fullscreenElement) { // Check a condition before executing this block.
    await document.exitFullscreen(); // Wait for the async operation to finish.
  } else { // Execute this step in the current flow.
    await container.requestFullscreen(); // Wait for the async operation to finish.
  }
}

function bootstrapGame() { // Execute this step in the current flow.
  const container = document.getElementById("gameContainer"); // Create a local constant for this scope.
  const canvas = document.getElementById("gameCanvas"); // Create a local constant for this scope.

  fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Call a function to perform this step.
  window.addEventListener("resize", function () { // Execute this step in the current flow.
    fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Call a function to perform this step.
  }); // Call a function to perform this step.

  window.addEventListener("keydown", async function (event) { // Execute this step in the current flow.
    if (event.repeat) return; // Check a condition before executing this block.
    if (event.key.toLowerCase() !== "f") return; // Check a condition before executing this block.

    try { // Execute this step in the current flow.
      await toggleFullscreen(container); // Wait for the async operation to finish.
      fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Call a function to perform this step.
    } catch (error) { // Execute this step in the current flow.
      console.warn("Fullscreen request was blocked:", error); // Call a function to perform this step.
    }
  }); // Call a function to perform this step.

  const game = new Game(canvas); // Create a local constant for this scope.
  game.start(); // Call a function to perform this step.
}

window.addEventListener("load", bootstrapGame); // Call a function to perform this step.
