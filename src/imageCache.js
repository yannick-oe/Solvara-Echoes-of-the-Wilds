export class ImageCache { // Declare a class that can be used by other modules.
  // This function handles the constructor behavior in this file.
  constructor() { // Execute this step in the current flow.
    this.cache = {}; // Store data on the current object instance.
  }

  // This function handles the loadAll behavior in this file.
  async loadAll(paths) { // Execute this step in the current flow.
    const uniquePaths = [...new Set(paths)]; // Create a local constant for this scope.
    const tasks = []; // Create a local constant for this scope.

    // This function handles the for behavior in this file.
    for (let i = 0; i < uniquePaths.length; i++) { // Iterate through items or indices in a loop.
      tasks.push(this.loadOne(uniquePaths[i])); // Call a function to perform this step.
    }

    await Promise.all(tasks); // Wait for the async operation to finish.
  }

  // This function handles the get behavior in this file.
  get(path) { // Execute this step in the current flow.
    return this.cache[path]; // Return control (and optionally a value) to the caller.
  }

  // This function handles the loadOne behavior in this file.
  loadOne(path) { // Execute this step in the current flow.
    let self = this; // Create a local variable that may change.

    return new Promise(function (resolve, reject) { // Return control (and optionally a value) to the caller.
      const image = new Image(); // Create a local constant for this scope.

      image.onload = function () { // Compute and store a value for later use.
        self.cache[path] = image; // Compute and store a value for later use.
        resolve(image); // Call a function to perform this step.
      };

      image.onerror = function () { // Compute and store a value for later use.
        reject(new Error(`Image could not be loaded: ${path}`)); // Call a function to perform this step.
      };

      image.src = path; // Compute and store a value for later use.
    }); // Call a function to perform this step.
  }
}
