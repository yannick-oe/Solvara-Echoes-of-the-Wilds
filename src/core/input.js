class InputManager {
  constructor() {
    this.left  = false;
    this.right = false;
    this.jump  = false;
    this.down  = false;
    this.up    = false;

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

  _onKeyDown(e) { this._apply(e.code, true); }
  _onKeyUp(e)   { this._apply(e.code, false); }

  _apply(code, value) {
    switch (code) {
      case 'ArrowLeft':  case 'KeyA':                this.left  = value; break;
      case 'ArrowRight': case 'KeyD':                this.right = value; break;
      case 'ArrowUp':    case 'KeyW': case 'Space':  this.jump  = value; break;
      case 'ArrowDown':  case 'KeyS':                this.down  = value; break;
    }
  }
}

export const inputManager = new InputManager();
