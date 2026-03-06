export class ParallaxLayer { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor(image, scrollFactor, scale, bottomOffset) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.image = image; // Speichert Daten in der aktuellen Objektinstanz.
    this.scrollFactor = scrollFactor; // Speichert Daten in der aktuellen Objektinstanz.
    this.scale = scale; // Speichert Daten in der aktuellen Objektinstanz.
    this.bottomOffset = bottomOffset; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "draw" in dieser Datei.
  draw(ctx, canvasWidth, canvasHeight, cameraX) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const imageWidth = Math.ceil(this.image.width * this.scale); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const imageHeight = Math.ceil(this.image.height * this.scale); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const y = Math.round(canvasHeight - imageHeight - this.bottomOffset); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    const scrollX = cameraX * this.scrollFactor; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const offset = ((scrollX % imageWidth) + imageWidth) % imageWidth; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    let x = -Math.round(offset); // Erzeugt eine lokale Variable, die sich aendern kann.
    // Diese Funktion verarbeitet das Verhalten "while" in dieser Datei.
    while (x < canvasWidth) { // Wiederholt diesen Block, solange die Bedingung wahr ist.
      ctx.drawImage(this.image, Math.round(x), y, imageWidth, imageHeight); // Rendert ein Bild (oder einen Sprite-Bereich) auf dem Canvas.
      x += imageWidth; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }
  }
}
