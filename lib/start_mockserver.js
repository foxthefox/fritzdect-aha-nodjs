const FritzEmu = require('../index.js').FritzEmu;

const emulation = new FritzEmu();
emulation.setupHttpServer(function() {});
