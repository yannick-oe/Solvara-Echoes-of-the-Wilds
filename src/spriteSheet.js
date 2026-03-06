export class SpriteSheet {
  constructor(image, frameWidth, frameHeight) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    // Wie viele Frames pro Zeile im Atlas liegen.
    this.columns = Math.floor(image.width / frameWidth);
  }

  frame(index) {
    // 1D-Index in 2D-Atlasposition umrechnen.
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    return {
      sx: col * this.frameWidth,
      sy: row * this.frameHeight,
      sw: this.frameWidth,
      sh: this.frameHeight,
    };
  }

  frameAt(column, row) {
    // Direkter Zugriff per Spalte/Zeile (wird z. B. fuer feste Animframes genutzt).
    return {
      sx: column * this.frameWidth,
      sy: row * this.frameHeight,
      sw: this.frameWidth,
      sh: this.frameHeight,
    };
  }
}
