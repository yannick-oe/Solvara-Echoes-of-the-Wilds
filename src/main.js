import { Game } from "./game.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js"; // Importiert eine in dieser Datei verwendete Abhaengigkeit.

function fitContainerToWindow(container, baseWidth, baseHeight) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  const scaleX = Math.floor(window.innerWidth / baseWidth); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  const scaleY = Math.floor(window.innerHeight / baseHeight); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  const scale = Math.max(1, Math.min(scaleX, scaleY)); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  const displayWidth = baseWidth * scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  const displayHeight = baseHeight * scale; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

  container.style.width = `${displayWidth}px`; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
  container.style.height = `${displayHeight}px`; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
  container.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
  container.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
}

async function toggleFullscreen(container) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
  if (document.fullscreenElement) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    await document.exitFullscreen(); // Wartet, bis die asynchrone Operation abgeschlossen ist.
  } else { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    await container.requestFullscreen(); // Wartet, bis die asynchrone Operation abgeschlossen ist.
  }
}

function bootstrapGame() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
  const container = document.getElementById("gameContainer"); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  const canvas = document.getElementById("gameCanvas"); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

  fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  window.addEventListener("resize", function () { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

  window.addEventListener("keydown", async function (event) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    if (event.repeat) return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
    if (event.key.toLowerCase() !== "f") return; // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.

    try { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      await toggleFullscreen(container); // Wartet, bis die asynchrone Operation abgeschlossen ist.
      fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    } catch (error) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      console.warn("Fullscreen request was blocked:", error); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }
  }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

  const game = new Game(canvas); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
  game.start(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
}

window.addEventListener("load", bootstrapGame); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
