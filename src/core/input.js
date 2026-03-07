class InputManager {
  constructor() {
    this.left         = false;
    this.right        = false;
    this.jump         = false;
    this.jumpPressed  = false;  // nur im Frame des Tastendrucks true
    this.down         = false;
    this.up           = false;
    this.escPressed   = false;  // nur im Frame des ersten ESC-Tastendrucks true

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
    this.jumpPressed = false;
    this.escPressed  = false;
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
      case 'ArrowDown': case 'KeyS':
        this.down  = value;
        break;
      case 'Escape':
        // escPressed nur beim Niederdrücken setzen (value===true), nicht beim Loslassen
        if (value) this.escPressed = true;
        break;
    }
  }
}

export const inputManager = new InputManager();

