{
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

  const lock = () => {
    Bangle.setLocked(true);

    // Bangle.setLCDPower(false); // turns screen entirely off
    const { lockTimeout } = Bangle.getOptions();
    Bangle.setLCDTimeout(0.1);
    setTimeout(() => {
      Bangle.setLCDTimeout(lockTimeout / 1000);
    }, 0.5);
  }

  Bangle.on("lockunlock", Bangle.drawWidgets);

  Bangle.on('swipe', (lr, ud) => {
    if (ud > 0) {
      lock();
    }
  });

  // Bangle.on('touch', (btn, pos) => {
  //   const x = pos.x, y = pos.y;
  //   const wid = WIDGETS.lockunlock;
  //   // console.log("onTouch(", { btn, pos }, `), x: ${wid.x} - ${wid.x + 14}, y: ${wid.y} - ${wid.y + 24}`);
  //   if(wid.x <= x && x < wid.x + 14
  //   && wid.y <= y && y < wid.y + 24)
  //   {
  //     lock();
  //   }
  // });
}
