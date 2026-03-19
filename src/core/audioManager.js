// #region Imports
import { getMusicTrack, getSfxTrack } from '../config/audioConfig.js';
// #endregion
// #region Defaults
const DEFAULT_MASTER_VOLUME = 0.6;
const DEFAULT_MUSIC_VOLUME = 0.6;
const DEFAULT_SFX_VOLUME = 0.4;
// #endregion
// #region Class Definition
class AudioManager {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {
    this._initPlaybackState();
    this._initVolumeState();
    this._initAudioCollections();
    this._loadSettings();
    this._initAudioUnlock();
  }
/** Handles init Playback State. @returns {void} - Nothing. */
  _initPlaybackState() {
    this._musicEl = null;
    this._musicSrc = null;
    this._musicBalance = 1;
    this._fadeInterval = null;
    this._deferredMusicSrc = null;
  }
/** Handles init Volume State. @returns {void} - Nothing. */
  _initVolumeState() {
    this.masterVolume = DEFAULT_MASTER_VOLUME;
    this.musicVolume = DEFAULT_MUSIC_VOLUME;
    this.sfxVolumeMaster = DEFAULT_SFX_VOLUME;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this._lastNonZeroMasterVolume = DEFAULT_MASTER_VOLUME;
  }
/** Handles init Audio Collections. @returns {void} - Nothing. */
  _initAudioCollections() {
    this._activeTransient = new Set();
    this._loopedSfx = new Map();
    this._configuredSfxPlayTimes = new Map();
    this._uiListeners = new Set();
  }
/** Handles init Audio Unlock. @returns {void} - Nothing. */
  _initAudioUnlock() {
    const handler = () => this._handleAudioGesture();
    document.addEventListener('touchstart',  handler, { capture: true, passive: true });
    document.addEventListener('pointerdown', handler, { capture: true, passive: true });
  }

/** Handles audio Gesture. @returns {void} - Nothing. */
  _handleAudioGesture() {
    if (this._deferredMusicSrc && this._musicEl) {
      this._deferredMusicSrc = null;
      this._musicEl.play().catch(() => {});
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
    this._emitUiChange();
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
    return this._effectiveMusicVolume(this._musicBalance ?? 1);
  }

/** Sets master Volume. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setMasterVolume(value) {
    const nextVolume = Math.max(0, Math.min(1, value));
    if (nextVolume > 0) this._lastNonZeroMasterVolume = nextVolume;
    this.masterVolume = nextVolume;
    this._syncRunningAudioVolumes();
    this._saveSettings();
    this._emitUiChange();
  }
/** Sets music Volume. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    this._syncRunningAudioVolumes();
    this._saveSettings();
    this._emitUiChange();
  }
/** Sets sfx Volume Master. @param {*} value - Value to apply. @returns {void} - Nothing. */
  setSfxVolumeMaster(value) {
    this.sfxVolumeMaster = Math.max(0, Math.min(1, value));
    this._syncRunningAudioVolumes();
    this._saveSettings();
    this._emitUiChange();
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
      if (this.masterVolume > 0) this._lastNonZeroMasterVolume = this.masterVolume;
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
/** Plays music. @param {*} oggSrc - Ogg Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  playMusic(oggSrc, options) {
    const balance = this._resolveSfxBalance(options);
    this._cancelFade();
    if (!this.musicEnabled) return;
    if (this._musicSrc === oggSrc && this._musicEl && !this._musicEl.paused) return;
    if (this._resumeIfSameTrack(oggSrc, balance)) return;
    this._replaceMusicElement(oggSrc, balance);
    this._playCurrentMusicOrDefer(oggSrc);
  }
/** Handles resume If Same Track. @param {*} oggSrc - Ogg Src value. @param {*} balance - Balance value. @returns {boolean} - Whether the check passes. */
  _resumeIfSameTrack(oggSrc, balance) {
    if (this._musicSrc !== oggSrc || !this._musicEl) return false;
    this._musicBalance = balance;
    this._syncRunningAudioVolumes();
    this._musicEl.play().catch(() => {});
    return true;
  }
/** Handles replace Music Element. @param {*} oggSrc - Ogg Src value. @param {*} balance - Balance value. @returns {void} - Nothing. */
  _replaceMusicElement(oggSrc, balance) {
    if (this._musicEl) {
      this._musicEl.pause();
      this._musicEl.src = '';
      this._musicEl = null;
    }
    this._musicSrc = oggSrc;
    this._musicBalance = balance;
    const audio = new Audio(oggSrc);
    audio.loop = true;
    audio.volume = this._musicFinalVol;
    this._musicEl = audio;
  }
/** Checks whether muted. @returns {boolean} - Whether the check passes. */
  isMuted() {
    return this.masterVolume <= 0.0001;
  }

/** Toggles muted. @returns {*} - Resulting value. */
  toggleMuted() {
    if (this.isMuted()) return this.setMasterVolume(this._lastNonZeroMasterVolume);
    this.setMasterVolume(0);
  }
/** Gets ui State. @returns {*} - Resulting value. */
  getUiState() {
    return { muted: this.isMuted(), masterVolume: this.masterVolume };
  }
/** Subscribes. @param {*} listener - Listener value. @returns {*} - Resulting value. */
  subscribe(listener) {
    this._uiListeners.add(listener);
    listener(this.getUiState());
    return () => this._uiListeners.delete(listener);
  }

/** Plays configured music. @param {*} key - Key value. @returns {void} - Nothing. */
  playConfiguredMusic(key) {
    const track = getMusicTrack(key);
    if (track) this.playMusic(track.src, track);
  }

/** Handles preload configured Music. @param {*} key - Key value. @returns {void} - Nothing. */
  preloadConfiguredMusic(key) {
    const track = getMusicTrack(key);
    if (track) this.preloadMusic(track.src, track);
  }

/** Plays configured sting. @param {*} key - Key value. @returns {void} - Nothing. */
  playConfiguredSting(key) {
    const track = getMusicTrack(key);
    if (track) this.playSting(track.src, track);
  }

/** Plays configured sfx. @param {*} key - Key value. @returns {void} - Nothing. */
  playConfiguredSfx(key) {
    const sfx = getSfxTrack(key);
    if (!sfx || !this._canPlayConfiguredSfx(key, sfx)) return;
    this.playSfx(sfx.src, sfx);
  }

/** Plays configured looped Sfx. @param {*} loopKey - Loop Key value. @param {*} sfxKey - Sfx Key value. @returns {void} - Nothing. */
  playConfiguredLoopedSfx(loopKey, sfxKey) {
    const sfx = getSfxTrack(sfxKey);
    if (sfx) this.playLoopedSfx(loopKey, sfx.src, sfx);
  }

/** Plays current Music Or Defer. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  _playCurrentMusicOrDefer(oggSrc) {
    const playResult = this._musicEl.play();
    if (!playResult?.catch) return;
    playResult.then(() => this._clearDeferredMusic(oggSrc)).catch(() => this._deferMusic(oggSrc));
  }

/** Clears deferred Music. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  _clearDeferredMusic(oggSrc) {
    if (this._deferredMusicSrc === oggSrc) this._deferredMusicSrc = null;
  }

/** Handles defer Music. @param {*} oggSrc - Ogg Src value. @returns {void} - Nothing. */
  _deferMusic(oggSrc) {
    this._deferredMusicSrc = oggSrc;
  }

/** Handles preload Music. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  preloadMusic(src, options) {
    const balance = this._resolveSfxBalance(options);
    if (this._musicSrc === src && this._musicEl) return;
    if (this._musicEl) { this._musicEl.pause(); this._musicEl.src = ''; }
    const audio   = new Audio(src);
    audio.preload = 'auto';
    audio.loop    = true;
    this._musicBalance = balance;
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

/** Plays sting. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  playSting(src, options) {
    if (!this.musicEnabled) return;
    this.stopMusic();
    const audio = new Audio(src);
    audio.loop = false;
    this._playTransientAudio(audio, 'music', this._resolveSfxBalance(options));
  }

/** Plays sfx. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  playSfx(src, options) {
    if (!this.sfxEnabled) return;
    const audio = new Audio(src);
    this._playTransientAudio(audio, 'sfx', this._resolveSfxBalance(options));
  }

/** Plays looped Sfx. @param {*} key - Key value. @param {*} src - Src value. @param {*} options - Optional configuration values. @returns {void} - Nothing. */
  playLoopedSfx(key, src, options) {
    this.stopLoopedSfx(key);
    if (!this.sfxEnabled) return;
    const audio = new Audio(src);
    audio.loop = true;
    this._tagAudio(audio, 'sfx', this._resolveSfxBalance(options));
    this._applyTrackedVolume(audio);
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

/** Resolves sfx Balance. @param {*} options - Optional configuration values. @returns {number} - Computed numeric value. */
  _resolveSfxBalance(options) {
    if (options?.volume === undefined) return 1.0;
    return Math.min(1.5, Math.max(0, options.volume));
  }

/** Checks whether can Play Configured Sfx. @param {*} key - Key value. @param {*} sfx - Sfx value. @returns {boolean} - Whether the check passes. */
  _canPlayConfiguredSfx(key, sfx) {
    const cooldown = sfx.cooldownMs ?? 0;
    if (cooldown <= 0) return true;
    const now = performance.now?.() ?? Date.now();
    const last = this._configuredSfxPlayTimes.get(key) ?? -Infinity;
    if (now - last < cooldown) return false;
    this._configuredSfxPlayTimes.set(key, now);
    return true;
  }

/** Plays transient Audio. @param {*} audio - Audio value. @param {*} kind - Kind value. @param {*} balance - Balance value. @returns {void} - Nothing. */
  _playTransientAudio(audio, kind, balance = 1) {
    this._tagAudio(audio, kind, balance);
    this._applyTrackedVolume(audio);
    this._activeTransient.add(audio);
    audio.addEventListener('ended', () => this._activeTransient.delete(audio), { once: true });
    audio.play().catch(() => this._activeTransient.delete(audio));
  }

/** Tags audio. @param {*} audio - Audio value. @param {*} kind - Kind value. @param {*} balance - Balance value. @returns {void} - Nothing. */
  _tagAudio(audio, kind, balance = 1) {
    audio._solvaraKind = kind;
    audio._solvaraBalance = balance;
  }

/** Handles effective Music Volume. @param {*} balance - Balance value. @returns {number} - Computed numeric value. */
  _effectiveMusicVolume(balance) {
    return Math.min(1.0, this.masterVolume * this.musicVolume * balance);
  }

/** Handles effective Sfx Volume. @param {*} balance - Balance value. @returns {number} - Computed numeric value. */
  _effectiveSfxVolume(balance) {
    return Math.min(1.0, this.masterVolume * this.sfxVolumeMaster * balance);
  }

/** Applies tracked Volume. @param {*} audio - Audio value. @returns {void} - Nothing. */
  _applyTrackedVolume(audio) {
    if (audio._solvaraKind === 'music') return void (audio.volume = this._effectiveMusicVolume(audio._solvaraBalance ?? 1));
    audio.volume = this._effectiveSfxVolume(audio._solvaraBalance ?? 1);
  }

/** Handles sync Running Audio Volumes. @returns {void} - Nothing. */
  _syncRunningAudioVolumes() {
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._syncTrackedAudios(this._loopedSfx.values());
    this._syncTrackedAudios(this._activeTransient);
  }

/** Handles sync Tracked Audios. @param {*} audios - Audios value. @returns {void} - Nothing. */
  _syncTrackedAudios(audios) {
    for (const audio of audios) this._applyTrackedVolume(audio);
  }

/** Handles emit Ui Change. @returns {void} - Nothing. */
  _emitUiChange() {
    const state = this.getUiState();
    for (const listener of this._uiListeners) listener(state);
  }
}

export const audioManager = new AudioManager();
// #endregion
