import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { t } from '../../core/localization.js';
import { audioManager } from '../../core/audioManager.js';

// ─── Konstanten ───────────────────────────────────────────────────────────────
const STING_SRC      = 'assets/audio/music/gameOver.mp3';
const FONT_MAIN      = 'bold 58px serif';
const FONT_HINT      = '14px monospace';
const FALL_DURATION  = 0.46;    // Sekunden vom Startpunkt bis zur Ruhelage
const STAGGER        = 0.052;   // Sekunden Versatz zwischen Buchstaben
const START_OFFSET   = -265;    // px über der Endposition (Startpunkt der Buchstaben)
const CHAR_GAP       = 2;       // px Lücke zwischen Buchstaben
const TITLE_Y_FRAC   = 0.46;    // Bruchteil von CANVAS_HEIGHT für die Basislinie
const SWEEP_DURATION = 1.1;     // Sekunden für den Glow-Sweep
const PARTICLE_MAX   = 42;

/** Standard easeOutBounce (Werte 0 → 1 mit Rückprall-Effekt). */
function easeOutBounce(x) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1)       return n1 * x * x;
  if (x < 2 / d1)       return n1 * (x -= 1.5  / d1) * x + 0.750;
  if (x < 2.5 / d1)     return n1 * (x -= 2.25 / d1) * x + 0.9375;
                         return n1 * (x -= 2.625/ d1) * x + 0.984375;
}

export class GameOverScreen {
  /** @param {Function} onRestart */
  constructor(onRestart) {
    this._onRestart   = onRestart;
    this._elapsed     = 0;
    this._letterDefs  = null;  // lazy-init beim ersten draw() (benötigt ctx für measureText)
    this._particles   = [];
    this._stingPlayed = false;
    this._glowElapsed = -1;    // < 0 = Glow noch nicht gestartet

    // Sting sofort vorladen, damit er beim ersten Tod ohne Verzögerung abspielbar ist
    this._stingEl         = new Audio(STING_SRC);
    this._stingEl.preload = 'auto';
    this._stingEl.loop    = false;
  }

  /**
   * Startet (oder startet neu) die Animation.
   * Wird vom GameManager beim Übergang in GAMEOVER aufgerufen.
   */
  show() {
    this._elapsed     = 0;
    this._letterDefs  = null;
    this._particles   = this._spawnParticles(PARTICLE_MAX);
    this._stingPlayed = false;
    this._glowElapsed = -1;
  }

  /**
   * Zustand pro Frame aktualisieren (muss im GAMEOVER-Update-Zweig aufgerufen werden).
   * @param {number} dt  Deltazeit in Sekunden
   */
  update(dt) {
    this._elapsed += dt;

    // Partikel bewegen + Partikel nachlegen
    for (const p of this._particles) {
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
      p.vy  -= 14 * dt;  // leichter Auftrieb
      p.life -= dt;
    }
    this._particles = this._particles.filter(p => p.life > 0);
    if (this._particles.length < PARTICLE_MAX * 0.55 && Math.random() < 0.25) {
      this._particles.push(...this._spawnParticles(4));
    }

    // Glow-Sweep nach dem letzten gelandeten Buchstaben starten
    const allLandTime = (('GAME OVER'.length - 1) * STAGGER) + FALL_DURATION;
    if (this._elapsed >= allLandTime && this._glowElapsed < 0) {
      this._glowElapsed = 0;
    }
    if (this._glowElapsed >= 0) {
      this._glowElapsed += dt;
    }
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (input.jumpPressed || input.enterPressed || input.escPressed) {
      this._onRestart();
    }
  }

