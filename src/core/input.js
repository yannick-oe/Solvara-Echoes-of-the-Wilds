// #region Class Definition
class InputManager {
  /**
   * Creates a new instance.
   */
  constructor() {
    this.left          = false;
    this.right         = false;
    this.jump          = false;
    this.jumpPressed   = false;
    this.enterPressed  = false;
    this.down          = false;
    this.up            = false;
    this.lookUp        = false;
    this.escPressed    = false;
    this.pausePressed  = false;
    this.fullscreenPressed = false;
    this.backPressed   = false;
    this.rollPressed   = false;
    this.mobileUpActive = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp   = this._onKeyUp.bind(this);
  }

  /**
   * Handles init.
   */
  init() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  /**
   * Handles destroy.
   */
  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

  /**
   * Handles reset frame state.
   */
  resetFrameState() {
    this.jumpPressed  = false;
    this.enterPressed = false;
    this.escPressed   = false;
    this.pausePressed = false;
    this.fullscreenPressed = false;
    this.backPressed  = false;
    this.rollPressed  = false;
  }

  /**
   * Handles set touch.
   * @param {object} action Input parameter.
   * @param {number} value Input parameter.
   */
  setTouch(action, value) {
    if (action === 'jump' && value && !this.jump) {
      this.jumpPressed = true;
    }
    if (action === 'rollPressed') {
      if (value) this.rollPressed = true;
      return;
    }
    this[action] = value;
  }

  /**
   * Handles on key down.
   * @param {object} e Input parameter.
   */
  _onKeyDown(e) {

    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this._apply(e.code, true);
  }

  /**
   * Handles on key up.
   * @param {object} e Input parameter.
   */
  _onKeyUp(e) { this._apply(e.code, false); }

  /**
   * Handles apply.
   * @param {string} code Input parameter.
   * @param {number} value Input parameter.
   */
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
      case 'KeyM':
        if (value) this.rollPressed = true;
        break;
    }
  }
}
export const inputManager = new InputManager();
// #endregion