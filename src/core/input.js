// #region Class Definition
class InputManager {
  /**
   * Creates a new instance.
   */
  constructor() {
    this._resetStateFlags();
    this._bindHandlers();
  }

  /** Handles reset state flags. */
  _resetStateFlags() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.jumpPressed = false;
    this.enterPressed = false;
    this.down = false;
    this.up = false;
    this.lookUp = false;
    this.escPressed = false;
    this.pausePressed = false;
    this.fullscreenPressed = false;
    this.backPressed = false;
    this.rollPressed = false;
    this.mobileUpActive = false;
  }

  /** Handles bind handlers. */
  _bindHandlers() {
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
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
    if (this._applyHorizontal(code, value)) return;
    if (this._applyVerticalAndLook(code, value)) return;
    if (this._applyJump(code, value)) return;
    this._applySignalKeys(code, value);
  }

  /**
   * Handles apply horizontal movement keys.
   * @param {string} code Input parameter.
   * @param {boolean} value Input parameter.
   */
  _applyHorizontal(code, value) {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.left = value;
      return true;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      this.right = value;
      return true;
    }
    return false;
  }

  /**
   * Handles apply vertical and lookup keys.
   * @param {string} code Input parameter.
   * @param {boolean} value Input parameter.
   */
  _applyVerticalAndLook(code, value) {
    if (code === 'ArrowUp' || code === 'KeyW') {
      this.up = value;
      return true;
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.down = value;
      return true;
    }
    if (code === 'KeyE') this.lookUp = value;
    return code === 'KeyE';
  }

  /**
   * Handles apply jump key.
   * @param {string} code Input parameter.
   * @param {boolean} value Input parameter.
   */
  _applyJump(code, value) {
    if (code !== 'Space') return false;
    if (value && !this.jump) this.jumpPressed = true;
    this.jump = value;
    return true;
  }

  /**
   * Handles apply signal keys.
   * @param {string} code Input parameter.
   * @param {boolean} value Input parameter.
   */
  _applySignalKeys(code, value) {
    if (!value) return;
    if (code === 'Enter' || code === 'NumpadEnter') this.enterPressed = true;
    else if (code === 'Escape') this.escPressed = true;
    else if (code === 'KeyP') this.pausePressed = true;
    else if (code === 'KeyF') this.fullscreenPressed = true;
    else if (code === 'KeyQ') this.backPressed = true;
    else if (code === 'KeyM') this.rollPressed = true;
  }
}
export const inputManager = new InputManager();
// #endregion