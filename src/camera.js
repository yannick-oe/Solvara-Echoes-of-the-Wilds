export class Camera { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor(width, height) { // Execute this step in the current flow.
    this.x = 0; // Store data on the current object instance.
    this.y = 0; // Store data on the current object instance.
    this.width = width; // Store data on the current object instance.
    this.height = height; // Store data on the current object instance.
  }

  // This function handles the follow behavior in this file.
  follow(target, levelPixelWidth) { // Execute this step in the current flow.
    this.x = target.x + target.width / 2 - this.width / 2; // Store data on the current object instance.

    // This function handles the if behavior in this file.
    if (this.x < 0) { // Check a condition before executing this block.
      this.x = 0; // Store data on the current object instance.
    }

    const maxX = Math.max(0, levelPixelWidth - this.width); // Create a local constant for this scope.
    // This function handles the if behavior in this file.
    if (this.x > maxX) { // Check a condition before executing this block.
      this.x = maxX; // Store data on the current object instance.
    }

    this.x = Math.round(this.x); // Store data on the current object instance.

    this.y = 0; // Store data on the current object instance.
  }
}
