"use strict";
{
    var app = "antonclk3";
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
    var draw_1 = function () {
        var x = g.getWidth() / 2;
        var y = g.getHeight() / 2 - 24;
        g.reset()
            .setColor(g.theme.bg)
            .fillRect(Bangle.appRect);
        var date = new Date();
        var timeStr = locale_1.time(date, 1);
        g.setFontAlign(0, 0)
            .setFont("Vector")
            .setColor(g.theme.fg)
            .drawString(timeStr, x, y);
        var secStr = showSeconds_1
            ? date.getSeconds() + "s "
            : "";
        var dateStr = locale_1.date(date, 0).toUpperCase() +
            "\n" +
            secStr + locale_1.dow(date, 0).toUpperCase();
        g.setFontAlign(0, 0)
            .setFont("6x8", 2)
            .drawString(dateStr, x, y + 56);
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
    var clockInfoItems_1 = clock_info_1.load();
    var clockInfoMenus_1 = [
        {
            app: app,
            x: 0,
            y: 142,
            w: 88,
            h: 30,
            draw: clockInfoDraw,
        },
        {
            app: app,
            x: 88,
            y: 142,
            w: 88,
            h: 30,
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
    Bangle.loadWidgets();
    Bangle.drawWidgets();
}
