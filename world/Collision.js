export class Collision {
  static resolveX(entity, tilemap) {
    const ds = tilemap.displaySize;
    const left = Math.floor(entity.x / ds);
    const right = Math.floor((entity.x + entity.hitW - 1) / ds);
    const top = Math.floor(entity.y / ds);
    const bottom = Math.floor((entity.y + entity.hitH - 1) / ds);
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (!tilemap.isSolid(col, row)) continue;
        if (entity.vx > 0) {
          entity.x = col * ds - entity.hitW;
        } else if (entity.vx < 0) {
          entity.x = (col + 1) * ds;
        }
        entity.vx = 0;
      }
    }
  }

  static resolveY(entity, tilemap) {
    const ds = tilemap.displaySize;
    const left = Math.floor(entity.x / ds);
    const right = Math.floor((entity.x + entity.hitW - 1) / ds);
    const top = Math.floor(entity.y / ds);
    const bottom = Math.floor((entity.y + entity.hitH - 1) / ds);
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (!tilemap.isSolid(col, row)) continue;
        if (entity.vy > 0) {
          entity.y = row * ds - entity.hitH;
          entity.onGround = true;
        } else if (entity.vy < 0) {
          entity.y = (row + 1) * ds;
        }
        entity.vy = 0;
      }
    }
  }
}
