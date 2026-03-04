/*
  input.js
  --------
  Handles keyboard input in two ways:
  - keys[...] = key is currently held down
  - pressedThisFrame[...] = key was pressed this frame only
*/

export class Input {
  /**
   * Registers browser key listeners and initializes key maps.
   */
  constructor() {
    this.keys = {};
    this.pressedThisFrame = {};

    let self = this;
    window.addEventListener("keydown", function (event) {
      if (!event.repeat) {
        self.pressedThisFrame[event.code] = true;
      }
      self.keys[event.code] = true;

      if (
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight" ||
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "Space"
      ) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", function (event) {
      self.keys[event.code] = false;
    });
  }

  /**
   * Returns true while a key is held.
   * @param {string} code KeyboardEvent.code value.
   */
  isDown(code) {
    return this.keys[code] === true;
  }

  /**
   * Returns true only on the frame a key was pressed.
   * @param {string} code KeyboardEvent.code value.
   */
  wasPressed(code) {
    return this.pressedThisFrame[code] === true;
  }

  /**
   * Clears one-frame key presses. Call once per update frame.
   */
  endFrame() {
    this.pressedThisFrame = {};
  }
}
