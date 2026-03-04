export class ImageCache {
  /**
  * Creates a cache for loaded images.
   */
  constructor() {
    this.cache = {};
  }

  /**
    * Loads all given asset paths asynchronously.
    * @param {string[]} paths The image paths to load.
   */
  loadAll(paths) {
    const uniquePaths = [...new Set(paths)];
    const promises = [];
    for (let i = 0; i < uniquePaths.length; i++) {
      const path = uniquePaths[i];
      promises.push(this.#loadOne(path));
    }
    return Promise.all(promises);
  }
  /**
    * Returns an image from the cache.
    * @param {string} path The asset path.
   */
  get(path) {
    return this.cache[path];
  }

  /**
    * Loads a single image and stores it in the cache.
    * @param {string} path The asset path.
   */
  #loadOne(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache[path] = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Image failed to load: ${path}`));
      img.src = path;
    });
  }
}