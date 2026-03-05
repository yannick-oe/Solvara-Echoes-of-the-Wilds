export class Input {
  constructor() {
    this.keys = {};
    this.pressedThisFrame = {};
    this.releasedThisFrame = {};

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
      self.releasedThisFrame[event.code] = true; // <-- neu
    });
  }

  isDown(code) {
    return this.keys[code] === true;
  }

  wasPressed(code) {
    return this.pressedThisFrame[code] === true;
  }

  wasReleased(code) {
    return this.releasedThisFrame[code] === true; // <-- neu
  }

  endFrame() {
    this.pressedThisFrame = {};
    this.releasedThisFrame = {}; // <-- neu
  }
}