export class Time {
	constructor(targetFps = 60) {
		this.targetFps = targetFps;
		this.step = 1 / targetFps;
		this.lastTs = 0;
		this.accumulator = 0;
		this.maxFrameTime = 0.1;
	}

	reset(ts = 0) {
		this.lastTs = ts;
		this.accumulator = 0;
	}

	tick(ts) {
		if (this.lastTs === 0) {
			this.lastTs = ts;
			return 0;
		}
		const delta = Math.min(this.maxFrameTime, (ts - this.lastTs) / 1000);
		this.lastTs = ts;
		this.accumulator += delta;
		let updates = 0;
		while (this.accumulator >= this.step) {
			this.accumulator -= this.step;
			updates++;
		}
		return updates;
	}
}
