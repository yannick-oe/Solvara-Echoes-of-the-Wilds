/**
 * Minimaler Audio-Manager für Musik und einmalige SFX.
 * Hält genau ein laufendes Musik-Element vor.
 */
class AudioManager {
  constructor() {
    /** @type {HTMLAudioElement|null} */
    this._musicEl = null;
  }

  /**
   * Startet Levelmusik – tut nichts wenn bereits dieselbe Quelle läuft.
   * Bevorzugt .ogg, fällt auf .mp3 zurück.
   * @param {string} oggSrc
   * @param {string} [mp3Src]
   */
  playMusic(oggSrc, mp3Src) {
    // Bereits aktiv → nicht neu starten
    if (this._musicEl && !this._musicEl.paused) return;

    const audio = new Audio();
    audio.loop  = true;

    // Quellen mit Format-Fallback
    const sourceOgg = document.createElement('source');
    sourceOgg.src   = oggSrc;
    sourceOgg.type  = 'audio/ogg';
    audio.appendChild(sourceOgg);

    if (mp3Src) {
      const sourceMp3 = document.createElement('source');
      sourceMp3.src   = mp3Src;
      sourceMp3.type  = 'audio/mpeg';
      audio.appendChild(sourceMp3);
    }

    this._musicEl = audio;
    // play() gibt ein Promise zurück – ignorieren wir stille Fehler
    audio.play().catch(() => {});
  }

  /** Stoppt die laufende Musik sofort. */
  stopMusic() {
    if (!this._musicEl) return;
    this._musicEl.pause();
    this._musicEl.currentTime = 0;
    this._musicEl = null;
  }

  /**
   * Spielt einen einmaligen SFX-Clip.
   * Jeder Aufruf erzeugt eine eigene Audio-Instanz → mehrfach überlappend spielbar.
   * @param {string} src
   */
  playSfx(src) {
    const audio = new Audio(src);
    audio.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();
