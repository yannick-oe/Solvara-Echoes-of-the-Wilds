import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';

export class StartScreen {
  /** @param {Function} onStart  Callback wenn Spieler startet */
  constructor(onStart) {
    this._onStart = onStart;
    this._started = false;
  }

  /** Verhindert Doppelauslösung egal ob via Space oder Enter. */
  _start() {
    if (this._started) return;
    this._started = true;
    this._onStart();
  }

  /** Beim Zurückkehren zum Startbildschirm: Zustand zurücksetzen. */
  reset() {
    this._started = false;
  }

  draw(ctx) {
    const cx = CANVAS_WIDTH  / 2;
    const cy = CANVAS_HEIGHT / 2;

    // --- Hintergrund ---
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dekorativer Rahmen
    ctx.strokeStyle = '#2a5a28';
    ctx.lineWidth   = 2;
    ctx.strokeRect(24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48);

    // --- Obere Zierlinie ---
    ctx.fillStyle = '#2a5a28';
    ctx.fillRect(cx - 220, cy - 115, 440, 2);

    // --- Haupttitel ---
    ctx.fillStyle    = '#f0c040';
    ctx.font         = 'bold 42px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Solvara', cx, cy - 72);

    // --- Untertitel ---
    ctx.fillStyle = '#a8d8a8';
    ctx.font      = '20px serif';
    ctx.fillText('Echoes of the Wilds', cx, cy - 28);

    // --- Untere Zierlinie ---
    ctx.fillStyle = '#2a5a28';
    ctx.fillRect(cx - 220, cy + 2, 440, 2);

    // --- Start-Hinweis ---
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 15px monospace';
    ctx.fillText('Press  Space  or  Enter  to  Start', cx, cy + 58);

    // --- Steuerungshinweis ---
    ctx.fillStyle = '#4a6a4a';
    ctx.font      = '12px monospace';
    ctx.fillText('Move: Arrow Keys / WASD     Jump: Space / W / Arrow Up', cx, cy + 120);
  }

  /** @param {import('../../core/input.js').InputManager} input */
  handleInput(input) {
    if (input.jumpPressed || input.enterPressed) this._start();
  }
}
