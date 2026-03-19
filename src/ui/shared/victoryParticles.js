// #region Public Methods
/**
 * Handles format time.
 * @param {number} seconds Input parameter.
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** @param {number} x */
export function easeOutBack(x) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/** @param {number} x */
export function easeOutQuad(x) { return 1 - (1 - x) * (1 - x); }

/**
 * Creates a particle pool with inactive entries.
 *
 * @param {number} size
 */
export function makePool(size) {
  const pool = [];
  for (let i = 0; i < size; i++) {
    pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1, r: 2, baseA: 1, color: '#ffd700' });
  }
  return pool;
}

/**
 * Initializes an atmosphere particle (slowly rising).
 *
 * @param {object} p
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 */
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

/**
 * Initializes a spark particle (explodes from cx/cy).
 *
 * @param {object} p
 * @param {number} cx
 * @param {number} cy
 */
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