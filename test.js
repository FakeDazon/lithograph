var udp = require("dgram");
//color class object
class Color {
	constructor(r, g, b) {
		//if array is passed, set to rgb and set r g and b
		if (Array.isArray(r)) {
			this.rgb = r;
			this.r = r[0];
			this.g = r[1];
			this.b = r[2];
		} else {
			this.r = r;
			this.g = g;
			this.b = b;
			//array
			this.rgb = [r, g, b];
		}
	}
	//hueShift
	hueShift(h) {
		//convert to hsv
		var hsv = this.rgbToHsv(this.rgb);
		//shift hue
		hsv[0] += h / 100;
		//convert back to rgb
		var rgb = this.hsvToRgb(hsv);
		//return new color object
		this.rgb = rgb;
		this.updateRgb();
	}
	gradientShift(d) {
		var hsv = this.rgbToHsv(this.rgb);
		var rgb = this.hsvToRgb([hsv[0], hsv[1], hsv[2] + d]);
		this.rgb = womp.getColorAt(d / 100).rgb;
		this.updateRgb();
	}
	//rgbToHsv
	rgbToHsv(rgb) {
		var r = rgb[0],
			g = rgb[1],
			b = rgb[2];
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		var h,
			s,
			v = max;
		var d = max - min;
		s = max == 0 ? 0 : d / max;
		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}
		return [h, s, v];
	}
	//hsvToRgb
	hsvToRgb(hsv) {
		var h = hsv[0],
			s = hsv[1],
			v = hsv[2];
		var r, g, b;
		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0:
				(r = v), (g = t), (b = p);
				break;
			case 1:
				(r = q), (g = v), (b = p);
				break;
			case 2:
				(r = p), (g = v), (b = t);
				break;
			case 3:
				(r = p), (g = q), (b = v);
				break;
			case 4:
				(r = t), (g = p), (b = v);
				break;
			case 5:
				(r = v), (g = p), (b = q);
				break;
		}
		return [r, g, b];
	}
	updateRgb() {
		this.r = this.rgb[0];
		this.g = this.rgb[1];
		this.b = this.rgb[2];
	}
	updateArr() {
		this.rgb = [this.r, this.g, this.b];
	}
}
//gradient stop object
class GradientStop {
	constructor(color, position) {
		this.color = color;
		this.position = position;
	}
}
//gradient object. takes in an array of stop objects
class Gradient {
	constructor(stops) {
		this.stops = stops;
	}
	//returns a color object at a given position
	getColorAt(position) {
		var stop1 = this.stops[0];
		var stop2 = this.stops[1];
		for (var i = 0; i < this.stops.length; i++) {
			if (this.stops[i].position >= position) {
				stop2 = this.stops[i];
				break;
			}
			stop1 = this.stops[i];
		}
		var color = new Color([0, 0, 0]);
		var range = stop2.position - stop1.position;
		var pos = (position - stop1.position) / range;
		color.r = lerp(stop1.color.r, stop2.color.r, pos);
		color.g = lerp(stop1.color.g, stop2.color.g, pos);
		color.b = lerp(stop1.color.b, stop2.color.b, pos);
		color.updateArr();
		return color;
	}
}

var blackToWhiteGradient = new Gradient([
	new GradientStop(new Color([255, 255, 255]), 0),
	new GradientStop(new Color([255, 0, 100]), 0.1),
	new GradientStop(new Color([255, 72, 0]), 0.35),
	new GradientStop(new Color([0, 0, 0]), 0.9),
	new GradientStop(new Color([0, 0, 0]), 1),
]);
var womp = new Gradient([
	new GradientStop(new Color([0, 0, 0]), 0),
	new GradientStop(new Color([255, 72, 0]), 0.5),
	new GradientStop(new Color([0, 0, 0]), 1),
]);

// --------------------creating a udp server --------------------

// creating a udp server
var server = udp.createSocket("udp4");

// emits when any error occurs
server.on("error", function (error) {
	console.log("Error: " + error);
	server.close();
});
server.bind(2222);

setTimeout(function () {
	server.close();
}, 8000);

// -------------------- udp client ----------------

var buffer = require("buffer");

// creating a client socket
var client = udp.createSocket("udp4");

//buffer msg
var data = Buffer.from([
	1, 1, 0, 255, 255, 255, 1, 255, 255, 255, 2, 255, 255, 255, 3, 255, 255, 255,
	4, 255, 255, 255,
]);
var pixels = 98;
var pixelData = new Array(pixels).fill(new Color([0, 0, 0]));
var effectLength = 5;
var offset = 0;
var offsetLimit = 100;
var frequency = 8; //how many pixels it takes for the loop to complete
var speed = 20;
var timeout = 1;

function updateData() {
	var effectLength = 5;
	var pixel = new Color([255, 0, 0]);
	pixel.gradientShift(offset);

	//add to beginning of array and remove last elem
	pixelData.unshift(pixel);
	pixelData.pop();
	send();
}
var blurAmt = 1;

function send() {
	data = [1, 1];
	blur(blurAmt).forEach((px, index) => {
		data.push(index, ...px.rgb);
	});
	data = Buffer.from(data);
	client.send(data, 21324, "192.168.254.134", function (error) {
		if (error) {
			client.close();
		} else {
		}
	});
}

send();
tick();

function tick() {
	updateData();
	offset += speed / frequency;
	offset = clampLoop(offset, 0, offsetLimit);
	setTimeout(tick, 1);
}
function clampLoop(num, min, max) {
	if (num > max) {
		return min;
	} else if (num < min) {
		return max;
	} else {
		return num;
	}
}

function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

function randomColor() {
	return [randomInRange(0, 255), randomInRange(0, 255), randomInRange(0, 255)];
}

function randomInRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//blur pixel data using gaussian filter. if there is no pixel data, dont include it in the average
function blur(blurAmt) {
	var blurred = [];
	for (var i = 0; i < pixelData.length; i++) {
		var sum = [0, 0, 0];
		var count = 0;
		for (var j = -blurAmt; j <= blurAmt; j++) {
			if (pixelData[i + j]) {
				sum[0] += pixelData[i + j].r;
				sum[1] += pixelData[i + j].g;
				sum[2] += pixelData[i + j].b;
				count++;
			}
		}
		blurred.push(new Color([sum[0] / count, sum[1] / count, sum[2] / count]));
	}
	return blurred;
}
function lerp(a, b, t) {
	return a * (1 - t) + b * t;
}
