/**
 * Minimaler Audio-Manager für Musik und einmalige SFX.
 * Hält genau ein laufendes Musik-Element vor.
 * Verwendet ausschließlich OGG – kein MP3-Fallback.
 */
class AudioManager {
  constructor() {
    /** @type {HTMLAudioElement|null} */
    this._musicEl  = null;
    /** Aktuell geladene Quelle, um unnötige Neustarts zu vermeiden. */
    this._musicSrc = null;

    /** Lautstärke für Musik (0.0–1.0). */
    this.musicVolume = 0.8;
    /** Lautstärke für SFX (0.0–1.0). */
    this.sfxVolume   = 1.0;

    /** Ob Musik generell aktiviert ist. */
    this.musicEnabled = true;
    /** Ob SFX generell aktiviert sind. */
    this.sfxEnabled   = true;
  }

  /**
   * Musik ein-/ausschalten.
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
   * Musik-Lautstärke ändern (0.0–1.0).
   * @param {number} value
   */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this.musicVolume;
  }

  /**
   * SFX-Lautstärke ändern (0.0–1.0).
   * @param {number} value
   */
  setSfxVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, value));
  }

  /**
   * Startet einen Musik-Track (OGG).
   * Tut nichts, wenn dieselbe Quelle bereits läuft.
   * Setzt ein vorgeladenes (paused) Element fort, statt es neu zu erstellen.
   * Wechselt sauber, wenn eine andere Quelle angefordert wird.
   * @param {string} oggSrc
   */
  playMusic(oggSrc) {
    if (!this.musicEnabled) return;

    // Selbe Quelle läuft bereits → nichts tun
    if (this._musicSrc === oggSrc && this._musicEl && !this._musicEl.paused) return;

    // Selbe Quelle vorgeladen (paused) → einfach fortsetzen
    if (this._musicSrc === oggSrc && this._musicEl) {
      this._musicEl.play().catch(() => {});
      return;
    }

    // Anderen Track stoppen
    if (this._musicEl) {
      this._musicEl.pause();
      this._musicEl.src = '';
      this._musicEl = null;
    }

    this._musicSrc = oggSrc;
    const audio    = new Audio(oggSrc);
    audio.loop     = true;
    audio.volume   = this.musicVolume;
    this._musicEl  = audio;
    audio.play().catch(() => {});
  }

  /**
   * Lädt einen Musik-Track vor, ohne ihn abzuspielen.
   * Ermöglicht verzögerungsfreies Starten beim ersten playMusic()-Aufruf.
   * @param {string} src
   */
  preloadMusic(src) {
    if (this._musicSrc === src && this._musicEl) return; // bereits geladen
    if (this._musicEl) { this._musicEl.pause(); this._musicEl.src = ''; }
    const audio   = new Audio(src);
    audio.preload = 'auto';
    audio.loop    = true;
    audio.volume  = this.musicVolume;
    this._musicSrc = src;
    this._musicEl  = audio;
  }

  /** Stoppt die laufende Musik sofort und verwirft das Element. */
  stopMusic() {
    if (!this._musicEl) return;
    this._musicEl.pause();
    this._musicEl.src = '';
    this._musicEl  = null;
    this._musicSrc = null;
  }

  /**
   * Spielt einen einmaligen SFX-Clip.
   * @param {string} src
   */
  playSfx(src) {
    if (!this.sfxEnabled) return;
    const audio = new Audio(src);
    audio.volume = this.sfxVolume;
    audio.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();
