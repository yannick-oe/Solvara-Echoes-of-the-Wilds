// #region Helpers
/**
 * Returns true on touch-primary devices (Android/iOS mobile, tablet).
 * Used only for default audio volume calibration; saved settings override this.
 */
function _isMobileDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
// #endregion

// #region Class Definition
class AudioManager {
  /**
   * Creates a new instance.
   */
  constructor() {
    this._musicEl  = null;
    this._musicSrc = null;
    this._fadeInterval = null;
    this._deferredMusicSrc = null;
    this.masterVolume    = 0.7;
    this.musicVolume     = 0.8;
    this.sfxVolumeMaster = _isMobileDevice() ? 0.24 : 0.6;
    this.musicEnabled = true;
    this.sfxEnabled   = true;
    this._loopedSfx = new Map();
    this._loadSettings();
    this._initAudioUnlock();
  }

  /**
   * Registers persistent touch/pointer listeners to unlock and play deferred music.
   * Unlike one-time listeners, this persists to catch NEW music play attempts.
   */
  _initAudioUnlock() {
    const handler = () => this._handleAudioGesture();
    document.addEventListener('touchstart',  handler, { capture: true, passive: true });
    document.addEventListener('pointerdown', handler, { capture: true, passive: true });
  }

  /**
   * Handles audio unlock when user gesture fires.
   * Plays deferred music if one was flagged, or resumes existing music.
   */
  _handleAudioGesture() {
    if (this._deferredMusicSrc) {
      this.playMusic(this._deferredMusicSrc);
      this._deferredMusicSrc = null;
    } else if (this._musicEl && this._musicEl.paused && this.musicEnabled) {
      this._musicEl.play().catch(() => {});
    }
  }

  /**
   * Handles set music enabled.
   * @param {boolean} enabled Input parameter.
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
   * Handles fade out music.
   * @param {number} durationMs Input parameter.
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
   * Handles cancel fade.
   */
  _cancelFade() {
    if (this._fadeInterval !== null) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
      if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    }
  }

  /**
   * Gets music final vol.
   */
  get _musicFinalVol() {
    return Math.min(1.0, this.masterVolume * this.musicVolume);
  }

  /**
   * Handles set master volume.
   * @param {number} value Input parameter.
   */
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

  /**
   * Handles set music volume.
   * @param {number} value Input parameter.
   */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

  /**
   * Handles set sfx volume master.
   * @param {number} value Input parameter.
   */
  setSfxVolumeMaster(value) {
    this.sfxVolumeMaster = Math.max(0, Math.min(1, value));
    this._saveSettings();
  }

  /**
   * Handles load settings.
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
   * Handles save settings.
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
   * Handles play music.
   * On mobile with no user gesture context, defers play to next gesture.
   * @param {string} oggSrc Input parameter.
   */
  playMusic(oggSrc) {
    this._cancelFade();
    if (!this.musicEnabled) return;
    if (this._musicSrc === oggSrc && this._musicEl && !this._musicEl.paused) return;
    if (this._musicSrc === oggSrc && this._musicEl) {
      this._musicEl.play().catch(() => {});
      return;
    }
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
    const playResult = audio.play().catch(() => null);
    if (playResult === undefined || (playResult && playResult.catch)) {
      this._deferredMusicSrc = oggSrc;
    }
  }

  /**
   * Handles preload music.
   * @param {string} src Input parameter.
   */
  preloadMusic(src) {
    if (this._musicSrc === src && this._musicEl) return;
    if (this._musicEl) { this._musicEl.pause(); this._musicEl.src = ''; }
    const audio   = new Audio(src);
    audio.preload = 'auto';
    audio.loop    = true;
    audio.volume  = this._musicFinalVol;
    this._musicSrc = src;
    this._musicEl  = audio;
  }

  /**
   * Handles stop music.
   */
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
   * Handles play sting.
   * @param {string} src Input parameter.
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
   * Handles play sfx.
   * @param {string} src Input parameter.
   * @param {object} options Input parameter.
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
   * Handles play looped sfx.
   * @param {string} key Input parameter.
   * @param {string} src Input parameter.
   * @param {object} options Input parameter.
   */
  playLoopedSfx(key, src, options) {
    this.stopLoopedSfx(key);
    if (!this.sfxEnabled) return;
    const sfxBal = options?.volume !== undefined
      ? Math.min(1.5, Math.max(0, options.volume))
      : 1.0;
    const audio   = new Audio(src);
    audio.loop    = true;
    audio.volume  = Math.min(1.0, this.masterVolume * this.sfxVolumeMaster * sfxBal);
    audio.play().catch(() => {});
    this._loopedSfx.set(key, audio);
  }

  /**
   * Handles stop looped sfx.
   * @param {string} key Input parameter.
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
// #endregion