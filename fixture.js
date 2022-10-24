var udp = require("dgram");
var axios = require("axios");
var { Color, GradientStop, Gradient, clamp } = require("./util.js");
var { Timer, Time } = require("./timing.js");

var buffer = require("buffer");

// creating a client socket
class Fixture {
	constructor(name, ip, port) {
		this.name = name || "Fixture";
		this.ip = ip;
		this.port = port;
		this.length = 30;
		this.pixelData = new Array(this.length).fill(new Color([0, 0, 0]));
		this.pixelData;
		this.blurAmt = 0;
		axios
			.get(`http://${this.ip}/json/info`)
			.then(
				function (res) {
					this.length = res.data.leds.count;
					console.log(res.data.leds.count);
					this.clearData();
				}.bind(this)
			)
			.catch((err) => console.log(err));
		console.log(
			"Fixture created: " + this.name + " at " + this.ip + ":" + this.port
		);

		this.client = udp.createSocket("udp4");

		this.data = Buffer.from([1, 1]);

		//eventlistener that always gets called first on a tick and sets all of the data to black
		Timer.prependListener("tick", this.tick.bind(this));
	}
	tick() {
		this.pixelData = new Array(this.length).fill(new Color([0, 0, 0]));
	}
	clearData() {
		this.pixelData = new Array(this.length).fill(new Color([0, 0, 0]));
		this.send();
	}
	updatePixelData(index, color) {
		this.pixelData[index] = color;
		this.send();
	}
	setEveryPixel(color) {
		this.pixelData = new Array(this.length).fill(color);
		this.send();
	}
	insertData(data) {
		data.forEach((px, index) => {
			//add the data to currently existing data while keeping clamped
			var rgb = [
				clamp(this.pixelData[index].r + px.r, 0, 255),
				clamp(this.pixelData[index].g + px.g, 0, 255),
				clamp(this.pixelData[index].b + px.b, 0, 255),
			];
			this.pixelData[index] = new Color(rgb);
		});
		this.send();
	}
	dimEveryPixel(amount) {
		this.pixelData.forEach((pixel) => {
			pixel.dim(amount);
		});
		this.send();
	}
	send() {
		this.data = [1, 1];
		this.blur(this.blurAmt).forEach(
			function (px, index) {
				this.data.push(index, ...px.rgb);
			}.bind(this)
		);
		this.data = Buffer.from(this.data);
		this.client.send(
			this.data,
			this.port,
			this.ip,
			function (error) {
				if (error) {
					this.client.close();
				} else {
				}
			}.bind(this)
		);
	}
	blur() {
		var blurred = [];
		for (var i = 0; i < this.pixelData.length; i++) {
			var sum = [0, 0, 0];
			var count = 0;
			for (var j = -this.blurAmt; j <= this.blurAmt; j++) {
				if (this.pixelData[i + j]) {
					sum[0] += this.pixelData[i + j].r;
					sum[1] += this.pixelData[i + j].g;
					sum[2] += this.pixelData[i + j].b;
					count++;
				}
			}
			blurred.push(new Color([sum[0] / count, sum[1] / count, sum[2] / count]));
		}
		return blurred;
	}
}

//export fixture for use elsewhere
module.exports = Fixture;
