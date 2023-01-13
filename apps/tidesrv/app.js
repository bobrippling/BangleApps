const filename = "tides.json";

Bangle.setUI({
  mode: "custom",
  back: load,
});

function updateHrm(){
  var px = g.getWidth()/2;
  g.setFontAlign(0,-1)
    .clearRect(0,24,g.getWidth(),80)
    .setFont("6x8")
    .drawString(/*LANG*/"Next " + ("high" || "low") + " at " + when, px, 70); // TODO

  updateScale();

  var str = hrmInfo.bpm || "--";

  g.setFontAlign(0,0)
    .setFontVector(40)
    .setColor(hrmInfo.confidence > 50 ? g.theme.fg : "#888")
    .drawString(str,px,45);

  px += g.stringWidth(str)/2;
  g
    .setFont("6x8")
    .setColor(g.theme.fg);

  g.drawString(/*LANG*/"BPM",px+15,45);
}

const draw = () => {
  g.clear();

  // --------------------------

  g.setColor(g.theme.fg);
  g.reset().setFont("6x8",2).setFontAlign(0,-1);
  g.drawString(/*LANG*/"Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);

  // --------------------------

  hrmOffset++;
  if (hrmOffset>g.getWidth()) {
    let thousands = Math.round(rawMax / 1000) * 1000;
    if (thousands > scale) scale = thousands;

    g.clearRect(0,80,g.getWidth(),g.getHeight());
    updateScale();

    hrmOffset=0;
    lastHrmPt = [-100,0];
  }
  if (rawMax < v.raw) {
    rawMax = v.raw;
  }
  y = E.clip(btm-(8+v.filt/3000),btm-24,btm);
  g.setColor(1,0,0).fillRect(hrmOffset,btm, hrmOffset, y);
  y = E.clip(btm - (v.raw/scale*84),84,btm);
  g.setColor(g.theme.fg).drawLine(lastHrmPt[0],lastHrmPt[1],hrmOffset, y);
  lastHrmPt = [hrmOffset, y];
  if (counter !==undefined) {
    counter = undefined;
    g.clearRect(0,24,g.getWidth(),g.getHeight());
    updateHrm();
  }
}

Bangle.loadWidgets();
Bangle.drawWidgets();