  /**
   * Game-Over-Screen vollständig zeichnen.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // ── 1 · Dunkler Hintergrund ──────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg.addColorStop(0, '#0e0b1a');
    bg.addColorStop(1, '#06030a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Radiale Vignette
    const vig = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.14,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.80,
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ── 2 · Partikel ─────────────────────────────────────────────────────────
    this._drawParticles(ctx);

    // ── 3 · "GAME OVER" Buchstaben-Drop-Animation ────────────────────────────
    if (!this._letterDefs) {
      this._initLetterDefs(ctx);
    }
    this._drawLetters(ctx);

    // ── 4 · Glow-Sweep (einmalig nach dem Landen) ────────────────────────────
    if (this._glowElapsed >= 0 && this._glowElapsed < SWEEP_DURATION) {
      this._drawGlowSweep(ctx);
    }

    // ── 5 · Hilfstext (blendet nach dem Landen ein) ───────────────────────────
    const allLandTime = (('GAME OVER'.length - 1) * STAGGER) + FALL_DURATION;
    const hintStart   = allLandTime + 0.55;
    if (this._elapsed > hintStart) {
      const alpha = Math.min((this._elapsed - hintStart) / 0.65, 1);
      this._drawHintText(ctx, alpha);
    }
  }

  // ─── Interne Hilfsmethoden ───────────────────────────────────────────────────

  /**
   * Berechnet die x-Positionen jedes Buchstabens so, dass "GAME OVER"
   * als ganzes horizontal zentriert ist.  Muss ctx für measureText haben.
   * @param {CanvasRenderingContext2D} ctx
   */
  _initLetterDefs(ctx) {
    ctx.save();
    ctx.font         = FONT_MAIN;
    ctx.textBaseline = 'alphabetic';

    const chars      = 'GAME OVER'.split('');
    const finalY     = Math.round(CANVAS_HEIGHT * TITLE_Y_FRAC);
    const charWidths = chars.map(c => ctx.measureText(c).width);
    const totalW     = charWidths.reduce((s, w) => s + w, 0) + CHAR_GAP * (chars.length - 1);
    let   curX       = CANVAS_WIDTH / 2 - totalW / 2;

    this._letterDefs = chars.map((char, i) => {
      const w  = charWidths[i];
      const lx = curX;
      curX += w + CHAR_GAP;
      return {
        char,
        x:      lx,          // linke Kante (weil textAlign='left')
        finalY,
        startY: finalY + START_OFFSET,
        delay:  i * STAGGER,
      };
    });

    ctx.restore();

    // Sting sofort nach dem ersten Draw abspielen
    if (!this._stingPlayed) {
      this._stingPlayed         = true;
      this._stingEl.volume      = Math.min(1, Math.max(0.3, audioManager.musicVolume));
      this._stingEl.currentTime = 0;
      this._stingEl.play().catch(() => {});
    }
  }

  /** Zeichnet alle Buchstaben an ihrer aktuellen (animierten) Position. */
  _drawLetters(ctx) {
    ctx.save();
    ctx.font         = FONT_MAIN;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';

    for (const def of this._letterDefs) {
      const localTime = this._elapsed - def.delay;

      // Buchstabe noch nicht gestartet → überspringen (nicht oberhalb zeichnen)
      if (localTime <= 0) continue;

      const tNorm = Math.min(localTime / FALL_DURATION, 1.0);
      const curY  = def.startY + (def.finalY - def.startY) * easeOutBounce(tNorm);

      // Tiefer Glow-Pass
      ctx.shadowColor = 'rgba(240,192,0,0.75)';
      ctx.shadowBlur  = 20;
      ctx.fillStyle   = '#f0c040';
      ctx.fillText(def.char, def.x, curY);

      // Zweiter Pass: helles Zentrum für Tiefenwirkung
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = '#fff4a8';
      ctx.fillText(def.char, def.x, curY);
    }

    ctx.restore();
  }

  /** Horizontaler Glow-Sweep der einmalig von links nach rechts gleitet. */
  _drawGlowSweep(ctx) {
    const t    = this._glowElapsed / SWEEP_DURATION;
    const posX = -80 + (CANVAS_WIDTH + 160) * t;

    const grd = ctx.createLinearGradient(posX - 70, 0, posX + 70, 0);
    grd.addColorStop(0,   'rgba(255,240,160,0)');
    grd.addColorStop(0.5, 'rgba(255,240,160,0.20)');
    grd.addColorStop(1,   'rgba(255,240,160,0)');

    // Bereich einschränken auf die Buchstabenhöhe
    const def0    = this._letterDefs[0];
    const textTop = def0.finalY - 56;
    const textH   = 64;

    ctx.fillStyle = grd;
    ctx.fillRect(posX - 70, textTop, 140, textH);
  }

  /**
   * Kleiner Hilfstext (Neustart-Hinweis) mit einblenden.
   * @param {number} alpha  0..1
   */
  _drawHintText(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.font         = FONT_HINT;
    ctx.fillStyle    = '#b8a880';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const def0 = this._letterDefs[0];
    ctx.fillText(t('retryHint'), CANVAS_WIDTH / 2, def0.finalY + 52);
    ctx.restore();
  }

  /** Zeichnet alle Partikel. */
  _drawParticles(ctx) {
    ctx.save();
    for (const p of this._particles) {
      const alpha = Math.max(p.life / p.maxLife, 0) * 0.65;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Erzeugt goldene/bernsteinfarbene Partikel.
   * @param {number} count
   * @returns {Array}
   */
  _spawnParticles(count) {
    const list = [];
    for (let i = 0; i < count; i++) {
      const life = 2.8 + Math.random() * 3.2;
      list.push({
        x:       Math.random() * CANVAS_WIDTH,
        y:       CANVAS_HEIGHT * 0.18 + Math.random() * CANVAS_HEIGHT * 0.68,
        vx:      (Math.random() - 0.5) * 16,
        vy:      (Math.random() - 0.5) * 10,
        r:       0.8 + Math.random() * 2.4,
        life,
        maxLife: life,
        color:   Math.random() < 0.55 ? '#f0c040' : '#a06020',
      });
    }
    return list;
  }
}
