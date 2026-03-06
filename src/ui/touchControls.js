export class TouchControls {
  /**
   * @param {HTMLElement} container
   * @param {import('../core/input.js').InputManager} inputManager
   */
  constructor(container, inputManager) {
    this._container    = container;
    this._inputManager = inputManager;
    this._buttons      = [];
  }

  init() {
    // TODO: Buttons erzeugen und per touchstart/touchend Events
    //       in this._inputManager.left / right / jump schreiben
  }

  destroy() {
    for (const btn of this._buttons) {
      btn.remove();
    }
    this._buttons = [];
  }
}
