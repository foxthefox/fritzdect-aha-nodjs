import { FritzEmu } from '../index.js';

const emulation = new FritzEmu();
emulation.setupHttpServer(function() {});
