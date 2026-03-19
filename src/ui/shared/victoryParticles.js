// #region Public Methods
/** Handles format Time. @param {*} seconds - Seconds value. @returns {string} - Derived text value. */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Handles ease Out Back. @param {*} x - X value. @returns {number} - Computed numeric value. */
export function easeOutBack(x) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/** Handles ease Out Quad. @param {*} x - X value. @returns {number} - Computed numeric value. */
export function easeOutQuad(x) { return 1 - (1 - x) * (1 - x); }

/** Creates pool. @param {*} size - Size value. @returns {*} - Resulting value. */
export function makePool(size) {
  const pool = [];
  for (let i = 0; i < size; i++) {
    pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1, r: 2, baseA: 1, color: '#ffd700' });
  }
  return pool;
}

/** Handles init Atmo Particle. @param {*} p - P value. @param {*} canvasWidth - Canvas Width value. @param {*} canvasHeight - Canvas Height value. @returns {void} - Nothing. */
export function initAtmoParticle(p, canvasWidth, canvasHeight) {
  p.active  = true;
  p.x       = Math.random() * canvasWidth;
  p.y       = canvasHeight * 0.35 + Math.random() * (canvasHeight * 0.72);
  p.vx      = (Math.random() - 0.5) * 14;
  p.vy      = -(10 + Math.random() * 22);
  p.life    = 3.8 + Math.random() * 3.0;
  p.maxLife = p.life;
  p.r       = 1.0 + Math.random() * 1.8;
  p.baseA   = 0.18 + Math.random() * 0.38;
  const c   = Math.random();
  p.color   = c < 0.50 ? '#ffd700' : c < 0.80 ? '#ffe88f' : '#fff3c4';
}

/** Handles init Spark Particle. @param {*} p - P value. @param {*} cx - Cx value. @param {*} cy - Cy value. @returns {void} - Nothing. */
export function initSparkParticle(p, cx, cy) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 45 + Math.random() * 88;
  p.active  = true;
  p.x       = cx;
  p.y       = cy;
  p.vx      = Math.cos(angle) * speed;
  p.vy      = Math.sin(angle) * speed - 45;
  p.life    = 0.42 + Math.random() * 0.32;
  p.maxLife = p.life;
  p.r       = 1.6 + Math.random() * 2.8;
  p.baseA   = 1;
  p.color   = Math.random() < 0.55 ? '#ffd700' : '#ffe88f';
}
// #endregion