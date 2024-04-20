Bangle.on("swipe", (lr, ud) => {
	Bangle.http(
		"get.com", {
			body: { lr, ud },
		}
	).then(resp => {
		Terminal.println(`\rdone: ${resp}\x1b[J`);
	});
	Terminal.print("wait...");
})
