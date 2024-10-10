let distNotify;
const Exs = {
	state: {
		active: true,
		duration: 0,
		thisGPS: {
			time: 0,
		}
	},
	stats: {
		pacec: {
			getString() { return "pace0"; }
		},
		dist: {
			on(type, cb) {
				if(type === "notify")
					distNotify = cb;
			}
		}
	},
	stop() { this.state.active = false; },
	start() { this.state.active = true; },
	resume() { this.state.active = true; },
};

const Layout = function() {
	// called with new
	this.time = { label: "" };
	this.pace = { label: "" };
};
Layout.prototype.render = function() {};
Layout.prototype.forgetLazyState = function() {};

Bangle = {
	cbs: {},
	on(what, cb){
		if(!this.cbs[what])
			this.cbs[what] = [];
		this.cbs[what].push(cb);
	},
	loadWidgets(){},
	drawWidgets(){},
	getStepCount(){return 3;},
	setGPSPower(){},
};
setWatch = () => {};
BTN1 = {};

g = {
	clearRect(){},
};

Storage = {
	readJSON(){return undefined;}
};

E = {
	on(){},
	sum(ar) {
		return ar.reduce((t, x) => t + x, 0);
	}
};

Uint8Array.prototype.set = () => {};

Object.prototype.on = function(evt, cb) {
	const what = `#on${evt}`;
	if(!this[what]) this[what] = [];
	this[what].push(cb);
};
Object.prototype.emit = function(evt, arg) {
	const what = `#on${evt}`;
	for(const cb of this[what] || [])
		cb(arg);
};

require = require2 = (orig_require => module => {
	switch (module) {
		case "exstats":
			return require("../../modules/exstats");
		case "Layout":
			return Layout;
		case "Storage":
			return Storage;
		case "time_utils":
			return {
				decodeTime: ()=>({
					h: 1, m: 2, s: 3,
				}),
			};
	}
	return orig_require(module);
})(require);

TESTING = 1;
const app = require("./app");

clearTimeout(app.get().drawTimeout);

let toggle = false;
setInterval(() => {
	const fix = {
		fix: true,
		speed: 1.3,
	};

	if(toggle){
		fix.lat = 55.047919;
		fix.lon = -1.447465;
	}else{
		fix.lat = 55.048011;
		fix.lon = -1.446963;
	}
	toggle ^= 1;

	for(const cb of Bangle.cbs["GPS"]){
		cb(fix);
	}
}, 500);
