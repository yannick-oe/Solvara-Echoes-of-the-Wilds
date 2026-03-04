export class ParallaxLayer {
  constructor(img, scrollFactor, scale, bottomOffset) {
    this.img = img;
    this.scrollFactor = scrollFactor;
    this.scale = scale;
    this.bottomOffset = bottomOffset;
  }

  draw(ctx, canvasW, canvasH, cameraX) {
    const w = Math.ceil(this.img.width * this.scale);
    const h = Math.ceil(this.img.height * this.scale);
    const y = Math.round(canvasH - h - this.bottomOffset);
    const scrollX = cameraX * this.scrollFactor;
    const offset = ((scrollX % w) + w) % w;
    let x = -Math.round(offset);
    while (x < canvasW) {
      ctx.drawImage(this.img, Math.round(x), y, w, h);
      x += w;
    }
  }
}