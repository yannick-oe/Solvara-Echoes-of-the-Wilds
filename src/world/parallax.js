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
      const { img, speed, drawH: layerH, alignBottom } = layer;
      if (!img) continue;

      // Optionale Höhe pro Layer (Standard: ganzes Canvas)
      const drawH = layerH ?? CANVAS_HEIGHT;
      const scale = drawH / img.naturalHeight;
      const drawW = Math.round(img.naturalWidth * scale);
      const drawY = alignBottom ? (CANVAS_HEIGHT - drawH) : 0;

      // floor-Positionen vermeiden Sub-Pixel-Risse beim Tiling
      const rawOff = (-camX * speed) % drawW;
      const startX = Math.floor(((rawOff % drawW) + drawW) % drawW) - drawW;

      for (let x = startX; x < CANVAS_WIDTH; x += drawW) {
        ctx.drawImage(img, Math.floor(x), drawY, drawW, drawH);
      }
    }
  }
}
