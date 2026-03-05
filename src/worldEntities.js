import { COLLECTIBLE_TYPE, ENEMY_TYPE, GAMEPLAY } from "./constants.js";

const PICKUP_FRAMES = {
    [COLLECTIBLE_TYPE.diamond]: [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
        { col: 3, row: 0 },
        { col: 4, row: 0 },
    ],
    [COLLECTIBLE_TYPE.cherry]: [
        { col: 5, row: 0 },
        { col: 6, row: 0 },
        { col: 7, row: 0 },
        { col: 8, row: 0 },
        { col: 9, row: 0 },
        { col: 10, row: 0 },
        { col: 11, row: 0 },
    ],
    [COLLECTIBLE_TYPE.starCoin]: [
        { col: 12, row: 0 },
        { col: 13, row: 0 },
        { col: 14, row: 0 },
        { col: 15, row: 0 },
    ],
};

function rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export class Enemy {
    constructor(config) {
        this.type = config.type;
        this.spawnX = config.x;
        this.spawnY = config.y;
        this.width = config.width;
        this.height = config.height;
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
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.direction = 1;
        this.alive = true;
        this.jumpCooldown = 0;
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(dt, level) {
        if (!this.alive) return;
        if (this.type === ENEMY_TYPE.possum) this.updatePossum(dt, level);
        if (this.type === ENEMY_TYPE.frog) this.updateFrog(dt, level);
        if (this.type === ENEMY_TYPE.eagle) this.updateEagle(dt);
    }

    updatePossum(dt, level) {
        this.vx = this.speed * this.direction;
        this.x += this.vx * dt;
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround();
        if (!this.hasGroundAhead(level)) this.turnAround();
    }

    updateFrog(dt, level) {
        this.jumpCooldown -= dt;
        if (this.jumpCooldown <= 0) this.startHop();
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.resolveGround(level);
        if (this.x < this.patrolMin || this.x + this.width > this.patrolMax) this.turnAround();
    }

    startHop() {
        this.jumpCooldown = 1.05;
        this.vx = this.speed * this.direction;
        this.vy = -520;
    }

    updateEagle(dt) {
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
        if (this.type === ENEMY_TYPE.possum) ctx.fillStyle = "#8d6e63";
        if (this.type === ENEMY_TYPE.frog) ctx.fillStyle = "#43a047";
        if (this.type === ENEMY_TYPE.eagle) ctx.fillStyle = "#5c6bc0";
        ctx.fillRect(x, y, this.width, this.height);
    }
}

export class Collectible {
    constructor(config, sprite) {
        this.type = config.type;
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
        const source = this.sprite.frameAt(frame.col, frame.row);
        ctx.drawImage(
            this.sprite.image,
            source.sx,
            source.sy,
            source.sw,
            source.sh,
            x,
            y,
            this.width,
            this.height
        );
    }
}

export function isStompHit(player, enemy) {
    if (!enemy.alive) return false;
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
    const enemyRect = enemy.getRect();
    if (!rectsOverlap(playerRect, enemyRect)) return false;
    const playerBottom = player.y + player.height;
    const enemyHeadLimit = enemy.y + enemy.height * 0.35;
    return player.vy > 0 && playerBottom <= enemyHeadLimit;
}

export function isBodyHit(player, enemy) {
    if (!enemy.alive) return false;
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
    return rectsOverlap(playerRect, enemy.getRect());
}

export function getDefaultEnemyLayout(tileSize) {
    return [
        {
            type: ENEMY_TYPE.possum,
            x: tileSize * 10,
            y: tileSize * 7.6,
            width: 30,
            height: 20,
            patrolMin: tileSize * 8,
            patrolMax: tileSize * 14,
            speed: 80,
        },
        {
            type: ENEMY_TYPE.frog,
            x: tileSize * 39,
            y: tileSize * 5.2,
            width: 30,
            height: 24,
            patrolMin: tileSize * 36,
            patrolMax: tileSize * 43,
            speed: 110,
        },
        {
            type: ENEMY_TYPE.eagle,
            x: tileSize * 103,
            y: tileSize * 2.2,
            width: 30,
            height: 20,
            speed: 90,
            verticalMin: tileSize * 1.2,
            verticalMax: tileSize * 5.5,
        },
    ];
}

export function getDefaultCollectiblesLayout(tileSize) {
    const size = 18;
    return [
        ...buildDiamondLine(tileSize * 4, tileSize * 6, 7, tileSize * 1.2, size),
        ...buildDiamondArc(tileSize * 17, tileSize * 5.8, 6, tileSize * 0.8, size),
        ...buildDiamondLine(tileSize * 32, tileSize * 4.3, 5, tileSize * 1.1, size),
        {
            type: COLLECTIBLE_TYPE.starCoin,
            value: GAMEPLAY.starCoinScore,
            x: tileSize * 44,
            y: tileSize * 2.7,
            width: 24,
            height: 24,
        },
        {
            type: COLLECTIBLE_TYPE.starCoin,
            value: GAMEPLAY.starCoinScore,
            x: tileSize * 81,
            y: tileSize * 6.2,
            width: 24,
            height: 24,
        },
        {
            type: COLLECTIBLE_TYPE.starCoin,
            value: GAMEPLAY.starCoinScore,
            x: tileSize * 111,
            y: tileSize * 1.2,
            width: 24,
            height: 24,
        },
        {
            type: COLLECTIBLE_TYPE.cherry,
            value: 1,
            x: tileSize * 85,
            y: tileSize * 8.2,
            width: 20,
            height: 20,
        },
    ];
}

function buildDiamondLine(startX, y, count, gap, size) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            type: COLLECTIBLE_TYPE.diamond,
            value: GAMEPLAY.diamondScore,
            x: startX + i * gap,
            y,
            width: size,
            height: size,
        });
    }
    return items;
}

function buildDiamondArc(startX, startY, count, gap, size) {
    const items = [];
    for (let i = 0; i < count; i++) {
        const wave = Math.sin((i / (count - 1)) * Math.PI) * 26;
        items.push({
            type: COLLECTIBLE_TYPE.diamond,
            value: GAMEPLAY.diamondScore,
            x: startX + i * gap,
            y: startY - wave,
            width: size,
            height: size,
        });
    }
    return items;
}
