export class ParallaxLayer {
  constructor(image, scrollFactor, scale, bottomOffset) {
    this.image = image;
    this.scrollFactor = scrollFactor;
    this.scale = scale;
    this.bottomOffset = bottomOffset;
  }

  draw(ctx, canvasWidth, canvasHeight, cameraX) {
    // Layer wird skaliert, damit er bei der gewuenschten Bildhoehe sauber passt.
    const imageWidth = Math.ceil(this.image.width * this.scale);
    const imageHeight = Math.ceil(this.image.height * this.scale);
    const y = Math.round(canvasHeight - imageHeight - this.bottomOffset);
    // Kamera-Bewegung wird ueber scrollFactor abgeschwaecht/verstaerkt.
    const scrollX = cameraX * this.scrollFactor;
    const offset = ((scrollX % imageWidth) + imageWidth) % imageWidth;
    // Kachel-Wiederholung in X, damit der Hintergrund endlos wirkt.
    let x = -Math.round(offset);
    while (x < canvasWidth) {
      ctx.drawImage(this.image, Math.round(x), y, imageWidth, imageHeight);
      x += imageWidth;
    }
  }
}
