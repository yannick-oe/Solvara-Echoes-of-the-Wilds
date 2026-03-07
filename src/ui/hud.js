import { STAR_COIN_COUNT } from '../core/constants.js';

// Layout-Konstanten
const PAD = 12; // Rand-Abstand zum Canvas-Rand
const CHERRY_SIZE = 28; // Breite/Höhe eines Cherry-Icons im HUD
const CHERRY_GAP = 4; // Abstand zwischen Cherries
const COIN_SIZE = 34; // Durchmesser eines StarCoin-Slots im HUD (größer)
const COIN_GAP = 4; // Abstand zwischen Coin-Slots (enger)
const GEM_SIZE = 20; // Größe des Gem-Icons im HUD
const HUD_FONT = 'bold 14px monospace';

export class Hud {
  /** @param {import('../core/imageCache.js').ImageCache} imageCache */
  constructor(imageCache) {
    this._imageCache = imageCache;
  }

  /**
   * Zeichnet das HUD im Screen-Space (nach ctx.restore der Weltmatrix aufrufen).
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ hearts: number, heartsMax: number, score: number, gemsCollected: number, starCoins: boolean[] }} gameState
   */
  draw(ctx, gameState) {
    this._drawCherries(ctx, gameState.hearts);
    this._drawScore(ctx, gameState.score, gameState.gemsCollected);
    this._drawStarCoins(ctx, gameState.starCoins);
  }

  // ---------------------------------------------------------------------------
  // Cherries als Lebensanzeige – linke obere Ecke
  // Zeigt genau so viele Cherry-Icons wie der Spieler aktuell Herzen hat.
  // Leere Slots werden NICHT dargestellt.
  // ---------------------------------------------------------------------------
  _drawCherries(ctx, hearts) {
    for (let i = 0; i < hearts; i++) {
      const x = PAD + i * (CHERRY_SIZE + CHERRY_GAP);
      const y = PAD;
      const img = this._imageCache.get('CHERRY_0');

      if (img) {
        ctx.drawImage(img, x, y, CHERRY_SIZE, CHERRY_SIZE);
      } else {
        ctx.fillStyle = '#e8344a';
        ctx.fillRect(x + 4, y + 4, CHERRY_SIZE - 8, CHERRY_SIZE - 8);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Punktzahl + Gem-Zähler – rechte obere Ecke
  // ---------------------------------------------------------------------------
  _drawScore(ctx, score, gemsCollected) {
    const gemImg = this._imageCache.get('GEM_0');
    const rightEdge = ctx.canvas.width - PAD;

    ctx.save();
    ctx.font = HUD_FONT;
    ctx.textBaseline = 'top';

    const scoreText = `Score: ${score}`;
    const scoreW = ctx.measureText(scoreText).width;
    const scoreX = rightEdge - scoreW;
    this._drawOutlinedText(ctx, scoreText, scoreX, PAD);

    const gemY = PAD + 22;
    const gemText = `×${gemsCollected}`;
    const gemTextW = ctx.measureText(gemText).width;

    if (gemImg) {
      const iconX = rightEdge - GEM_SIZE - 4 - gemTextW;
      ctx.drawImage(gemImg, iconX, gemY, GEM_SIZE, GEM_SIZE);
      this._drawOutlinedText(ctx, gemText, rightEdge - gemTextW, gemY + (GEM_SIZE - 14) / 2);
    } else {
      this._drawOutlinedText(ctx, gemText, rightEdge - gemTextW, gemY);
    }

    ctx.restore();
  }

  /**
   * Zeichnet Text mit schwarzem Outline für bessere Lesbarkeit.
   * Setzt ctx.font und ctx.textBaseline voraus.
   */
  _drawOutlinedText(ctx, text, x, y) {
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
  }

  // ---------------------------------------------------------------------------
  // StarCoins – mittig oben
  // ---------------------------------------------------------------------------
  _drawStarCoins(ctx, starCoins) {
    const totalW = STAR_COIN_COUNT * COIN_SIZE + (STAR_COIN_COUNT - 1) * COIN_GAP;
    const startX = (ctx.canvas.width - totalW) / 2;
    const y = PAD;

    for (let i = 0; i < STAR_COIN_COUNT; i++) {
      const cx = startX + i * (COIN_SIZE + COIN_GAP);
      const img = this._imageCache.get('STAR_COIN_0');
      const filled = starCoins[i] === true;

      ctx.save();

      if (!filled) {
        ctx.globalAlpha = 0.28;
      }

      if (img) {
        ctx.drawImage(img, cx, y, COIN_SIZE, COIN_SIZE);
      } else {
        ctx.beginPath();
        ctx.arc(cx + COIN_SIZE / 2, y + COIN_SIZE / 2, COIN_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = filled ? '#ffd700' : '#888';
        ctx.fill();
      }

      ctx.restore();
    }
  }
}