var { Timer, Time } = require("../timing.js");
class Effect {
	constructor(fixture, props) {
		this.fixture = fixture;
		this.type = props.type;
		if (this.type == "timed") {
			this.start = props.start;
		} else if (this.type == "instant") {
			this.start = performance.now();
		}
		if (props.end) {
			this.end = props.end;
			this.duration = this.end - this.start;
		} else if (props.duration) {
			this.duration = props.duration;
			this.end = this.start + this.duration;
		}
		this.listener = this.tick.bind(this);
		Timer.addListener("tick", this.listener);
	}
	tick() {
		var t = performance.now();
		//animation progress
		if (t >= this.start && t <= this.end) {
			var progress = (t - this.start) / this.duration;
			this.effectLoop(progress);
		}
		if (t > this.end) {
			this.effectLoop(1);
			this.destroy();
		}
	}
	destroy() {
		Timer.removeListener("tick", this.listener);
	}
}

module.exports = { Effect: Effect };
