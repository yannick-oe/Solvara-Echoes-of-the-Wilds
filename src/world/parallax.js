import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';

export class Parallax {
  /**
   * @param {{ img: HTMLImageElement, speed: number }[]} layers
   *   img   – vorgeladenes Bild (aus imageCache)
   *   speed – Scrollfaktor (0 = fixiert, 1 = kamerasynchron)
   *           Reihenfolge: hinterster Layer zuerst
   */
  constructor(layers) {
    this._layers = layers;
  }

  /**
   * Zeichnet alle Ebenen im Screen-Space (vor camera.applyTransform aufrufen).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX  Aktuelle Kamera-X-Position in Weltkoordinaten
   */
  draw(ctx, camX) {
    for (const layer of this._layers) {
      const { img, speed } = layer;
      if (!img) continue;

      // Bild auf Canvas-Höhe skalieren, Seitenverhältnis beibehalten
      const scale = CANVAS_HEIGHT / img.naturalHeight;
      const drawW = Math.ceil(img.naturalWidth * scale);

      // Immer-positiver Offset für nahtloses horizontales Tiling
      const rawOff = (-camX * speed) % drawW;
      const startX = ((rawOff % drawW) + drawW) % drawW - drawW;

      for (let x = startX; x < CANVAS_WIDTH; x += drawW) {
        ctx.drawImage(img, x, 0, drawW, CANVAS_HEIGHT);
      }
    }
  }
}
