/**
 * Minimaler Audio-Manager für Musik und einmalige SFX.
 * Hält genau ein laufendes Musik-Element vor.
 */
class AudioManager {
  constructor() {
    /** @type {HTMLAudioElement|null} */
    this._musicEl = null;

    /** Ob Musik generell aktiviert ist. */
    this.musicEnabled = true;
    /** Ob SFX generell aktiviert sind. */
    this.sfxEnabled   = true;
  }

  /**
   * Musik ein-/ausschalten. Stoppt laufende Musik wenn deaktiviert.
   * @param {boolean} enabled
   */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this._musicEl?.pause();
    } else if (this._musicEl) {
      this._musicEl.play().catch(() => {});
    }
  }

  /**
   * Startet Levelmusik – tut nichts wenn bereits dieselbe Quelle läuft oder Musik aus ist.
   * Bevorzugt .ogg, fällt auf .mp3 zurück.
   * @param {string} oggSrc
   * @param {string} [mp3Src]
   */
  playMusic(oggSrc, mp3Src) {
    if (!this.musicEnabled) return;
    // Bereits aktiv → nicht neu starten
    if (this._musicEl && !this._musicEl.paused) return;

    // Wenn Musik-Element bereits existiert (war pausiert), weiterspielen
    if (this._musicEl && this._musicEl.paused) {
      this._musicEl.play().catch(() => {});
      return;
    }

    const audio = new Audio();
    audio.loop  = true;

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
    audio.play().catch(() => {});
  }

  /** Stoppt die laufende Musik sofort und verwirft das Element. */
  stopMusic() {
    if (!this._musicEl) return;
    this._musicEl.pause();
    this._musicEl.currentTime = 0;
    this._musicEl = null;
  }

  /**
   * Spielt einen einmaligen SFX-Clip.
   * @param {string} src
   */
  playSfx(src) {
    if (!this.sfxEnabled) return;
    const audio = new Audio(src);
    audio.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();
