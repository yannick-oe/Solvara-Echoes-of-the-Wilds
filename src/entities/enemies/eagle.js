import { Enemy } from './enemy.js';

const EAGLE_W = 48;
const EAGLE_H = 32;

const DRAW_W  = 86;
const DRAW_H  = 56;
const DRAW_OX = (EAGLE_W - DRAW_W) / 2;
const DRAW_OY = (EAGLE_H - DRAW_H) / 2;

const FRAME_COUNT = 4;
const ANIM_FPS    = 10;

const PATROL_SPEED = 80;

export class EagleEnemy extends Enemy {


  constructor(x, minY, maxY) {
    super(x, minY, EAGLE_W, EAGLE_H);

    this._minY = minY;
    this._maxY = maxY;
    this.deathSound  = 'assets/audio/sfx/enemyKill.mp3';


    this.velY        = PATROL_SPEED;
    this.velX        = 0;

    this._frameIndex = 0;
    this._frameTimer = 0;
  }



  update(dt) {
    if (this.dead) return;


    this.y += this.velY * dt;


    if (this.velY > 0 && this.y >= this._maxY) {
      this.y    = this._maxY;
      this.velY = -PATROL_SPEED;
    } else if (this.velY < 0 && this.y <= this._minY) {
      this.y    = this._minY;
      this.velY = PATROL_SPEED;
    }


    this._frameTimer += dt;
    if (this._frameTimer >= 1 / ANIM_FPS) {
      this._frameTimer -= 1 / ANIM_FPS;
      this._frameIndex  = (this._frameIndex + 1) % FRAME_COUNT;
    }
  }



  draw(ctx, _cam, imageCache) {
    if (this.dead) return;
    const img = imageCache.get(`EAGLE_${this._frameIndex}`);
    if (!img) return;

    const dx = this.x + DRAW_OX;
    const dy = this.y + DRAW_OY;



    ctx.drawImage(img, dx, dy, DRAW_W, DRAW_H);
  }
}
