// #region Class Definition
class IntervalManager {
/** Creates a new instance. @returns {void} - Nothing. */
  constructor() {

    this._intervals = new Map();
  }

/** Handles register. @param {*} id - Id value. @param {*} fn - Fn value. @param {*} ms - Ms value. @returns {void} - Nothing. */
  register(id, fn, ms) {
    this.clear(id);
    const handle = setInterval(fn, ms);
    this._intervals.set(id, handle);
  }

/** Handles clear. @param {*} id - Id value. @returns {void} - Nothing. */
  clear(id) {
    if (this._intervals.has(id)) {
      clearInterval(this._intervals.get(id));
      this._intervals.delete(id);
    }
  }

/** Stops all. @returns {void} - Nothing. */
  stopAll() {
    for (const handle of this._intervals.values()) {
      clearInterval(handle);
    }
    this._intervals.clear();
  }
}
export const intervalManager = new IntervalManager();
// #endregion