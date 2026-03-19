// #region Helpers
/** Checks whether mobile Device. @returns {boolean} - Whether the check passes. */
function _isMobileDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
// #endregion

// #region Class Definition
class AudioManager {
/** Creates a new instance. @returns {void} - Nothing. */
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

/** Handles init Audio Unlock. @returns {void} - Nothing. */
  _initAudioUnlock() {
    const handler = () => this._handleAudioGesture();
    document.addEventListener('touchstart',  handler, { capture: true, passive: true });
    document.addEventListener('pointerdown', handler, { capture: true, passive: true });
  }

/** Handles audio Gesture. @returns {void} - Nothing. */
  _handleAudioGesture() {
    if (this._deferredMusicSrc) {
      this.playMusic(this._deferredMusicSrc);
      this._deferredMusicSrc = null;
    } else if (this._musicEl && this._musicEl.paused && this.musicEnabled) {
      this._musicEl.play().catch(() => {});
    }
  }

/** Sets music Enabled. @param {*} enabled - Enabled value. @returns {void} - Nothing. */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this._musicEl?.pause();
    } else if (this._musicEl) {
      this._musicEl.play().catch(() => {});
    }
  }

/** Fades out Music. @param {*} durationMs - Duration Ms value. @returns {void} - Nothing. */
  fadeOutMusic(durationMs) {
    this._cancelFade();
    if (!this._musicEl) return;
    const state = this._createFadeState(durationMs);
    this._startFadeInterval(state);
  }

/** Creates fade State. @param {*} durationMs - Duration Ms value. @returns {*} - Resulting value. */
  _createFadeState(durationMs) {
    const steps = 16;
    const stepMs = Math.max(10, Math.round(durationMs / steps));
    return { steps, stepMs, startVol: this._musicEl.volume, step: 0 };
  }

/** Starts fade Interval. @param {*} state - State value. @returns {void} - Nothing. */
  _startFadeInterval(state) {
    this._fadeInterval = setInterval(() => this._runFadeStep(state), state.stepMs);
  }

/** Runs fade Step. @param {*} state - State value. @returns {*} - Resulting value. */
  _runFadeStep(state) {
    state.step++;
    if (!this._musicEl) return this._cancelFade();
    this._musicEl.volume = Math.max(0, state.startVol * (1 - state.step / state.steps));
    if (state.step < state.steps) return;
    clearInterval(this._fadeInterval);
    this._fadeInterval = null;
    this.stopMusic();
  }

/** Checks whether cel Fade. @returns {void} - Nothing. */
  _cancelFade() {
    if (this._fadeInterval !== null) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
      if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    }
  }

/** Gets music Final Vol. @returns {*} - Current value. */
  get _musicFinalVol() {
    return Math.min(1.0, this.masterVolume * this.musicVolume);
  }

/** Sets master Volume. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

/** Sets music Volume. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }

/** Sets sfx Volume Master. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setSfxVolumeMaster(value) {
    this.sfxVolumeMaster = Math.max(0, Math.min(1, value));
    this._saveSettings();
  }

/** Loads settings. @returns {void} - Nothing. */
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

/** Saves settings. @returns {void} - Nothing. */
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

/** Plays music. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  playMusic(oggSrc) {
    this._cancelFade();
    if (!this.musicEnabled) return;
    if (this._musicSrc === oggSrc && this._musicEl && !this._musicEl.paused) return;
    if (this._resumeIfSameTrack(oggSrc)) return;
    this._replaceMusicElement(oggSrc);
    this._playCurrentMusicOrDefer(oggSrc);
  }

/** Handles resume If Same Track. @param {*} oggSrc - Ogg Src value. @returns {boolean} - Whether the check passes. */
  _resumeIfSameTrack(oggSrc) {
    if (this._musicSrc !== oggSrc || !this._musicEl) return false;
    this._musicEl.play().catch(() => {});
    return true;
  }

/** Handles replace Music Element. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  _replaceMusicElement(oggSrc) {
    if (this._musicEl) {
      this._musicEl.pause();
      this._musicEl.src = '';
      this._musicEl = null;
    }
    this._musicSrc = oggSrc;
    const audio = new Audio(oggSrc);
    audio.loop = true;
    audio.volume = this._musicFinalVol;
    this._musicEl = audio;
  }

/** Plays current Music Or Defer. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  _playCurrentMusicOrDefer(oggSrc) {
    const playResult = this._musicEl.play().catch(() => null);
    if (playResult === undefined || (playResult && playResult.catch)) this._deferredMusicSrc = oggSrc;
  }

/** Handles preload Music. @param {*} src - Src value. @returns {void} - Nothing. */
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

/** Stops music. @returns {void} - Nothing. */
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

/** Plays sting. @param {*} src - Src value. @returns {void} - Nothing. */
  playSting(src) {
    if (!this.musicEnabled) return;
    this.stopMusic();
    const audio = new Audio(src);
    audio.loop   = false;
    audio.volume = this._musicFinalVol;
    audio.play().catch(() => {});
  }

/** Plays sfx. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  playSfx(src, options) {
    if (!this.sfxEnabled) return;
    const audio  = new Audio(src);
    const sfxBal = options?.volume !== undefined
      ? Math.min(1.5, Math.max(0, options.volume))
      : 1.0;
    audio.volume = Math.min(1.0, this.masterVolume * this.sfxVolumeMaster * sfxBal);
    audio.play().catch(() => {});
  }

/** Plays looped Sfx. @param {*} key - Key value. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
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

/** Stops looped Sfx. @param {*} key - Key value. @returns {void} - Nothing. */
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