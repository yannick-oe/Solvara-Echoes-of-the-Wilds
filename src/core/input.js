// #region Class Definition
class InputManager {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {
    this._resetStateFlags();
    this._bindHandlers();
  }

/** Handles reset State Flags. @returns {void} - Nothing. */
  _resetStateFlags() {
    this._resetMovementFlags();
    this._resetActionFlags();
  }

/** Handles reset Movement Flags. @returns {void} - Nothing. */
  _resetMovementFlags() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.down = false;
    this.up = false;
    this.lookUp = false;
    this.mobileUpActive = false;
  }

/** Handles reset Action Flags. @returns {void} - Nothing. */
  _resetActionFlags() {
    this.jumpPressed = false;
    this.enterPressed = false;
    this.escPressed = false;
    this.pausePressed = false;
    this.fullscreenPressed = false;
    this.backPressed = false;
    this.rollPressed = false;
  }

/** Handles bind Handlers. @returns {void} - Nothing. */
  _bindHandlers() {
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

/** Handles init. @returns {void} - Nothing. */
  init() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

/** Handles destroy. @returns {void} - Nothing. */
  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

/** Handles reset Frame State. @returns {void} - Nothing. */
  resetFrameState() {
    this.jumpPressed  = false;
    this.enterPressed = false;
    this.escPressed   = false;
    this.pausePressed = false;
    this.fullscreenPressed = false;
    this.backPressed  = false;
    this.rollPressed  = false;
  }

/** Sets touch. @param {*} action - Action value. @param {*} value - Value to apply. @returns {void} - Nothing. */
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

/** Handles on Key Down. @param {*} e - E value. @returns {void} - Nothing. */
  _onKeyDown(e) {

    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this._apply(e.code, true);
  }

/** Handles on Key Up. @param {*} e - E value. @returns {void} - Nothing. */
  _onKeyUp(e) { this._apply(e.code, false); }

/** Handles apply. @param {*} code - Code value. @param {*} value - Value to apply. @returns {void} - Nothing. */
  _apply(code, value) {
    if (this._applyHorizontal(code, value)) return;
    if (this._applyVerticalAndLook(code, value)) return;
    if (this._applyJump(code, value)) return;
    this._applySignalKeys(code, value);
  }

/** Applies horizontal. @param {*} code - Code value. @param {*} value - Value to apply. @returns {boolean} - Whether the check passes. */
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

/** Applies vertical And Look. @param {*} code - Code value. @param {*} value - Value to apply. @returns {boolean} - Whether the check passes. */
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

/** Applies jump. @param {*} code - Code value. @param {*} value - Value to apply. @returns {boolean} - Whether the check passes. */
  _applyJump(code, value) {
    if (code !== 'Space') return false;
    if (value && !this.jump) this.jumpPressed = true;
    this.jump = value;
    return true;
  }

/** Applies signal Keys. @param {*} code - Code value. @param {*} value - Value to apply. @returns {void} - Nothing. */
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