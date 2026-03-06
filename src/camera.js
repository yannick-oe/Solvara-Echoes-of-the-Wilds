export class Camera { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor(width, height) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.x = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.y = 0; // Speichert Daten in der aktuellen Objektinstanz.
    this.width = width; // Speichert Daten in der aktuellen Objektinstanz.
    this.height = height; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "follow" in dieser Datei.
  follow(target, levelPixelWidth) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.x = target.x + target.width / 2 - this.width / 2; // Speichert Daten in der aktuellen Objektinstanz.

    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.x < 0) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.x = 0; // Speichert Daten in der aktuellen Objektinstanz.
    }

    const maxX = Math.max(0, levelPixelWidth - this.width); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    // Diese Funktion verarbeitet das Verhalten "if" in dieser Datei.
    if (this.x > maxX) { // Prueft eine Bedingung, bevor dieser Block ausgefuehrt wird.
      this.x = maxX; // Speichert Daten in der aktuellen Objektinstanz.
    }

    this.x = Math.round(this.x); // Speichert Daten in der aktuellen Objektinstanz.

    this.y = 0; // Speichert Daten in der aktuellen Objektinstanz.
  }
}
