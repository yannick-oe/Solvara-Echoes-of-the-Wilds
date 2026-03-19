const POOL_SIZE = 96;

export const PAD = 10;
export const PANEL_PAD = 8;
export const HEART_SIZE = 26;
export const HEART_ICON = '♥';
export const STAR_SIZE = 18;
export const STAR_GAP = 4;
export const COIN_ICON_FILLED = '⭐';
export const COIN_ICON_EMPTY = '☆';
export const GEM_SIZE = 20;
export const HUD_FONT = 'bold 13px monospace';
export const SCORE_FONT = 'bold 12px monospace';
export const COUNT_SPEED = 260;
export const GEM_PULSE_PERIOD = 2.6;
export const HEART_PULSE_PERIOD = 3.2;

export function easeOut(t) {
  return 1 - (1 - t) ** 2;
}

export function initParticle(p, x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 38 + Math.random() * 90;
  p.active = true;
  p.x = x;
  p.y = y;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed - 30;
  p.life = 0.55 + Math.random() * 0.35;
  p.maxLife = p.life;
  p.r = 1.8 + Math.random() * 3.0;
  p.color = color;
}

export function makePool() {
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) pool.push(makeParticle());
  return pool;
}

function makeParticle() {
  return {
    active: false, x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, r: 2, color: '#fff',
  };
}
