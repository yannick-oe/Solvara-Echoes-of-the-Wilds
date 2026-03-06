class IntervalManager {
  constructor() {
    /** @type {Map<string, number>} */
    this._intervals = new Map();
  }

  /**
   * Registriert ein benanntes Intervall – ersetzt ein bestehendes gleichen Namens.
   * @param {string}   id
   * @param {Function} fn
   * @param {number}   ms
   */
  register(id, fn, ms) {
    this.clear(id);
    const handle = setInterval(fn, ms);
    this._intervals.set(id, handle);
  }

  clear(id) {
    if (this._intervals.has(id)) {
      clearInterval(this._intervals.get(id));
      this._intervals.delete(id);
    }
  }

  stopAll() {
    for (const handle of this._intervals.values()) {
      clearInterval(handle);
    }
    this._intervals.clear();
  }
}

export const intervalManager = new IntervalManager();
