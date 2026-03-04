import { Entity } from "./Entity.js";

export class Enemy extends Entity {
	/**
	 * Creates an enemy with a default hitbox.
	 * @param {number} x Start position on the x-axis.
	 * @param {number} y Start position on the y-axis.
	 * @param {number} hitW Hitbox width.
	 * @param {number} hitH Hitbox height.
	 */
	constructor(x, y, hitW = 32, hitH = 32) {
		super(x, y, hitW, hitH);
	}

	/**
	 * Updates enemy logic.
	 */
	update() {}

	/**
	 * Draws the enemy.
	 */
	draw() {}
}
