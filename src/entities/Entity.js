export class Entity {
	constructor(x = 0, y = 0, hitW = 0, hitH = 0) {
		this.x = x;
		this.y = y;
		this.hitW = hitW;
		this.hitH = hitH;
		this.vx = 0;
		this.vy = 0;
		this.onGround = false;
		this.active = true;
		this.spawnX = x;
		this.spawnY = y;
	}

	setSpawn(x, y) {
		this.spawnX = x;
		this.spawnY = y;
	}

	respawn() {
		this.x = this.spawnX;
		this.y = this.spawnY;
		this.vx = 0;
		this.vy = 0;
		this.onGround = false;
	}

	clampX(minX, maxX) {
		if (this.x < minX) {
			this.x = minX;
			this.vx = 0;
			return;
		}
		if (this.x > maxX) {
			this.x = maxX;
			this.vx = 0;
		}
	}

	update() {}

	draw() {}
}
