import { Entity } from "./Entity.js";

export class Enemy extends Entity {
	constructor(x, y, hitW = 32, hitH = 32) {
		super(x, y, hitW, hitH);
	}

	update() {}

	draw() {}
}
