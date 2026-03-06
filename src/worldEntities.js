import { COLLECTIBLE_TYPE, ENEMY_TYPE, GAMEPLAY } from "./constants.js";
import { SpriteSheet } from "./spriteSheet.js";

// Pickup-Frames kommen aus demselben Atlas wie das HUD.
const PICKUP_FRAMES = {
  [COLLECTIBLE_TYPE.diamond]: [
    { sx: 68, sy: 0, sw: 15, sh: 13 },
    { sx: 51, sy: 0, sw: 15, sh: 13 },
    { sx: 17, sy: 0, sw: 15, sh: 13 },
    { sx: 34, sy: 0, sw: 15, sh: 13 },
    { sx: 0, sy: 0, sw: 15, sh: 13 },
  ],
  [COLLECTIBLE_TYPE.cherry]: [
    { sx: 108, sy: 0, sw: 21, sh: 21 },
    { sx: 131, sy: 0, sw: 21, sh: 21 },
    { sx: 154, sy: 0, sw: 21, sh: 21 },
    { sx: 200, sy: 0, sw: 21, sh: 21 },
    { sx: 177, sy: 0, sw: 21, sh: 21 },
    { sx: 223, sy: 0, sw: 21, sh: 21 },
    { sx: 85, sy: 0, sw: 21, sh: 21 },
  ],
  [COLLECTIBLE_TYPE.starCoin]: [
    { sx: 348, sy: 0, sw: 32, sh: 32 },
    { sx: 246, sy: 0, sw: 32, sh: 32 },
    { sx: 314, sy: 0, sw: 32, sh: 32 },
    { sx: 280, sy: 0, sw: 32, sh: 32 },
  ],
};

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export class Enemy {
  constructor(config, spriteImageSet) {
    this.type = config.type;
    this.spawnX = config.x;
    this.spawnY = config.y;
    this.width = config.width;
    this.height = config.height;
    // patrolMin/patrolMax begrenzen die Bewegungszone pro Gegner.
    this.patrolMin = config.patrolMin;
    this.patrolMax = config.patrolMax;
    this.speed = config.speed;
    this.direction = 1;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 1700;
    this.alive = true;
    this.jumpCooldown = 0;
    this.verticalMin = config.verticalMin ?? this.spawnY;
    this.verticalMax = config.verticalMax ?? this.spawnY;
    this.spriteImageSet = spriteImageSet;
    this.animations = this.buildAnimationFrames();
    this.animTimer = 0;
    this.animDuration = 0.12;
    this.animFrame = 0;
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.direction = 1;
    this.alive = true;
    this.jumpCooldown = 0;
    this.animTimer = 0;
    this.animFrame = 0;
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  update(dt, level) {
    if (!this.alive) return;
    this.advanceAnimation(dt);
    // Typ entscheidet, welche Bewegungs-Logik ausgefuehrt wird.
    if (this.type === ENEMY_TYPE.possum) this.updatePossum(dt, level);
    if (this.type === ENEMY_TYPE.frog) this.updateFrog(dt, level);
    if (this.type === ENEMY_TYPE.eagle) this.updateEagle(dt);
  }

  advanceAnimation(dt) {
    this.animTimer += dt;
    if (this.animTimer < this.animDuration) return;
    this.animTimer -= this.animDuration;
    this.animFrame += 1;
  }

  getActiveFrames() {
    if (this.type === ENEMY_TYPE.possum) return this.animations.walk;
    if (this.type === ENEMY_TYPE.eagle) return this.animations.fly;
    if (this.type === ENEMY_TYPE.frog)
      return Math.abs(this.vy) > 30 ? this.animations.jump : this.animations.idle;
    return [];
  }

  buildAnimationFrames() {
    if (!this.spriteImageSet) return { idle: [], jump: [], fly: [], walk: [] };
    if (this.type === ENEMY_TYPE.possum) {
      return {
        idle: [],
        jump: [],
        fly: [],
        walk: buildStripFrames(this.spriteImageSet.possumWalk, 36, 28),
      };
    }

    if (this.type === ENEMY_TYPE.eagle) {
      return {
        idle: [],
        jump: [],
        walk: [],
        fly: buildStripFrames(this.spriteImageSet.eagleFly, 40, 41),
      };
    }

    if (this.type === ENEMY_TYPE.frog) {
      return {
        idle: buildStripFrames(this.spriteImageSet.frogIdle, 35, 32),
        jump: buildStripFrames(this.spriteImageSet.frogJump, 35, 32),
        fly: [],
        walk: [],
      };
    }

    return { idle: [], jump: [], fly: [], walk: [] };
  }

  updatePossum(dt, level) {
    this.vx = this.speed * this.direction;
    this.x += this.vx * dt;
    // Possum dreht um, wenn Patrouillenbereich endet oder kein Boden mehr vor ihm liegt.
    if (this.x < this.patrolMin || this.x + this.width > this.patrolMax)
      this.turnAround();
    if (!this.hasGroundAhead(level)) this.turnAround();
  }

  updateFrog(dt, level) {
    this.jumpCooldown -= dt;
    // Frog wechselt zwischen Wartezeit und Sprungimpuls.
    if (this.jumpCooldown <= 0) this.startHop();
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.resolveGround(level);
    if (this.x < this.patrolMin || this.x + this.width > this.patrolMax)
      this.turnAround();
  }

  startHop() {
    this.jumpCooldown = 1.05;
    this.vx = this.speed * this.direction;
    this.vy = -520;
  }

  updateEagle(dt) {
    // Eagle patrouilliert vertikal zwischen verticalMin und verticalMax.
    this.vx = 0;
    this.y += this.speed * this.direction * dt;
    if (this.y <= this.verticalMin) this.direction = 1;
    if (this.y + this.height >= this.verticalMax) this.direction = -1;
  }

  resolveGround(level) {
    const tileSize = level.tileDisplaySize;
    const left = Math.floor(this.x / tileSize);
    const right = Math.floor((this.x + this.width - 1) / tileSize);
    const bottom = Math.floor((this.y + this.height - 1) / tileSize);
    for (let col = left; col <= right; col++) {
      if (!level.isSolidTile(col, bottom)) continue;
      this.y = bottom * tileSize - this.height;
      this.vy = 0;
      return;
    }
  }

  hasGroundAhead(level) {
    const probeX = this.direction > 0 ? this.x + this.width + 2 : this.x - 2;
    const probeY = this.y + this.height + 2;
    const col = Math.floor(probeX / level.tileDisplaySize);
    const row = Math.floor(probeY / level.tileDisplaySize);
    return level.isSolidTile(col, row);
  }

  turnAround() {
    this.direction *= -1;
    if (this.type === ENEMY_TYPE.frog) this.vx = this.speed * this.direction;
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const x = Math.round(this.x - camera.x);
    const y = Math.round(this.y - camera.y);
    const frames = this.getActiveFrames();
    if (!frames.length) {
      if (this.type === ENEMY_TYPE.possum) ctx.fillStyle = "#8d6e63";
      if (this.type === ENEMY_TYPE.frog) ctx.fillStyle = "#43a047";
      if (this.type === ENEMY_TYPE.eagle) ctx.fillStyle = "#5c6bc0";
      ctx.fillRect(x, y, this.width, this.height);
      return;
    }

    const frame = frames[this.animFrame % frames.length];
    ctx.save();
    if (this.direction < 0 && this.type !== ENEMY_TYPE.eagle) {
      ctx.translate(x + this.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        frame.image,
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        0,
        0,
        this.width,
        this.height,
      );
    } else {
      ctx.drawImage(
        frame.image,
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        x,
        y,
        this.width,
        this.height,
      );
    }
    ctx.restore();
  }
}

function buildStripFrames(image, frameWidth, frameHeight) {
  if (!image) return [];
  const sheet = new SpriteSheet(image, frameWidth, frameHeight);
  const frameCount = Math.floor(image.width / frameWidth);
  const frames = [];
  for (let index = 0; index < frameCount; index++) {
    const rect = sheet.frameAt(index, 0);
    frames.push({ image, sx: rect.sx, sy: rect.sy, sw: rect.sw, sh: rect.sh });
  }
  return frames;
}

export class Collectible {
  constructor(config, sprite) {
    this.type = config.type;
    // value ist der Punktewert (z. B. 10 fuer Diamant, 50 fuer Sternmuenze).
    this.value = config.value;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.collected = false;
    this.sprite = sprite;
    this.frames = PICKUP_FRAMES[this.type] || [];
    this.frameTimer = Math.random() * 0.3;
    this.frameDuration = 0.11;
    this.frameIndex = 0;
  }

  reset() {
    this.collected = false;
    this.frameTimer = 0;
    this.frameIndex = 0;
  }

  update(dt) {
    if (this.collected) return;
    if (!this.frames.length) return;
    this.frameTimer += dt;
    if (this.frameTimer < this.frameDuration) return;
    this.frameTimer -= this.frameDuration;
    this.frameIndex = (this.frameIndex + 1) % this.frames.length;
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  tryCollect(playerRect, onCollect) {
    if (this.collected) return;
    if (!rectsOverlap(this.getRect(), playerRect)) return;
    this.collected = true;
    // onCollect wird vom Game aufgerufen, um Score/HUD zu aktualisieren.
    onCollect(this);
  }

  draw(ctx, camera) {
    if (this.collected) return;
    const x = Math.round(this.x - camera.x);
    const y = Math.round(this.y - camera.y);
    if (!this.sprite || !this.frames.length) {
      if (this.type === COLLECTIBLE_TYPE.diamond) ctx.fillStyle = "#4dd0e1";
      if (this.type === COLLECTIBLE_TYPE.starCoin) ctx.fillStyle = "#ffca28";
      if (this.type === COLLECTIBLE_TYPE.cherry) ctx.fillStyle = "#e53935";
      ctx.fillRect(x, y, this.width, this.height);
      return;
    }

    const frame = this.frames[this.frameIndex];
    const source =
      frame.sx !== undefined
        ? frame
        : this.sprite.frameAt(frame.col, frame.row);
    ctx.drawImage(
      this.sprite.image,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      x,
      y,
      this.width,
      this.height,
    );
  }
}

export function isStompHit(player, enemy) {
  if (!enemy.alive) return false;
  const playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };
  const enemyRect = enemy.getRect();
  if (!rectsOverlap(playerRect, enemyRect)) return false;
  const playerBottom = player.y + player.height;
  const enemyHeadLimit = enemy.y + enemy.height * 0.35;
  // Nur gueltig, wenn der Spieler von oben kommt und den oberen Bereich des Gegners trifft.
  return player.vy > 0 && playerBottom <= enemyHeadLimit;
}

export function isBodyHit(player, enemy) {
  if (!enemy.alive) return false;
  const playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };
  return rectsOverlap(playerRect, enemy.getRect());
}

