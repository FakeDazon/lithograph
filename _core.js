var Fixture = require("./fixture.js");
var { Timer } = require("./timing.js");
var { Color, GradientStop, Gradient } = require("./util.js");
var { PulseEffect } = require("./effects/pulse.js");

var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding("utf8");

// on any data into stdin
stdin.on("data", function (key) {
	// ctrl-c ( end of text )
	if (key === "\u0003") {
		process.exit();
	}
	//if key is spacebar
	if (key === " ") {
		basspulse([pulseGradient,pinkPulse,purplePulse]);
	} else if (key === "q") {
		randompulse(pulseGradient2);
	} else if (key === "w") {
		randompulse(pulseGradient3);
	}
});

var fixture = new Fixture("Fixture", "192.168.254.134", 21324);
var rainbow = new Gradient([
	new GradientStop(0, new Color([255, 0, 0])),
	new GradientStop(0.166, new Color([255, 255, 0])),
	new GradientStop(0.333, new Color([0, 255, 0])),
	new GradientStop(0.5, new Color([0, 255, 255])),
	new GradientStop(0.666, new Color([0, 0, 255])),
	new GradientStop(0.833, new Color([255, 0, 255])),
	new GradientStop(1, new Color([255, 0, 0])),
]);

var pulseGradient = new Gradient([
	new GradientStop(0, new Color([255, 0, 0])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
var pinkPulse = new Gradient([
	new GradientStop(0, new Color([255, 0, 255])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
var purplePulse = new Gradient([
	new GradientStop(0, new Color([125, 0, 255])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
//pulse gradient yellow
var pulseGradient2 = new Gradient([
	new GradientStop(0, new Color([0, 255, 255])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
//pulse gradient green
var pulseGradient3 = new Gradient([
	new GradientStop(0, new Color([0, 255, 0])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
//pulse gradient cyan
var pulseGradient4 = new Gradient([
	new GradientStop(0, new Color([0, 255, 255])),
	new GradientStop(1, new Color([0, 0, 0])),
]);
let i = 0;
function randompulse(g) {
	i++;
	new PulseEffect(fixture, {
		gradient: g || pulseGradient3,
		type: "instant",
		duration: 20,
		width: 10,
		pixelStart: "random",
	});
}
function basspulse(g) {
	i++;
	new PulseEffect(fixture, {
		gradient: g || pulseGradient3,
		type: "instant",
		duration: 200,
	});
}
