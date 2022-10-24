//nodejs event emitter

var events = require("events");
var eventEmitter = new events.EventEmitter();
var time = 0;
//emit every 1ms
setInterval(function () {
	time++;
	eventEmitter.emit("tick");
}, 1);

class Time {
	static getTime() {
		return time;
	}
}

//set max listeners to 0
eventEmitter.setMaxListeners(0);

//export
module.exports = { Timer: eventEmitter, Time: Time };
