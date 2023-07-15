Bangle.loadWidgets();
Bangle.drawWidgets();
var R = Bangle.appRect;
var centerX = R.x + R.w / 2;
var centerY = R.y + R.h / 2;
var drawTimeout;
var draw = function () {
    g.reset().clearRect(R);
    drawCircles();
    drawHands();
    if (drawTimeout)
        clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
    }, 60000 - (Date.now() % 60000));
};
var drawCircles = function () {
    var radius = 5;
    var concentricGap = 10;
    g.setColor(0, 0, 1);
    for (var i = 0;; i++) {
        var r = radius + i * concentricGap;
        if (r >= R.h / 2)
            break;
        for (var j = 0; j < 5; j++)
            g.drawCircle(centerX, centerY, r + j);
    }
};
var drawHands = function () {
    var radius = R.w / 2;
    var now = new Date();
    var minutes = now.getMinutes();
    g.setColor(1, 1, 1);
    var hourAngle = (now.getHours() % 12 + minutes / 60) * 30;
    var hourLength = radius - 10;
    g.drawLine(centerX, centerY, centerX + hourLength * Math.sin(hourAngle * Math.PI / 180), centerY - hourLength * Math.cos(hourAngle * Math.PI / 180));
    var minuteAngle = minutes * 6;
    var minuteLength = radius - 6;
    g.drawLine(centerX, centerY, centerX + minuteLength * Math.sin(minuteAngle * Math.PI / 180), centerY - minuteLength * Math.cos(minuteAngle * Math.PI / 180));
};
draw();
