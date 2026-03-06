export class Input {
  constructor() {
    this.keys = {}; // Dauerzustand: Taste wird gehalten.
    this.pressedThisFrame = {}; // One-frame Trigger fuer "neu gedrueckt".
    this.releasedThisFrame = {}; // One-frame Trigger fuer "losgelassen".

    let self = this;

    window.addEventListener("keydown", function (event) {
      if (!event.repeat) {
        self.pressedThisFrame[event.code] = true; // Nur erste Wiederholung als "Pressed" registrieren.
      }
      self.keys[event.code] = true;

      if (
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight" ||
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "Space"
      ) {
        event.preventDefault(); // Verhindert Browser-Scrollen waehrend der Spielsteuerung.
      }
    });

    window.addEventListener("keyup", function (event) {
      self.keys[event.code] = false;
      self.releasedThisFrame[event.code] = true;
    });
  }

  isDown(code) {
    return this.keys[code] === true; // Fuer Bewegung (A/D, Pfeile) sinnvoll.
  }

  wasPressed(code) {
    return this.pressedThisFrame[code] === true; // Fuer Jump/Interact, damit Aktion nur einmal feuert.
  }

  wasReleased(code) {
    return this.releasedThisFrame[code] === true;
  }

  endFrame() {
    this.pressedThisFrame = {};
    this.releasedThisFrame = {};
  }
}
