let FritzEmu;
(async () => {
	let fb = await import('fritzdect-aha-nodejs');
	FritzEmu = fb.FritzEmu;
})().catch((err) => console.error(err));

console.log(FritzEmu);

function fireUpEmu() {
	let testfile = 'testFBall.xml';
	let port = 3333;
	const emulation = new FritzEmu(testfile, port, false);
	emulation.setupHttpServer(function() {});
}

fireUpEmu();
