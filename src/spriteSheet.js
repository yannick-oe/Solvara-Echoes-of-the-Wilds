export class SpriteSheet { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor(image, frameWidth, frameHeight) { // Execute this step in the current flow.
    this.image = image; // Store data on the current object instance.
    this.frameWidth = frameWidth; // Store data on the current object instance.
    this.frameHeight = frameHeight; // Store data on the current object instance.
    this.columns = Math.floor(image.width / frameWidth); // Store data on the current object instance.
  }

  // This function handles the frame behavior in this file.
  frame(index) { // Execute this step in the current flow.
    const col = index % this.columns; // Create a local constant for this scope.
    const row = Math.floor(index / this.columns); // Create a local constant for this scope.

    return { // Return control (and optionally a value) to the caller.
      sx: col * this.frameWidth, // Execute this step in the current flow.
      sy: row * this.frameHeight, // Execute this step in the current flow.
      sw: this.frameWidth, // Execute this step in the current flow.
      sh: this.frameHeight, // Execute this step in the current flow.
    };
  }

  // This function handles the frameAt behavior in this file.
  frameAt(column, row) { // Execute this step in the current flow.
    return { // Return control (and optionally a value) to the caller.
      sx: column * this.frameWidth, // Execute this step in the current flow.
      sy: row * this.frameHeight, // Execute this step in the current flow.
      sw: this.frameWidth, // Execute this step in the current flow.
      sh: this.frameHeight, // Execute this step in the current flow.
    };
  }
}
