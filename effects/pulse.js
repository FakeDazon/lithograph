var { Timer, Time } = require("../timing.js");
var { Color, GradientStop, Gradient } = require("../util.js");
var { Effect } = require("./effectBase.js");

class PulseEffect extends Effect {
	constructor(fixture, props) {
		super(fixture, props);
		this.gradient = props.gradient;
		this.width = props.width || fixture.length;
		this.pixelStart = props.pixelStart || 0;
		if (this.pixelStart == "random") {
			this.pixelStart = Math.floor(
				Math.random() * (fixture.length - this.width)
			);
		}
		this.pixelData = new Array(fixture.length).fill(new Color([0, 0, 0]));
		//check if gradient is array, if so set gradient to random of array
		if (Array.isArray(this.gradient)) {
			this.gradient =
				this.gradient[Math.floor(Math.random() * this.gradient.length)];
		}
	}
	effectLoop(progress) {
		var color = this.gradient.getColorAt(progress);
		this.pixelData = new Array(this.fixture.length).fill(new Color([0, 0, 0]));
		//for width, set pixels to color
		for (var i = 0; i < this.width; i++) {
			this.pixelData[this.pixelStart + i] = color;
		}
		this.fixture.insertData(this.pixelData);
	}
}

module.exports = { PulseEffect: PulseEffect };
