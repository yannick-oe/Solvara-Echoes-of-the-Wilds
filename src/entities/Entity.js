export class Entity {
	/**
	 * Creates a generic entity with position and hitbox.
	 * @param {number} x Start position on the x-axis.
	 * @param {number} y Start position on the y-axis.
	 * @param {number} hitW Hitbox width.
	 * @param {number} hitH Hitbox height.
	 */
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

	/**
	 * Sets the respawn point of the entity.
	 * @param {number} x Spawn position on the x-axis.
	 * @param {number} y Spawn position on the y-axis.
	 */
	setSpawn(x, y) {
		this.spawnX = x;
		this.spawnY = y;
	}

	/**
	 * Resets the entity to its stored spawn point.
	 */
	respawn() {
		this.x = this.spawnX;
		this.y = this.spawnY;
		this.vx = 0;
		this.vy = 0;
		this.onGround = false;
	}

	/**
	 * Clamps the entity x-position between minimum and maximum values.
	 * @param {number} minX Minimum x-position.
	 * @param {number} maxX Maximum x-position.
	 */
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

	/**
	 * Updates the state of the entity.
	 */
	update() {}

	/**
	 * Draws the entity.
	 */
	draw() {}
}
