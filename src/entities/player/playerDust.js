// #region Constants
/**
 * Dust particle system for the player (jump, landing, roll effects).
 * @module playerDust
 */
const DUST_POOL_SIZE = 24;
// #endregion

// #region Public Methods
/**
 * Handles make dust pool.
 */
export function makeDustPool() {
  return Array.from({ length: DUST_POOL_SIZE }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, r: 2, a: 0,
  }));
}

/**
 * Spawns dust particles at a ground position.
 * @param {object[]} pool
 * @param {number} cx       - Center X
 * @param {number} groundY  - Ground Y
 * @param {number} [count=5]
 */
export function spawnDust(pool, cx, groundY, count = 5) {
  let spawned = 0;
  for (const p of pool) {
    if (p.active) continue;
    _initDustParticle(p, cx, groundY);
    if (++spawned >= count) break;
  }
}

/**
 * Initializes one dust particle instance.
 * @param {object} p Input parameter.
 * @param {number} cx Input parameter.
 * @param {number} groundY Input parameter.
 */
function _initDustParticle(p, cx, groundY) {
  const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
  const speed = 25 + Math.random() * 55;
  p.active = true;
  p.x = cx + (Math.random() - 0.5) * 16;
  p.y = groundY;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed - 20;
  p.life = 0.25 + Math.random() * 0.20;
  p.maxLife = p.life;
  p.r = 2 + Math.random() * 3;
  p.a = 0.55 + Math.random() * 0.25;
}

/**
 * Updates all active particles.
 * @param {object[]} pool
 * @param {number} dt
 */
export function updateDust(pool, dt) {
  for (const p of pool) {
    if (!p.active) continue;
    p.x    += p.vx * dt;
    p.y    += p.vy * dt;
    p.vy   += 80 * dt;
    p.life -= dt;
    if (p.life <= 0) p.active = false;
  }
}

/**
 * Draws all active particles.
 * @param {object[]} pool
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawDust(pool, ctx) {
  ctx.save();
  for (const p of pool) {
    if (!p.active) continue;
    const lifeF = p.life / p.maxLife;
    ctx.globalAlpha = p.a * lifeF;
    ctx.fillStyle   = '#c8b89a';
    ctx.shadowColor = '#a09070';
    ctx.shadowBlur  = p.r * 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * lifeF, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
// #endregion