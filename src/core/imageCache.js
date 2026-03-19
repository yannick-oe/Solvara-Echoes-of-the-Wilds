// #region Class Definition
class ImageCache {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {
    this._cache = {};
  }

/** Handles preload. @param {*} entries - Entries value. @returns {*} - Resulting value. */
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

/** Handles get. @param {*} key - Key value. @returns {*} - Resulting value. */
  get(key) {
    return this._cache[key] ?? null;
  }
}

export const imageCache = new ImageCache();
// #endregion