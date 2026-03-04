export class ImageCache {
  constructor() {
    this.cache = {};
  }

  loadAll(paths) {
    const uniquePaths = [...new Set(paths)];
    const promises = [];
    for (let i = 0; i < uniquePaths.length; i++) {
      const path = uniquePaths[i];
      promises.push(this.#loadOne(path));
    }
    return Promise.all(promises);
  }
  get(path) {
    return this.cache[path];
  }

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