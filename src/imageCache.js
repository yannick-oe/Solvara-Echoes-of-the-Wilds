/*
  imageCache.js
  -------------
  Tiny image loader + cache.
  Each path is loaded once and then reused from memory.
*/

export class ImageCache {
  /**
   * Creates an empty path->image map.
   */
  constructor() {
    this.cache = {};
  }

  /**
   * Loads all unique paths in parallel.
   * @param {string[]} paths Image paths to load.
   */
  async loadAll(paths) {
    const uniquePaths = [...new Set(paths)];
    const tasks = [];

    for (let i = 0; i < uniquePaths.length; i++) {
      tasks.push(this.loadOne(uniquePaths[i]));
    }

    await Promise.all(tasks);
  }

  /**
   * Gets a cached image by path.
   * @param {string} path Image path key.
   */
  get(path) {
    return this.cache[path];
  }

  /**
   * Loads one image and stores it in the cache.
   * @param {string} path Image path.
   */
  loadOne(path) {
    let self = this;

    return new Promise(function (resolve, reject) {
      const image = new Image();

      image.onload = function () {
        self.cache[path] = image;
        resolve(image);
      };

      image.onerror = function () {
        reject(new Error(`Image could not be loaded: ${path}`));
      };

      image.src = path;
    });
  }
}