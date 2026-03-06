class ImageCache {
  constructor() {
    this._cache = {};
  }

  /**
   * @param {{ key: string, src: string }[]} entries
   * @returns {Promise<void>}
   */
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

  /** @returns {HTMLImageElement|null} */
  get(key) {
    return this._cache[key] ?? null;
  }
}

export const imageCache = new ImageCache();
