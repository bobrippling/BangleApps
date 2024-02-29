// TODO: modules/{ClockFace,Layout,{date,time}_utils}

{
  const FONT_NAME = "Teletext5x9Ascii";
  const FONT_SIZE = 5;
  const OFF = -10;
  const FONT_NAME2 = "4x6";
  const FONT_SIZE2 = 3
  const OFF2 = 8;

  const app = "antonclk3";
  const locale = require("locale");
  const clock_info = require("clock_info");
  // const Layout = require("Layout");
  // const ClockFace = require("ClockFace");

  // let x: string = locale.meridian(new Date());
  // let y: string = require("sched").getAlarms()[0]!.msg;

  // const use = (...args: any[]) => args.length;
  // use(x, y);

  // const layout = new Layout();
  // const clockface = new ClockFace();

  let showSeconds = false;
  let drawTimeout: number | undefined;

  const queueDraw = () => {
    if (drawTimeout) clearTimeout(drawTimeout);

    const interval = showSeconds ? 1000 : 60000;

    drawTimeout = setTimeout(
      () => {
        drawTimeout = undefined;
        draw();
      },
      interval - (Date.now() % interval)
    );
  };

  const pad2 = n => (n < 10 ? "0" : "") + n;

  const draw = () => {
    // queue asap, to avoid interrupts causing us to never reach this
    queueDraw();

    const x = Bangle.appRect.w / 2;
    const y = g.getHeight() / 2 - 24;

    g.reset()
      .setColor(g.theme.bg)
      .fillRect(Bangle.appRect);

    /* show widget areas * /
    g.setColor("#888")
      .fillRect(0, 0, g.getWidth(), 23)
      .fillRect(0, g.getHeight() - 23, g.getWidth(), g.getHeight())
      .reset();
    /* */

    const date = new Date();
    const topStr = (showSeconds ? date.getSeconds() + "s, " : "")
      + date.getDate() + " / " + locale.month(date, 1);

    g
        .setColor(g.theme.fg)
        .setFont(FONT_NAME2, FONT_SIZE2)
        .setFontAlign(0, -1)
        .drawString(topStr, x, Bangle.appRect.y + OFF2);

    const hr = date.getHours();
    const timeStr = `${pad2(hr)}:${pad2(date.getMinutes())}`;
    g
        .setFont(FONT_NAME, FONT_SIZE)
        .setFontAlign(0, 0)
        .drawString(timeStr, x, Bangle.appRect.y + Bangle.appRect.h / 2 + OFF);

    clockInfoMenus.forEach(menu => menu.redraw());
  };

  const onStateChange = () => {
    showSeconds = !Bangle.isLocked();
    draw();
  };

  const clockInfoDraw: ClockInfo.Options["draw"] = (_item, info, options) => {
    const { fg, bg } = g.theme;
    const hl = "#0ff";

    g.reset()
      .setFont("6x8")
      .setBgColor(bg)
      .setColor(options.focus ? hl : fg);

    // TODO: check info.short?
    // TODO: draw _item.name?
    const textWidth = g.stringWidth(info.text.toString());
    const gap = 10;
    const totalWidth = gap + (info.img ? 24 : 0) + textWidth;

    g.clearRect(
      options.x,
      options.y,
      options.x + options.w,
      options.y + options.h
    );

    if (info.img) {
      const x = options.x + options.w / 2 - totalWidth / 2;

      g.setFontAlign(-1, 0)
        .drawImage(info.img, x + 2, options.y + 2)
        .drawString(info.text, x + 24 + gap, options.y + 12 /* 24/2 */);

    } else {
      g.setFontAlign(0, 0)
        .drawString(info.text, options.x + 24 + gap, options.y + 12 /* 24/2 */);
    }
  };

  Bangle.loadWidgets();
  const clockInfoItems = clock_info.load();
  const clockInfoMenus = [
    {
      app,
      x: 0,
      y: 132,
      w: 88,
      h: 40,
      draw: clockInfoDraw,
    },
    {
      app,
      x: 88,
      y: 132,
      w: 88,
      h: 40,
      draw: clockInfoDraw,
    }
  ]
    .map(menu => clock_info.addInteractive(clockInfoItems, menu)); // FIXME? this causes ../clock_info/lib.js to register its swipeHandler twice

  Bangle.on('lock', onStateChange);
  onStateChange();

  g.clear();
  draw();

  Bangle.setUI({
    mode: "custom",
    clock: true,
    // back: () => {},
    // touch: () => {},
    // swipe: () => {},
    // drag: () => {},
    // btn: (n: number) => {},
    remove: () => {
      Bangle.removeListener('lock', onStateChange);

      clockInfoMenus.forEach(menu => menu.remove());

      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
    },
  });

  Bangle.drawWidgets();
}
