const FritzEmu = require('../index.js').FritzEmu;
const fs = require('fs');

const path = require('path');
console.log('PATH ist ' + path.join(__dirname, './data/'));

const xmlDevicesGroups = fs.readFileSync(path.join(__dirname, './data/') + 'test_api_response.xml');
const xmlTemplate = fs.readFileSync(path.join(__dirname, './data/') + 'template_answer.xml');
const xmlTempStat = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_temp_answer.xml');
const xmlTriggerlist = fs.readFileSync(path.join(__dirname, './data/') + 'getriggerlistinfos.xml');
const xmlPowerStats = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_power_answer.xml');
const xmlColorDefaults = fs.readFileSync(path.join(__dirname, './data/') + 'color_defaults.xml');
const hkr_batt = fs.readFileSync(path.join(__dirname, './data/') + 'hkr_response.xml');
const guestWlan = fs.readFileSync(path.join(__dirname, './data/') + 'guest_wlan_form.xml');

const emulation = new FritzEmu(
	3333,
	false,
	xmlDevicesGroups,
	xmlTemplate,
	xmlTriggerlist,
	xmlColorDefaults,
	xmlTempStat,
	xmlPowerStats,
	guestWlan,
	hkr_batt
);
emulation.setupHttpServer(function() {});
