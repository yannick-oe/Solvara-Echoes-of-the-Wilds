export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width; // Sichtfenster-Breite entspricht Canvas-Breite.
    this.height = height; // Sichtfenster-Hoehe entspricht Canvas-Hoehe.
  }

  follow(target, levelPixelWidth) {
    this.x = target.x + target.width / 2 - this.width / 2; // Spieler horizontal in die Bildschirmmitte setzen.

    if (this.x < 0) {
      this.x = 0; // Nicht links aus der Welt hinausscrollen.
    }

    const maxX = Math.max(0, levelPixelWidth - this.width); // Letzte gueltige Kamera-Position rechts.
    if (this.x > maxX) {
      this.x = maxX; // Nicht rechts aus der Welt hinausscrollen.
    }

    this.x = Math.round(this.x); // Pixelgenaues Rendering ohne Subpixel-Zittern.

    this.y = 0; // Solvara scrollt aktuell nur horizontal.
  }
}
