{
    var FONT_NAME_1 = "Teletext5x9Ascii";
    var FONT_SIZE_1 = 5;
    var OFF_1 = -10;
    var FONT_NAME2_1 = "4x6";
    var FONT_SIZE2_1 = 3;
    var OFF2_1 = 8;
    var app_1 = "antonclk3";
    var locale_1 = require("locale");
    var clock_info_1 = require("clock_info");
    var showSeconds_1 = false;
    var drawTimeout_1;
    var queueDraw_1 = function () {
        if (drawTimeout_1)
            clearTimeout(drawTimeout_1);
        var interval = showSeconds_1 ? 1000 : 60000;
        drawTimeout_1 = setTimeout(function () {
            drawTimeout_1 = undefined;
            draw_1();
        }, interval - (Date.now() % interval));
    };
    var pad2_1 = function (n) { return (n < 10 ? "0" : "") + n; };
    var draw_1 = function () {
        var x = Bangle.appRect.w / 2;
        var y = g.getHeight() / 2 - 24;
        g.reset()
            .setColor(g.theme.bg)
            .fillRect(Bangle.appRect);
        var date = new Date();
        var topStr = (showSeconds_1 ? date.getSeconds() + "s, " : "")
            + date.getDate() + " / " + locale_1.month(date, 1);
        g
            .setColor(g.theme.fg)
            .setFont(FONT_NAME2_1, FONT_SIZE2_1)
            .setFontAlign(0, -1)
            .drawString(topStr, x, Bangle.appRect.y + OFF2_1);
        var hr = date.getHours();
        var timeStr = "".concat(pad2_1(hr), ":").concat(pad2_1(date.getMinutes()));
        g
            .setFont(FONT_NAME_1, FONT_SIZE_1)
            .setFontAlign(0, 0)
            .drawString(timeStr, x, Bangle.appRect.y + Bangle.appRect.h / 2 + OFF_1);
        clockInfoMenus_1.forEach(function (menu) { return menu.redraw(); });
        queueDraw_1();
    };
    var onStateChange_1 = function () {
        showSeconds_1 = !Bangle.isLocked();
        draw_1();
    };
    var clockInfoDraw = function (_item, info, options) {
        var _a = g.theme, fg = _a.fg, bg = _a.bg;
        var hl = "#0ff";
        g.reset()
            .setFont("6x8")
            .setBgColor(bg)
            .setColor(options.focus ? hl : fg);
        var textWidth = g.stringWidth(info.text.toString());
        var gap = 10;
        var totalWidth = gap + (info.img ? 24 : 0) + textWidth;
        g.clearRect(options.x, options.y, options.x + options.w, options.y + options.h);
        if (info.img) {
            var x = options.x + options.w / 2 - totalWidth / 2;
            g.setFontAlign(-1, 0)
                .drawImage(info.img, x + 2, options.y + 2)
                .drawString(info.text, x + 24 + gap, options.y + 12);
        }
        else {
            g.setFontAlign(0, 0)
                .drawString(info.text, options.x + 24 + gap, options.y + 12);
        }
    };
    Bangle.loadWidgets();
    var clockInfoItems_1 = clock_info_1.load();
    var clockInfoMenus_1 = [
        {
            app: app_1,
            x: 0,
            y: 132,
            w: 88,
            h: 40,
            draw: clockInfoDraw,
        },
        {
            app: app_1,
            x: 88,
            y: 132,
            w: 88,
            h: 40,
            draw: clockInfoDraw,
        }
    ]
        .map(function (menu) { return clock_info_1.addInteractive(clockInfoItems_1, menu); });
    Bangle.on('lock', onStateChange_1);
    onStateChange_1();
    g.clear();
    draw_1();
    Bangle.setUI({
        mode: "custom",
        clock: true,
        remove: function () {
            Bangle.removeListener('lock', onStateChange_1);
            clockInfoMenus_1.forEach(function (menu) { return menu.remove(); });
            if (drawTimeout_1)
                clearTimeout(drawTimeout_1);
            drawTimeout_1 = undefined;
        },
    });
    Bangle.drawWidgets();
}
