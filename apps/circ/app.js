Bangle.loadWidgets();
Bangle.drawWidgets();
var R = Bangle.appRect;
var centerX = R.x + R.w / 2;
var centerY = R.y + R.h / 2;
var drawTimeout;
var draw = function () {
    g.reset().clearRect(R);

    var radius = R.h / 2 - 10;

    for(var quad of quadrants){
        const rect = quad.rect.slice();
        quad.percentage(0.5, rect);
        drawCircumference(radius, rect, quad.colour);
    }

    drawHands(radius);

    if (drawTimeout)
        clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
    }, 60000 - (Date.now() % 60000));
};

var quadrants = {
    tl: {
        colour: "#ff0",
        rect: [0, 0, R.x + R.w/2, R.y + R.h/2],
        percentage: (pct, rect) => rect[2] *= pct,
    },
    tr: {
        colour: "#000",
        rect: [R.x + R.w/2, 0, R.x + R.w, R.y + R.h/2],
        percentage: (pct, rect) => rect[2] *= pct,
    },
    bl: {
        colour: "#0f0",
        rect: [0, R.y + R.h/2, R.x + R.w/2, R.y + R.h],
        percentage: (pct, rect) => rect[2] *= pct,
    },
    br: {
        colour: "#fff",
        rect: [R.x + R.w/2, R.y + R.h/2, R.x + R.w, R.y + R.h],
        percentage: (pct, rect) => rect[2] *= pct,
    },
};

var drawCircumference = function (radius, quadRect, col) {
    g.setColor(col);

    g.setClipRect.apply(g, quadRect);

    for (var j = 0; j < 10; j++)
        g.drawCircle(centerX, centerY, radius - j);

    g.setClipRect(0, 0, g.getWidth(), g.getHeight());
};

var drawHands = function (radius) {
    var now = new Date();
    var minutes = now.getMinutes();
  var minuteWidth = 5;
  var hourWidth = 10;
    g.setColor(1, 1, 1);
    var hourAngle = (now.getHours() % 12 + minutes / 60) * 30;
    var hourLength = radius - 30;
    drawThickLine(centerX, centerY, centerX + hourLength * Math.sin(hourAngle * Math.PI / 180), centerY - hourLength * Math.cos(hourAngle * Math.PI / 180), hourWidth);
    var minuteAngle = minutes * 6;
    var minuteLength = radius - 6;
    drawThickLine(centerX, centerY, centerX + minuteLength * Math.sin(minuteAngle * Math.PI / 180), centerY - minuteLength * Math.cos(minuteAngle * Math.PI / 180), minuteWidth);
};

var drawThickLine = function (x1, y1, x2, y2, width) {
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var offsetX = Math.sin(angle) * width;
    var offsetY = Math.cos(angle) * width;

    for (var i = -width; i <= width; i++) {
        g.drawLine(
            x2 + i * offsetX,
            y2 + i * offsetY,
            x1 + i * offsetX,
            y1 + i * offsetY
        );
    }
}

draw();
