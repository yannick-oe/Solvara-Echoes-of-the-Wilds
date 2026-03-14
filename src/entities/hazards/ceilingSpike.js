import { Entity } from '../entity.js';
import { GRAVITY, MAX_FALL_SPEED } from '../../core/constants.js';

// Originalgröße des Prop-Bildes: 15×9 px
// Zeichengröße: 3× skaliert → 45×27 px
const DRAW_W = 45;
const DRAW_H = 27;

// Kollisions-Hitbox (nur während des Falls tödlich)
// 6 px Einzug links/rechts, Spitzen zeigen nach unten
const HIT_OX = 6;
const HIT_OY = 0;
const HIT_W  = 33;
const HIT_H  = 27;

/**
 * Deckenspike – kann statisch oder als Fallenfalle konfiguriert werden.
 *
 * @param {number}  x               Weltkoordinate links (Zeichenpos)
 * @param {number}  y               Weltkoordinate oben  (Zeichenpos); Unterkante = Decke
 * @param {boolean} [triggers=false] true → Spike fällt wenn Spieler nahe genug
 * @param {number}  [triggerRangeX=88] horizontale Auslösedistanz (px) vom Spike-Mittelpunkt
 */
export class CeilingSpike extends Entity {
  constructor(x, y, triggers = false, triggerRangeX = 88) {
    super(x + HIT_OX, y + HIT_OY, HIT_W, HIT_H);

    this._drawX        = x;
    this._drawY        = y;
    this._triggers     = triggers;
    this._triggerRange = triggerRangeX;
    this._centerX      = x + DRAW_W / 2;

    // Zustand: 'idle' | 'falling' | 'landed'
    this._state = triggers ? 'idle' : 'static';
    this.velY   = 0;
  }

  /**
   * @param {number} dt
   * @param {{ x: number, y: number, w: number, h: number }} player  Spieler-Bounds
   * @param {number} groundY  Y-Koordinate der Bodenoberfläche (Weltpixel)
   */
  update(dt, player, groundY) {
    if (this._state === 'idle') {
      const playerCenterX = player.x + player.w / 2;
      // Auslösen wenn Spieler horizontal nahe genug UND unterhalb des Spikes
      if (
        Math.abs(playerCenterX - this._centerX) < this._triggerRange &&
        player.y > this._drawY
      ) {
        this._state = 'falling';
      }
    }

    if (this._state === 'falling') {
      this.velY = Math.min(this.velY + GRAVITY * dt, MAX_FALL_SPEED);
      const dy   = this.velY * dt;
      this._drawY += dy;
      this.y      += dy;   // Hitbox mitbewegen

      // Boden erreicht: Spike fällt aus der Welt und verschwindet
      if (this._drawY + DRAW_H >= groundY) {
        this.active = false;
      }
    }
  }

  /** Gibt true zurück wenn dieser Spike aktuell tödlich ist (fällt gerade). */
  get isLethal() {
    return this._state === 'falling';
  }

  /**
   * @param {CanvasRenderingContext2D}                    ctx
   * @param {*}                                          _cam
   * @param {import('../../core/imageCache.js').ImageCache} imageCache
   */
  draw(ctx, _cam, imageCache) {
    if (!this.active) return;
    const img = imageCache.get('PROP_SPIKES_TOP');
    if (!img) return;
    ctx.drawImage(img, this._drawX, this._drawY, DRAW_W, DRAW_H);
  }
}
