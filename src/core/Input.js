export class Input {
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

  isDown(code) {
    return this.keys[code] === true;
  }

  justPressed(code) {
    return this.pressed[code] === true;
  }

  endFrame() {
    this.pressed = {};
  }
}
