export class Camera { // Diese Klasse ist unsere Kamera im Spiel.
  constructor(width, height) { // Hier starten wir die Kamera mit Breite und Höhe.
    this.x = 0; // Startposition X der Kamera.
    this.y = 0; // Startposition Y der Kamera.
    this.width = width; // Sichtbare Breite der Kamera.
    this.height = height; // Sichtbare Höhe der Kamera.
  } // Ende vom Konstruktor.

  follow(target, levelPixelWidth) { // Diese Funktion lässt die Kamera dem Ziel auf X folgen.
    this.x = target.x + target.width / 2 - this.width / 2; // Kamera auf die Mitte vom Ziel setzen.

    if (this.x < 0) { // Wenn Kamera links über den Levelrand hinaus will...
      this.x = 0; // ...bleibt sie am linken Rand.
    } // Ende linker Rand.

    const maxX = Math.max(0, levelPixelWidth - this.width); // Das ist der maximal erlaubte X-Wert rechts.
    if (this.x > maxX) { // Wenn Kamera rechts zu weit raus will...
      this.x = maxX; // ...bleibt sie am rechten Rand.
    } // Ende rechter Rand.

    this.x = Math.round(this.x); // Wir runden X für stabile Pixel-Darstellung.

    this.y = 0; // In diesem Spiel bleibt Kamera-Y fest auf 0.
  } // Ende von follow.
} // Ende der Camera-Klasse.