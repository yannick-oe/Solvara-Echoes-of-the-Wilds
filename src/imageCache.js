export class ImageCache {
  constructor() {
    // key = Asset-Pfad, value = geladene HTMLImage-Instanz.
    this.cache = {};
  }

  async loadAll(paths) {
    // Doppelte Pfade vermeiden, damit dasselbe Asset nicht mehrfach geladen wird.
    const uniquePaths = [...new Set(paths)];
    const tasks = [];
    for (let i = 0; i < uniquePaths.length; i++) {
      tasks.push(this.loadOne(uniquePaths[i]));
    }

    await Promise.all(tasks);
  }

  get(path) {
    // Liefert undefined, falls das Asset noch nicht geladen wurde.
    return this.cache[path];
  }

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
