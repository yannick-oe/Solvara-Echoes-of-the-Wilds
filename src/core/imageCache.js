class ImageCache {
  constructor() {
    this._cache = {};
  }



  preload(entries) {
    const promises = entries.map(({ key, src }) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload  = () => { this._cache[key] = img; resolve(); };
        img.onerror = () => reject(new Error(`Bild nicht ladbar: ${src}`));
        img.src = src;
      })
    );
    return Promise.all(promises);
  }


  get(key) {
    return this._cache[key] ?? null;
  }
}

export const imageCache = new ImageCache();
