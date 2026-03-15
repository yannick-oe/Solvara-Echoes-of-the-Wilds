class AudioManager {
  constructor() {

    this._musicEl  = null;

    this._musicSrc = null;

    this._fadeInterval = null;


    this.masterVolume    = 1.0;

    this.musicVolume     = 0.8;

    this.sfxVolumeMaster = 0.6;


    this.musicEnabled = true;

    this.sfxEnabled   = true;


    this._loopedSfx = new Map();


    this._loadSettings();
  }



  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this._musicEl?.pause();
    } else if (this._musicEl) {
      this._musicEl.play().catch(() => {});
    }
  }



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



  _cancelFade() {
    if (this._fadeInterval !== null) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
      if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    }
  }



  get _musicFinalVol() {
    return Math.min(1.0, this.masterVolume * this.musicVolume);
  }



  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }



  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this._musicEl) this._musicEl.volume = this._musicFinalVol;
    this._saveSettings();
  }



  setSfxVolumeMaster(value) {
    this.sfxVolumeMaster = Math.max(0, Math.min(1, value));
    this._saveSettings();
  }



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
    audio.play().catch(() => {});
  }



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



  playSting(src) {
    if (!this.musicEnabled) return;
    this.stopMusic();
    const audio = new Audio(src);
    audio.loop   = false;
    audio.volume = this._musicFinalVol;
    audio.play().catch(() => {});
  }



  playSfx(src, options) {
    if (!this.sfxEnabled) return;
    const audio  = new Audio(src);
    const sfxBal = options?.volume !== undefined
      ? Math.min(1.5, Math.max(0, options.volume))
      : 1.0;
    audio.volume = Math.min(1.0, this.masterVolume * this.sfxVolumeMaster * sfxBal);
    audio.play().catch(() => {});
  }



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
