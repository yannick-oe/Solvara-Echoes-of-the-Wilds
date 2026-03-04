export class Input {
  /**
   * Initializes keyboard tracking for game actions.
   */
  constructor() {
    this.keys = {};
    this.pressed = {};
    let self = this;
    window.addEventListener("keydown", function (e) {
      let gameKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"];
      for (let i = 0; i < gameKeys.length; i++) {
        if (e.code === gameKeys[i]) {
          e.preventDefault();
          break;
        }
      }
      if (!e.repeat) {
        self.pressed[e.code] = true;
      }
      self.keys[e.code] = true;
    });
    window.addEventListener("keyup", function (e) {
      self.keys[e.code] = false;
    });
  }

  /**
   * Checks whether a key is currently pressed.
   * @param {string} code The KeyboardEvent code.
   */
  isDown(code) {
    return this.keys[code] === true;
  }

  /**
   * Checks whether a key was newly pressed in this frame.
   * @param {string} code The KeyboardEvent code.
   */
  justPressed(code) {
    return this.pressed[code] === true;
  }

  /**
   * Clears the pressed-state at the end of the frame.
   */
  endFrame() {
    this.pressed = {};
  }
}
