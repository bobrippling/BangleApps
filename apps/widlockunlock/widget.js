Bangle.on("lockunlock", Bangle.drawWidgets);

WIDGETS["lockunlock"] = {
  area: "tl",
  sortorder: 10,
  width: 14,
  draw: w => {
    g.reset()
      .drawImage(
        atob(Bangle.isLocked()
        ? "DBGBAAAA8DnDDCBCBP////////n/n/n//////z/A"
        : "DBGBAAAA8BnDDCBABP///8A8A8Y8Y8Y8A8A//z/A"),
        w.x + 1,
        w.y + 3
      );
  },
};

Bangle.on('touch', (btn, { x, y }) => {
  if(scrlock.x <= x && x < scrlock.x + 14
  && scrlock.y <= y && y < scrlock.y + 24)
  {
    Bangle.setLocked(true);
    Bangle.setLCDPower(false);

    // const { lockTimeout } = Bangle.getOptions();
    // Bangle.setLCDTimeout(0.1);
    // setTimeout(() => {
    //   Bangle.setLCDTimeout(lockTimeout / 1000);
    // }, 0.5);
  }
});
