export class ParallaxLayer { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor(image, scrollFactor, scale, bottomOffset) { // Execute this step in the current flow.
    this.image = image; // Store data on the current object instance.
    this.scrollFactor = scrollFactor; // Store data on the current object instance.
    this.scale = scale; // Store data on the current object instance.
    this.bottomOffset = bottomOffset; // Store data on the current object instance.
  }

  // This function handles the draw behavior in this file.
  draw(ctx, canvasWidth, canvasHeight, cameraX) { // Execute this step in the current flow.
    const imageWidth = Math.ceil(this.image.width * this.scale); // Create a local constant for this scope.
    const imageHeight = Math.ceil(this.image.height * this.scale); // Create a local constant for this scope.
    const y = Math.round(canvasHeight - imageHeight - this.bottomOffset); // Create a local constant for this scope.

    const scrollX = cameraX * this.scrollFactor; // Create a local constant for this scope.
    const offset = ((scrollX % imageWidth) + imageWidth) % imageWidth; // Create a local constant for this scope.

    let x = -Math.round(offset); // Create a local variable that may change.
    // This function handles the while behavior in this file.
    while (x < canvasWidth) { // Repeat this block while the condition is true.
      ctx.drawImage(this.image, Math.round(x), y, imageWidth, imageHeight); // Render an image (or sprite region) on the canvas.
      x += imageWidth; // Compute and store a value for later use.
    }
  }
}
