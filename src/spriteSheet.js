export class SpriteSheet { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor(image, frameWidth, frameHeight) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.image = image; // Speichert Daten in der aktuellen Objektinstanz.
    this.frameWidth = frameWidth; // Speichert Daten in der aktuellen Objektinstanz.
    this.frameHeight = frameHeight; // Speichert Daten in der aktuellen Objektinstanz.
    this.columns = Math.floor(image.width / frameWidth); // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "frame" in dieser Datei.
  frame(index) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const col = index % this.columns; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const row = Math.floor(index / this.columns); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    return { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      sx: col * this.frameWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sy: row * this.frameHeight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sw: this.frameWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sh: this.frameHeight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };
  }

  // Diese Funktion verarbeitet das Verhalten "frameAt" in dieser Datei.
  frameAt(column, row) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      sx: column * this.frameWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sy: row * this.frameHeight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sw: this.frameWidth, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
      sh: this.frameHeight, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    };
  }
}
