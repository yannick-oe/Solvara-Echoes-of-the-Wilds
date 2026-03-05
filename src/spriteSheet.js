export class SpriteSheet { // Diese Klasse hilft uns, kleine Bilder aus einem großen Spritesheet zu holen.
  constructor(image, frameWidth, frameHeight) { // Hier starten wir mit Bild und Frame-Größe.
    this.image = image; // Das große Spritesheet-Bild.
    this.frameWidth = frameWidth; // Breite von einem Frame im Spritesheet.
    this.frameHeight = frameHeight; // Höhe von einem Frame im Spritesheet.
    this.columns = Math.floor(image.width / frameWidth); // Wie viele Spalten es im Spritesheet gibt.
  } // Ende vom Konstruktor.

  frame(index) { // Diese Funktion holt einen Frame über eine laufende Nummer.
    const col = index % this.columns; // Spalte vom Frame ausrechnen.
    const row = Math.floor(index / this.columns); // Reihe vom Frame ausrechnen.

    return { // Wir geben den Quell-Rechteck-Bereich für drawImage zurück.
      sx: col * this.frameWidth, // Start-X im Spritesheet.
      sy: row * this.frameHeight, // Start-Y im Spritesheet.
      sw: this.frameWidth, // Quell-Breite.
      sh: this.frameHeight, // Quell-Höhe.
    }; // Ende Rückgabe-Objekt.
  } // Ende von frame.

  frameAt(column, row) { // Diese Funktion holt einen Frame direkt über Spalte und Reihe.
    return { // Wir geben den Quell-Rechteck-Bereich für drawImage zurück.
      sx: column * this.frameWidth, // Start-X im Spritesheet.
      sy: row * this.frameHeight, // Start-Y im Spritesheet.
      sw: this.frameWidth, // Quell-Breite.
      sh: this.frameHeight, // Quell-Höhe.
    }; // Ende Rückgabe-Objekt.
  } // Ende von frameAt.
} // Ende der SpriteSheet-Klasse.