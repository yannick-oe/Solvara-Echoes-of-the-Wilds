import { Entity } from "./Entity.js";

export class Pickup extends Entity {
	/**
	 * Creates a pickup object with a default hitbox.
	 * @param {number} x Start position on the x-axis.
	 * @param {number} y Start position on the y-axis.
	 * @param {number} hitW Hitbox width.
	 * @param {number} hitH Hitbox height.
	 */
	constructor(x, y, hitW = 24, hitH = 24) {
		super(x, y, hitW, hitH);
	}

	/**
	 * Updates pickup logic.
	 */
	update() {}

	/**
	 * Draws the pickup.
	 */
	draw() {}
}
