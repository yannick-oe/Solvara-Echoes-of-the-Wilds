export class Entity {


  constructor(x, y, w, h) {
    this.x    = x;
    this.y    = y;
    this.w    = w;
    this.h    = h;
    this.velX = 0;
    this.velY = 0;


    this.active = true;
  }


  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }


  intersects(other) {
    return (
      this.x         < other.x + other.w &&
      this.x + this.w > other.x           &&
      this.y         < other.y + other.h &&
      this.y + this.h > other.y
    );
  }


  update(dt) {}



  draw(ctx, cam, imageCache) {}
}
