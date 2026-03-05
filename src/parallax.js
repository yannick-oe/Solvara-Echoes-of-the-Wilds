export class ParallaxLayer { // Diese Klasse zeichnet einen Hintergrund, der sich langsamer bewegt.
  constructor(image, scrollFactor, scale, bottomOffset) { // Hier starten wir den Layer mit Bild und Einstellungen.
    this.image = image; // Das Hintergrund-Bild für diesen Layer.
    this.scrollFactor = scrollFactor; // Wie stark der Layer auf Kamera-Bewegung reagiert.
    this.scale = scale; // Wie groß das Bild gezeichnet wird.
    this.bottomOffset = bottomOffset; // Abstand vom unteren Canvas-Rand.
  } // Ende vom Konstruktor.

  draw(ctx, canvasWidth, canvasHeight, cameraX) { // Diese Funktion zeichnet den Layer über die ganze Breite.
    const imageWidth = Math.ceil(this.image.width * this.scale); // Gezeichnete Breite vom Bild.
    const imageHeight = Math.ceil(this.image.height * this.scale); // Gezeichnete Höhe vom Bild.
    const y = Math.round(canvasHeight - imageHeight - this.bottomOffset); // Y-Position vom Bild auf dem Canvas.

    const scrollX = cameraX * this.scrollFactor; // Layer verschiebt sich nur anteilig zur Kamera.
    const offset = ((scrollX % imageWidth) + imageWidth) % imageWidth; // Positiver Wiederhol-Offset fürs Kacheln.

    let x = -Math.round(offset); // Wir starten links so, dass die Wiederholung sauber aussieht.
    while (x < canvasWidth) { // Solange rechts noch Platz ist...
      ctx.drawImage(this.image, Math.round(x), y, imageWidth, imageHeight); // ...zeichnen wir das Bild.
      x += imageWidth; // Danach springen wir um eine Bildbreite weiter.
    } // Ende Wiederhol-Schleife.
  } // Ende von draw.
} // Ende der ParallaxLayer-Klasse.