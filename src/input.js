export class Input { // Diese Klasse kümmert sich um Tastatur-Eingaben.
  constructor() { // Hier richten wir alles für die Tasten ein.
    this.keys = {}; // Hier steht: welche Taste wird gerade gehalten?
    this.pressedThisFrame = {}; // Hier steht: welche Taste wurde nur in diesem Frame neu gedrückt?

    let self = this; // Wir speichern `this`, damit es in den Event-Funktionen nutzbar bleibt.
    window.addEventListener("keydown", function (event) { // Wenn eine Taste runtergedrückt wird...
      if (!event.repeat) { // ...und es ist kein automatisches Wiederholen...
        self.pressedThisFrame[event.code] = true; // ...merken wir: Taste wurde in diesem Frame neu gedrückt.
      } // Ende Repeat-Check.
      self.keys[event.code] = true; // Taste ist jetzt gehalten.

      if ( // Für diese Tasten verhindern wir Browser-Standard (z. B. Scrollen).
        event.code === "ArrowLeft" || // Pfeil links.
        event.code === "ArrowRight" || // Pfeil rechts.
        event.code === "ArrowUp" || // Pfeil hoch.
        event.code === "ArrowDown" || // Pfeil runter.
        event.code === "Space" // Leertaste.
      ) { // Wenn eine dieser Tasten gedrückt ist...
        event.preventDefault(); // ...stoppen wir das Standard-Verhalten vom Browser.
      } // Ende preventDefault-Block.
    }); // Ende keydown-Listener.

    window.addEventListener("keyup", function (event) { // Wenn eine Taste losgelassen wird...
      self.keys[event.code] = false; // ...merken wir: Taste ist nicht mehr gehalten.
    }); // Ende keyup-Listener.
  } // Ende vom Konstruktor.

  isDown(code) { // Diese Funktion fragt: wird die Taste gerade gehalten?
    return this.keys[code] === true; // true heißt: ja, Taste ist gedrückt.
  } // Ende von isDown.

  wasPressed(code) { // Diese Funktion fragt: wurde die Taste genau in diesem Frame neu gedrückt?
    return this.pressedThisFrame[code] === true; // true heißt: ja, sie wurde frisch gedrückt.
  } // Ende von wasPressed.

  endFrame() { // Diese Funktion wird einmal pro Frame aufgerufen.
    this.pressedThisFrame = {}; // Wir löschen die "neu gedrückt"-Infos für den nächsten Frame.
  } // Ende von endFrame.
} // Ende der Input-Klasse.