export function getDefaultEnemyLayout() {
  // Alle Werte sind feste Weltpixelkoordinaten mit JSON-genauen Hitbox-Massen.
  return [
    {
      type: ENEMY_TYPE.possum,
      x: 480,
      y: 364.8,
      width: 36,
      height: 28,
      patrolMin: 384,
      patrolMax: 672,
      speed: 80,
    },
    {
      type: ENEMY_TYPE.frog,
      x: 1872,
      y: 249.6,
      width: 35,
      height: 32,
      patrolMin: 1728,
      patrolMax: 2064,
      speed: 110,
    },
    {
      type: ENEMY_TYPE.eagle,
      x: 4944,
      y: 105.6,
      width: 40,
      height: 41,
      speed: 90,
      verticalMin: 57.6,
      verticalMax: 264,
    },
  ];
}

export function getDefaultCollectiblesLayout() {
  // Mix aus Linien/Boegen erzeugt sichtbare Sammelrouten im Level.
  return [
    ...buildDiamondLine(192, 288, 7, 57.6, 15, 13),
    ...buildDiamondArc(816, 278.4, 6, 38.4, 15, 13),
    ...buildDiamondLine(1536, 206.4, 5, 52.8, 15, 13),
    {
      type: COLLECTIBLE_TYPE.starCoin,
      value: GAMEPLAY.starCoinScore,
      x: 2112,
      y: 129.6,
      width: 32,
      height: 32,
    },
    {
      type: COLLECTIBLE_TYPE.starCoin,
      value: GAMEPLAY.starCoinScore,
      x: 3888,
      y: 297.6,
      width: 32,
      height: 32,
    },
    {
      type: COLLECTIBLE_TYPE.starCoin,
      value: GAMEPLAY.starCoinScore,
      x: 5328,
      y: 57.6,
      width: 32,
      height: 32,
    },
    {
      type: COLLECTIBLE_TYPE.cherry,
      value: 1,
      x: 4080,
      y: 393.6,
      width: 21,
      height: 21,
    },
  ];
}

function buildDiamondLine(startX, y, count, gap, width, height) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      type: COLLECTIBLE_TYPE.diamond,
      value: GAMEPLAY.diamondScore,
      x: startX + i * gap,
      y,
      width,
      height,
    });
  }
  return items;
}

function buildDiamondArc(startX, startY, count, gap, width, height) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const wave = Math.sin((i / (count - 1)) * Math.PI) * 26;
    items.push({
      type: COLLECTIBLE_TYPE.diamond,
      value: GAMEPLAY.diamondScore,
      x: startX + i * gap,
      y: startY - wave,
      width,
      height,
    });
  }
  return items;
}
