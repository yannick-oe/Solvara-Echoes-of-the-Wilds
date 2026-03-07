import { Entity } from '../entity.js';

// Originalgröße des Prop-Bildes: 15×10 px
// Zeichengröße: 3× skaliert → 45×30 px
const DRAW_W  = 45;
const DRAW_H  = 30;

// Kollisions-Hitbox: nur der obere, spitze Teil zählt als tödlich.
// 6 px Einzug links/rechts, 0 px oben (Spitzen), 14 px unten (Sockel = harmlos)
const HIT_OX  = 6;   // Hitbox-Offset X relativ zur Entity-Pos
const HIT_OY  = 0;   // Hitbox-Offset Y relativ zur Entity-Pos
const HIT_W   = 33;  // 45 - 2*6
const HIT_H   = 16;  // nur obere Hälfte (Spitzen)

/**
 * Statischer Bodenspike.
 * Erstellt eine Spike-Gruppe die an einer festen Weltposition steht.
 * Tödlich wenn der Spieler die Hitbox berührt (oberer Bereich der Spitzen).
 *
 * @param {number} x  Weltkoordinate links (Zeichenpos)
 * @param {number} y  Weltkoordinate oben  (Zeichenpos)
 */
export class FloorSpike extends Entity {
  constructor(x, y) {
    // Entity-Hitbox entspricht der tödlichen Trefferzone
    super(x + HIT_OX, y + HIT_OY, HIT_W, HIT_H);

    this._drawX = x;
    this._drawY = y;
  }

  // Keine update()-Logik nötig — static

  /**
   * @param {CanvasRenderingContext2D}                    ctx
   * @param {*}                                          _cam  (unused, Kamera-Transform bereits aktiv)
   * @param {import('../../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    const img = imageCache.get('PROP_SPIKES');
    if (!img) return;
    ctx.drawImage(img, this._drawX, this._drawY, DRAW_W, DRAW_H);
  }
}
