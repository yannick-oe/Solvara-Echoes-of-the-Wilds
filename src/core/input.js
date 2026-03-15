class InputManager {
  constructor() {
    this.left          = false;
    this.right         = false;
    this.jump          = false;
    this.jumpPressed   = false;  // nur im Frame des Tastendrucks true
    this.enterPressed  = false;  // nur im Frame des Enter-Tastendrucks true
    this.down          = false;
    this.up            = false;
    this.lookUp        = false;
    this.escPressed    = false;  // nur im Frame des ersten ESC-Tastendrucks true (ungenutzt in Spiellogik)
    this.pausePressed  = false;  // nur im Frame des P-Tastendrucks true
    this.fullscreenPressed = false;  // nur im Frame des F-Tastendrucks true
    this.backPressed   = false;  // nur im Frame des Q-Tastendrucks true (Untermenü verlassen)

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp   = this._onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

  /** Setzt frame-basierte Einmal-Flags zurück. Wird am Ende jedes update() aufgerufen. */
  resetFrameState() {
    this.jumpPressed  = false;
    this.enterPressed = false;
    this.escPressed   = false;
    this.pausePressed = false;
    this.fullscreenPressed = false;
    this.backPressed  = false;
  }

  /** Erlaubt TouchControls, Aktionen direkt zu setzen. */
  setTouch(action, value) {
    if (action === 'jump' && value && !this.jump) {
      this.jumpPressed = true;
    }
    this[action] = value;
  }

  _onKeyDown(e) {
    // Seitenscrollen durch Pfeiltasten und Space verhindern
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this._apply(e.code, true);
  }

  _onKeyUp(e) { this._apply(e.code, false); }

  _apply(code, value) {
    switch (code) {
      case 'ArrowLeft':  case 'KeyA':
        this.left  = value;
        break;
      case 'ArrowRight': case 'KeyD':
        this.right = value;
        break;
      case 'Space':
        if (value && !this.jump) this.jumpPressed = true;
        this.jump = value;
        break;
      case 'ArrowUp': case 'KeyW':
        this.up = value;
        break;
      case 'KeyE':
        this.lookUp = value;
        break;
      case 'ArrowDown': case 'KeyS':
        this.down  = value;
        break;
      case 'Enter': case 'NumpadEnter':
        if (value) this.enterPressed = true;
        break;
      case 'Escape':
        // escPressed wird vom Spiel nicht mehr für Pause/Menü genutzt
        if (value) this.escPressed = true;
        break;
      case 'KeyP':
        if (value) this.pausePressed = true;
        break;
      case 'KeyF':
        if (value) this.fullscreenPressed = true;
        break;
      case 'KeyQ':
        if (value) this.backPressed = true;
        break;
    }
  }
}

export const inputManager = new InputManager();

