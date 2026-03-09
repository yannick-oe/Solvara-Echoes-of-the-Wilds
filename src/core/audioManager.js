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
    /** Aktives Fade-Intervall (null = kein Fade läuft). */
    this._fadeInterval = null;

    /** Master-Lautstärke (0.0–1.0) – übergeordneter Regler für alles. */
    this.masterVolume    = 1.0;
    /** Musik-Kanal-Lautstärke (0.0–1.0). */
    this.musicVolume     = 0.8;
    /** SFX-Kanal-Lautstärke (0.0–1.0). */
    this.sfxVolumeMaster = 0.6;

    /** Ob Musik generell aktiviert ist. */
    this.musicEnabled = true;
    /** Ob SFX generell aktiviert sind. */
    this.sfxEnabled   = true;

    /** Laufende Loop-SFX nach Key. @type {Map<string, HTMLAudioElement>} */
    this._loopedSfx = new Map();

    // Gespeicherte Einstellungen laden (überschreibt ggf. die Defaults)
    this._loadSettings();
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
   * Sanft auf Lautstärke 0 ausblenden und Musik dann stoppen.
   * Wird beim Spielertod aufgerufen (200–400 ms).
   * @param {number} durationMs
   */
  fadeOutMusic(durationMs) {
    this._cancelFade();
    if (!this._musicEl) return;
    const steps    = 16;
    const stepMs   = Math.max(10, Math.round(durationMs / steps));
    const startVol = this._musicEl.volume;
    let   step     = 0;
    this._fadeInterval = setInterval(() => {
      step++;
      if (!this._musicEl) { this._cancelFade(); return; }
      this._musicEl.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        this.stopMusic();
      }
    }, stepMs);
  }

  /**
   * Laufendes Fade abbrechen und Lautstärke wiederherstellen.
   * Wird automatisch von playMusic() aufgerufen.
   */
  _cancelFade() {
    if (this._fadeInterval !== null) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
      if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    }
  }

  /**
   * Berechnete Endlautstärke für Musik: masterVolume × musicVolume, max 1.0.
   * @returns {number}
   */
  get _musicFinalVol() {
    return Math.min(1.0, this.masterVolume * this.musicVolume);
  }

  /**
   * Master-Lautstärke ändern (0.0–1.0). Betrifft sofort Musik und künftige SFX.
   * @param {number} value
   */
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

  /**
   * Musik-Kanal-Lautstärke ändern (0.0–1.0).
   * @param {number} value
   */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

  /**
   * SFX-Kanal-Lautstärke ändern (0.0–1.0).
   * @param {number} value
   */
  setSfxVolumeMaster(value) {
    this.sfxVolumeMaster = Math.max(0, Math.min(1, value));
    this._saveSettings();
  }

  /**
   * Lautstärke-Einstellungen aus localStorage laden.
   * Existierende Werte überschreiben die Defaults; fehlende Werte bleiben beim Default.
   */
  _loadSettings() {
    try {
      const raw = localStorage.getItem('solvaraAudioSettings');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.masterVolume    === 'number')  this.masterVolume    = Math.max(0, Math.min(1, s.masterVolume));
      if (typeof s.musicVolume     === 'number')  this.musicVolume     = Math.max(0, Math.min(1, s.musicVolume));
      if (typeof s.sfxVolumeMaster === 'number')  this.sfxVolumeMaster = Math.max(0, Math.min(1, s.sfxVolumeMaster));
      if (typeof s.musicEnabled    === 'boolean') this.musicEnabled    = s.musicEnabled;
      if (typeof s.sfxEnabled      === 'boolean') this.sfxEnabled      = s.sfxEnabled;
    } catch {}
  }

  /**
   * Aktuelle Lautstärke-Einstellungen in localStorage sichern.
   */
  _saveSettings() {
    try {
      localStorage.setItem('solvaraAudioSettings', JSON.stringify({
        masterVolume:    this.masterVolume,
        musicVolume:     this.musicVolume,
        sfxVolumeMaster: this.sfxVolumeMaster,
        musicEnabled:    this.musicEnabled,
        sfxEnabled:      this.sfxEnabled,
      }));
    } catch {}
  }

  /**
   * Startet einen Musik-Track (OGG).
   * Tut nichts, wenn dieselbe Quelle bereits läuft.
   * Setzt ein vorgeladenes (paused) Element fort, statt es neu zu erstellen.
   * Wechselt sauber, wenn eine andere Quelle angefordert wird.
   * @param {string} oggSrc
   */
  playMusic(oggSrc) {
    this._cancelFade();  // laufendes Fade sofort abbrechen
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
    audio.volume   = this._musicFinalVol;
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
    audio.volume  = this._musicFinalVol;
    this._musicSrc = src;
    this._musicEl  = audio;
  }

  /** Stoppt die laufende Musik sofort und verwirft das Element. */
  stopMusic() {
    if (this._fadeInterval !== null) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
    if (!this._musicEl) return;
    this._musicEl.pause();
    this._musicEl.src = '';
    this._musicEl  = null;
    this._musicSrc = null;
  }

  /**
   * Spielt einen einmaligen, nicht-loopenden Audio-Sting (z.B. Victory-Jingle).
   * Verwendet die Musik-Lautstärke und respektiert musicEnabled.
   * Das Element wird nicht in _musicEl/_musicSrc verfolgt.
   * @param {string} src
   */
  playSting(src) {
    if (!this.musicEnabled) return;
    this.stopMusic();
    const audio = new Audio(src);
    audio.loop   = false;
    audio.volume = this._musicFinalVol;
    audio.play().catch(() => {});
  }

  /**
   * Spielt einen einmaligen SFX-Clip.
   * Lautstärke-Hierarchie: MASTER × SFX-KANAL × individuelle Balance (aus SFX_VOLUME).
   * @param {string} src
   * @param {{ volume?: number }} [options]  Individuelle SFX-Balance aus SFX_VOLUME (0.0–1.5)
   */
  playSfx(src, options) {
    if (!this.sfxEnabled) return;
    const audio  = new Audio(src);
    const sfxBal = options?.volume !== undefined
      ? Math.min(1.5, Math.max(0, options.volume))
      : 1.0;
    audio.volume = Math.min(1.0, this.masterVolume * this.sfxVolumeMaster * sfxBal);
    audio.play().catch(() => {});
  }

  /**
   * Startet einen dauerhaft loopenden SFX-Clip unter einem frei wählbaren Key.
   * Ein vorher laufender Clip mit demselben Key wird automatisch gestoppt.
   * @param {string} key  Eindeutiger Bezeichner (z. B. 'roll')
   * @param {string} src  Pfad zur Audio-Datei
   */
  playLoopedSfx(key, src) {
    this.stopLoopedSfx(key);
    if (!this.sfxEnabled) return;
    const audio   = new Audio(src);
    audio.loop    = true;
    audio.volume  = Math.min(1.0, this.masterVolume * this.sfxVolumeMaster);
    audio.play().catch(() => {});
    this._loopedSfx.set(key, audio);
  }

  /**
   * Stoppt und entfernt einen loopenden SFX-Clip.
   * @param {string} key
   */
  stopLoopedSfx(key) {
    const audio = this._loopedSfx.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this._loopedSfx.delete(key);
    }
  }
}

export const audioManager = new AudioManager();
