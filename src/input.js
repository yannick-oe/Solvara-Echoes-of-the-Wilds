export class Input { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.keys = {}; // Speichert Daten in der aktuellen Objektinstanz.
    this.pressedThisFrame = {}; // Speichert Daten in der aktuellen Objektinstanz.
    this.releasedThisFrame = {}; // Speichert Daten in der aktuellen Objektinstanz.

    let self = this; // Erzeugt eine lokale Variable, die sich aendern kann.

    window.addEventListener("keydown", function (event) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
      if (!event.repeat) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        self.pressedThisFrame[event.code] = true; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
      }
      self.keys[event.code] = true; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.

      if ( // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
        event.code === "ArrowLeft" || // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        event.code === "ArrowRight" || // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        event.code === "ArrowUp" || // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        event.code === "ArrowDown" || // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        event.code === "Space" // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
      ) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        event.preventDefault(); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      }
    }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.

    window.addEventListener("keyup", function (event) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      self.keys[event.code] = false; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
      self.releasedThisFrame[event.code] = true; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }

  // Diese Funktion verarbeitet das Verhalten "isDown" in dieser Datei.
  isDown(code) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.keys[code] === true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "wasPressed" in dieser Datei.
  wasPressed(code) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.pressedThisFrame[code] === true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "wasReleased" in dieser Datei.
  wasReleased(code) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.releasedThisFrame[code] === true; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "endFrame" in dieser Datei.
  endFrame() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.pressedThisFrame = {}; // Speichert Daten in der aktuellen Objektinstanz.
    this.releasedThisFrame = {}; // Speichert Daten in der aktuellen Objektinstanz.
  }
}
