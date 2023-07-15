{
    var app_1 = "drained";
    if (typeof drainedInterval !== "undefined")
        drainedInterval = clearInterval(drainedInterval);
    Bangle.setLCDBrightness(0);
    var powerNoop_1 = function () { return false; };
    var forceOff = function (name) {
        var _a;
        if ((_a = Bangle._PWR) === null || _a === void 0 ? void 0 : _a[name])
            Bangle._PWR[name] = [];
        Bangle["set".concat(name, "Power")](0, app_1);
        Bangle["set".concat(name, "Power")] = powerNoop_1;
    };
    forceOff("GPS");
    forceOff("HRM");
    try {
        NRF.disconnect();
        NRF.sleep();
    }
    catch (e) {
        console.log("couldn't disable ble: ".concat(e));
    }
    Bangle.removeAllListeners();
    clearWatch();
    Bangle.setOptions({
        wakeOnFaceUp: 0,
        wakeOnTouch: 0,
        wakeOnTwist: 0,
    });
    var nextDraw_1;
    var draw_1 = function () {
        var x = g.getWidth() / 2;
        var y = g.getHeight() / 2 - 48;
        var date = new Date();
        var timeStr = require("locale").time(date, 1);
        var dateStr = require("locale").date(date, 0).toUpperCase() +
            "\n" +
            require("locale").dow(date, 0).toUpperCase();
        var x2 = x + 6;
        var y2 = y + 66;
        g.reset()
            .clearRect(Bangle.appRect)
            .setFont("Vector", 55)
            .setFontAlign(0, 0)
            .drawString(timeStr, x, y)
            .setFont("Vector", 24)
            .drawString(dateStr, x2, y2)
            .drawString("".concat(E.getBattery(), "%"), x2, y2 + 48);
        if (nextDraw_1)
            clearTimeout(nextDraw_1);
        nextDraw_1 = setTimeout(function () {
            nextDraw_1 = undefined;
            draw_1();
        }, 60000 - (date.getTime() % 60000));
    };
    var reload_1 = function () {
        Bangle.setUI({
            mode: "custom",
            remove: function () {
                if (nextDraw_1)
                    clearTimeout(nextDraw_1);
                nextDraw_1 = undefined;
            },
            btn: function () {
                E.showPrompt("Restore watch to full power?").then(function (v) {
                    if (v) {
                        drainedRestore();
                    }
                    else {
                        reload_1();
                    }
                });
            }
        });
        Bangle.CLOCK = 1;
        g.clear();
        draw_1();
    };
    reload_1();
    Bangle.emit("drained", E.getBattery());
    var _a = require("Storage").readJSON("".concat(app_1, ".setting.json"), true) || {}, _b = _a.keepStartup, keepStartup_1 = _b === void 0 ? true : _b, _c = _a.restore, restore_1 = _c === void 0 ? 20 : _c, _d = _a.exceptions, exceptions = _d === void 0 ? ["widdst.0"] : _d;
    function drainedRestore() {
        if (!keepStartup_1) {
            try {
                eval(require('Storage').read('bootupdate.js'));
            }
            catch (e) {
                console.log("error restoring bootupdate:" + e);
            }
        }
        load();
    }
    var checkCharge_1 = function () {
        if (E.getBattery() < restore_1)
            return;
        drainedRestore();
    };
    if (Bangle.isCharging())
        checkCharge_1();
    Bangle.on("charging", function (charging) {
        if (charging)
            checkCharge_1();
    });
    if (!keepStartup_1) {
        var storage = require("Storage");
        for (var _i = 0, exceptions_1 = exceptions; _i < exceptions_1.length; _i++) {
            var boot = exceptions_1[_i];
            try {
                var js = storage.read("".concat(boot, ".boot.js"));
                if (js)
                    eval(js);
            }
            catch (e) {
                console.log("error loading boot exception \"".concat(boot, "\": ").concat(e));
            }
        }
    }
}
