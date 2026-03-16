// #region Class Definition
class IntervalManager {
  /**
   * Creates a new instance.
   */
  constructor() {

    this._intervals = new Map();
  }

  /**
   * Handles register.
   * @param {string} id Input parameter.
   * @param {object} fn Input parameter.
   * @param {number} ms Input parameter.
   */
  register(id, fn, ms) {
    this.clear(id);
    const handle = setInterval(fn, ms);
    this._intervals.set(id, handle);
  }

  /**
   * Handles clear.
   * @param {string} id Input parameter.
   */
  clear(id) {
    if (this._intervals.has(id)) {
      clearInterval(this._intervals.get(id));
      this._intervals.delete(id);
    }
  }

  /**
   * Handles stop all.
   */
  stopAll() {
    for (const handle of this._intervals.values()) {
      clearInterval(handle);
    }
    this._intervals.clear();
  }
}
export const intervalManager = new IntervalManager();
// #endregion