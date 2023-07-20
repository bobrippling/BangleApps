//{
Bangle.loadWidgets();
Bangle.drawWidgets();

const R = Bangle.appRect;
const centerX = R.x + R.w / 2;
const centerY = R.y + R.h / 2;
let drawTimeout: TimeoutId | undefined;

const draw = () => {
		g.reset().clearRect(R);
		drawCircles();
		drawHands();

		if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = setTimeout(() => {
				drawTimeout = undefined;
				draw();
		}, 60000 - (Date.now() % 60000));
};

const drawCircles = () => {
		const radius = 5;
		const concentricGap = 10;

		g.setColor(0, 0, 1);

		for (let i = 0; ; i++) {
				const r = radius + i * concentricGap;
				if (r >= R.h / 2) break;

				// multiple draws for a thick line
				for (let j = 0; j < 5; j++)
				g.drawCircle(centerX, centerY, r + j);
		}
};

const drawHands = () => {
		const radius = R.w / 2;
		const now = new Date();
		const minutes = now.getMinutes();

		g.setColor(1, 1, 1);

		// 30 degrees per hour
		const hourAngle = (now.getHours() % 12 + minutes / 60) * 30;
		const hourLength = radius - 10;
		g.drawLine(
				centerX,
				centerY,
				centerX + hourLength * Math.sin(hourAngle * Math.PI / 180),
				centerY - hourLength * Math.cos(hourAngle * Math.PI / 180)
		);

		const minuteAngle = minutes * 6;
		const minuteLength = radius - 6;
		g.drawLine(
				centerX,
				centerY,
				centerX + minuteLength * Math.sin(minuteAngle * Math.PI / 180),
				centerY - minuteLength * Math.cos(minuteAngle * Math.PI / 180)
		);
};


draw();

/*
	 Bangle.setUI({
	 mode : "clock",
	 remove : function() {
// Called to unload all of the clock app
if (drawTimeout) clearTimeout(drawTimeout);
drawTimeout = undefined;
delete Graphics.prototype.setFontAnton;
}
});
*/
//}
