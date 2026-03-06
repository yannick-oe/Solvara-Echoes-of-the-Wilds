export class Input { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor() { // Execute this step in the current flow.
    this.keys = {}; // Store data on the current object instance.
    this.pressedThisFrame = {}; // Store data on the current object instance.
    this.releasedThisFrame = {}; // Store data on the current object instance.

    let self = this; // Create a local variable that may change.

    window.addEventListener("keydown", function (event) { // Execute this step in the current flow.
      // This function handles the if behavior in this file.
      if (!event.repeat) { // Check a condition before executing this block.
        self.pressedThisFrame[event.code] = true; // Compute and store a value for later use.
      }
      self.keys[event.code] = true; // Compute and store a value for later use.

      if ( // Check a condition before executing this block.
        event.code === "ArrowLeft" || // Compute and store a value for later use.
        event.code === "ArrowRight" || // Compute and store a value for later use.
        event.code === "ArrowUp" || // Compute and store a value for later use.
        event.code === "ArrowDown" || // Compute and store a value for later use.
        event.code === "Space" // Compute and store a value for later use.
      ) { // Execute this step in the current flow.
        event.preventDefault(); // Call a function to perform this step.
      }
    }); // Call a function to perform this step.

    window.addEventListener("keyup", function (event) { // Execute this step in the current flow.
      self.keys[event.code] = false; // Compute and store a value for later use.
      self.releasedThisFrame[event.code] = true; // Compute and store a value for later use.
    }); // Call a function to perform this step.
  }

  // This function handles the isDown behavior in this file.
  isDown(code) { // Execute this step in the current flow.
    return this.keys[code] === true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the wasPressed behavior in this file.
  wasPressed(code) { // Execute this step in the current flow.
    return this.pressedThisFrame[code] === true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the wasReleased behavior in this file.
  wasReleased(code) { // Execute this step in the current flow.
    return this.releasedThisFrame[code] === true; // Return control (and optionally a value) to the caller.
  }

  // This function handles the endFrame behavior in this file.
  endFrame() { // Execute this step in the current flow.
    this.pressedThisFrame = {}; // Store data on the current object instance.
    this.releasedThisFrame = {}; // Store data on the current object instance.
  }
}
