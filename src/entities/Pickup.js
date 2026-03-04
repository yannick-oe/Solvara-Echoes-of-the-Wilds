import { Entity } from "./Entity.js";

export class Pickup extends Entity {
	constructor(x, y, hitW = 24, hitH = 24) {
		super(x, y, hitW, hitH);
	}

	update() {}

	draw() {}
}
