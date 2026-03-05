import { Game } from "./game.js"; // Wir holen die Game-Klasse, damit wir das Spiel starten können.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js"; // Wir holen feste Breite und Höhe vom Spiel.

function fitContainerToWindow(container, baseWidth, baseHeight) { // Diese Funktion passt den sichtbaren Spiel-Rahmen an das Fenster an.
  const scaleX = Math.floor(window.innerWidth / baseWidth); // So oft passt die Breite ins Fenster.
  const scaleY = Math.floor(window.innerHeight / baseHeight); // So oft passt die Höhe ins Fenster.
  const scale = Math.max(1, Math.min(scaleX, scaleY)); // Wir nehmen den kleineren Wert, aber mindestens 1.
  const displayWidth = baseWidth * scale; // Das ist die sichtbare Breite nach dem Vergrößern.
  const displayHeight = baseHeight * scale; // Das ist die sichtbare Höhe nach dem Vergrößern.

  container.style.width = `${displayWidth}px`; // Wir setzen die sichtbare Breite vom Container.
  container.style.height = `${displayHeight}px`; // Wir setzen die sichtbare Höhe vom Container.
  container.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`; // Wir schieben den Container mittig nach links/rechts.
  container.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`; // Wir schieben den Container mittig nach oben/unten.
} // Ende von fitContainerToWindow.

async function toggleFullscreen(container) { // Diese Funktion macht Vollbild an oder aus.
  if (document.fullscreenElement) { // Wenn schon etwas im Vollbild ist...
    await document.exitFullscreen(); // ...beenden wir Vollbild.
  } else { // Sonst...
    await container.requestFullscreen(); // ...machen wir den Spiel-Container in Vollbild.
  } // Ende Vollbild-Entscheidung.
} // Ende von toggleFullscreen.

function bootstrapGame() { // Diese Funktion startet alles, wenn die Seite geladen ist.
  const container = document.getElementById("gameContainer"); // Wir holen den äußeren Spiel-Container aus HTML.
  const canvas = document.getElementById("gameCanvas"); // Wir holen das Canvas aus HTML.

  fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Wir passen sofort die sichtbare Größe an.
  window.addEventListener("resize", function () { // Wenn das Fenster geändert wird...
    fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // ...passen wir die sichtbare Größe neu an.
  }); // Ende Resize-Listener.

  window.addEventListener("keydown", async function (event) { // Wenn eine Taste gedrückt wird...
    if (event.repeat) return; // ...ignorieren wir automatisches Wiederholen.
    if (event.key.toLowerCase() !== "f") return; // ...reagieren wir nur auf die Taste F.

    try { // Wir versuchen Vollbild sicher zu wechseln.
      await toggleFullscreen(container); // Vollbild umschalten.
      fitContainerToWindow(container, CANVAS_WIDTH, CANVAS_HEIGHT); // Danach Größe neu setzen.
    } catch (error) { // Wenn der Browser Vollbild blockiert...
      console.warn("Fullscreen request was blocked:", error); // ...zeigen wir eine Warnung in der Konsole.
    } // Ende Fehlerbehandlung.
  }); // Ende Keydown-Listener.

  const game = new Game(canvas); // Wir erzeugen ein neues Spiel mit dem Canvas.
  game.start(); // Wir starten das Spiel.
} // Ende von bootstrapGame.

window.addEventListener("load", bootstrapGame); // Wenn die Seite fertig geladen ist, starten wir bootstrapGame.