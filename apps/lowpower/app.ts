// from boot.js
if(typeof lowpowerInterval !== "undefined")
  lowpowerInterval = clearInterval(lowpowerInterval) as undefined;

// backlight
Bangle.setLCDBrightness(0);

// peripherals
Bangle.setGPSPower = Bangle.setHRMPower = (_val: boolean, _name: string) => false;

// events
Bangle.removeAllListeners();

// clock
let nextDraw: number | undefined;
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2 - 48;

  const date = new Date();

  const timeStr = require("locale").time(date, 1);
  const dateStr = require("locale").date(date, 0).toUpperCase() +
    "\n" +
    require("locale").dow(date, 0).toUpperCase();

  g.reset()
    .clearRect(Bangle.appRect)
    .setFont("Vector", 32)
    .setFontAlign(0, 0)
    .drawString(timeStr, x, y)
    .setFont("Vector", 24)
    .drawString(dateStr, x, y + 56)
    .drawString(`${E.getBattery()}%`, x, y + 104);

  if(nextDraw) clearTimeout(nextDraw);
  nextDraw = setTimeout(() => {
    nextDraw = undefined;
    draw();
  }, 60000 - (date.getTime() % 60000));
};

Bangle.setUI({
  mode: "clock",
  remove: () => {
    if (nextDraw) clearTimeout(nextDraw);
    nextDraw = undefined;
  },
});

g.clear();
draw();