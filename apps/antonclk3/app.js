"use strict";
{
    const locale = require("locale");
    const clock_info = require("clock_info");
    let showSeconds = false;
    let drawTimeout;
    const queueDraw = () => {
        if (drawTimeout)
            clearTimeout(drawTimeout);
        const interval = showSeconds ? 1000 : 60000;
        drawTimeout = setTimeout(() => {
            drawTimeout = undefined;
            draw();
        }, interval - (Date.now() % interval));
    };
    const draw = () => {
        const x = g.getWidth() / 2;
        const y = g.getHeight() / 2 - 24;
        g.reset()
            .setColor(g.theme.bg)
            .fillRect(Bangle.appRect);
        const date = new Date();
        const timeStr = locale.time(date, 1);
        g.setFontAlign(0, 0)
            .setFont("Vector")
            .setColor(g.theme.fg)
            .drawString(timeStr, x, y);
        const secStr = showSeconds
            ? date.getSeconds() + "s "
            : "";
        const dateStr = locale.date(date, 0).toUpperCase() +
            "\n" +
            secStr + locale.dow(date, 0).toUpperCase();
        g.setFontAlign(0, 0)
            .setFont("6x8", 2)
            .drawString(dateStr, x, y + 56);
        clockInfoMenus.forEach(menu => menu.redraw());
        queueDraw();
    };
    const onStateChange = () => {
        showSeconds = !Bangle.isLocked();
        draw();
    };
    const clockInfoDraw = (_item, info, options) => {
        const { fg, bg } = g.theme;
        const hl = "#0ff";
        g.reset()
            .setFont("6x8")
            .setBgColor(bg)
            .setColor(options.focus ? hl : fg);
        const textWidth = g.stringWidth(info.text.toString());
        const gap = 10;
        const totalWidth = gap + (info.img ? 24 : 0) + textWidth;
        g.clearRect(options.x, options.y, options.x + options.w, options.y + options.h);
        if (info.img) {
            const x = options.x + options.w / 2 - totalWidth / 2;
            g.setFontAlign(-1, 0)
                .drawImage(info.img, x + 2, options.y + 2)
                .drawString(info.text, x + 24 + gap, options.y + 12);
        }
        else {
            g.setFontAlign(0, 0)
                .drawString(info.text, options.x + 24 + gap, options.y + 12);
        }
    };
    const clockInfoItems = clock_info.load();
    const clockInfoMenus = [
        {
            x: 0,
            y: 142,
            w: 88,
            h: 30,
            draw: clockInfoDraw,
        },
        {
            x: 88,
            y: 142,
            w: 88,
            h: 30,
            draw: clockInfoDraw,
        }
    ]
        .map(menu => clock_info.addInteractive(clockInfoItems, menu));
    Bangle.on('lock', onStateChange);
    onStateChange();
    g.clear();
    draw();
    Bangle.setUI({
        mode: "custom",
        clock: true,
        remove: () => {
            Bangle.removeListener('lock', onStateChange);
            clockInfoMenus.forEach(menu => menu.remove());
            if (drawTimeout)
                clearTimeout(drawTimeout);
            drawTimeout = undefined;
        },
    });
    Bangle.loadWidgets();
    Bangle.drawWidgets();
}
