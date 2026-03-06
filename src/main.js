import { Game } from "./game.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";

function fitContainerToWindow(container, baseWidth, baseHeight) {
  const scaleX = Math.floor(window.innerWidth / baseWidth); // Wie oft die Basisbreite in den Viewport passt.
  const scaleY = Math.floor(window.innerHeight / baseHeight); // Wie oft die Basishoehe in den Viewport passt.
  const scale = Math.max(1, Math.min(scaleX, scaleY)); // Gleichmaessige Skalierung ohne Verzerrung.
  const displayWidth = baseWidth * scale;
  const displayHeight = baseHeight * scale;

  container.style.width = `${displayWidth}px`;
  container.style.height = `${displayHeight}px`;
  container.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`; // Canvas horizontal zentrieren.
  container.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`; // Canvas vertikal zentrieren.
}

async function toggleFullscreen(container) {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await container.requestFullscreen(); // Fullscreen auf den Spielcontainer statt auf ganze Seite anwenden.
  }
}

function bootstrapGame() {
  const container = document.getElementById("gameContainer");
  const canvas = document.getElementById("gameCanvas");

  fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT);
  window.addEventListener("resize", function () {
    fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Bei Fensteraenderung sofort neu skalieren.
  });

  window.addEventListener("keydown", async function (event) {
    if (event.repeat) return; // Taste nur einmal pro Druecken auswerten.
    if (event.key.toLowerCase() !== "f") return; // Fullscreen nur auf Taste F.

    try {
      await toggleFullscreen(container);
      fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Nach Fullscreen erneut sauber einpassen.
    } catch (error) {
      console.warn("Fullscreen request was blocked:", error);
    }
  });

  const game = new Game(canvas);
  game.start();
}

window.addEventListener("load", bootstrapGame); // Erst starten, wenn DOM + Canvas vorhanden sind.
