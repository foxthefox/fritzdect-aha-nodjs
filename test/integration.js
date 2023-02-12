const expect = require('chai').expect;
const Fritz = require('../index.js').Fritz;
const FritzEmu = require('../index.js').FritzEmu;

/*Setup*/
const http = require('http');
const fs = require('fs');
//const { parse } = require('querystring');
const parser = require('../lib/xml2json.js');

const crypto = require('crypto');

const path = require('path');
console.log('PATH ist ' + path.join(__dirname, './data/'));

const xmlDevicesGroups = fs.readFileSync(path.join(__dirname, './data/') + 'test_api_response.xml');
//var xmlDevicesGroups = fs.readFileSync('./test.xml');

const xmlTemplate = fs.readFileSync(path.join(__dirname, './data/') + 'template_answer.xml');
const xmlTriggerlist = fs.readFileSync(path.join(__dirname, './data/') + 'getriggerlistinfos.xml');
const xmlTempStat = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_temp_answer.xml');
const xmlPowerStats = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_power_answer.xml');
const xmlColorDefaults = fs.readFileSync(path.join(__dirname, './data/') + 'color_defaults.xml');
const hkr_batt = fs.readFileSync(path.join(__dirname, './data/') + 'hkr_response.xml');
const guestWlan = fs.readFileSync(path.join(__dirname, './data/') + 'guest_wlan_form.xml');

const devices2json = parser.xml2json(String(xmlDevicesGroups));
let devices = [].concat((devices2json.devicelist || {}).device || []).map((device) => {
	// remove spaces in AINs
	device.identifier = device.identifier.replace(/\s/g, '');
	return device;
});
let groups = [].concat((devices2json.devicelist || {}).group || []).map((group) => {
	// remove spaces in AINs
	group.identifier = group.identifier.replace(/\s/g, '');
	return group;
});
const templates2json = parser.xml2json(String(xmlTemplate));
let templates = [].concat((templates2json.templatelist || {}).template || []).map(function(template) {
	// remove spaces in AINs
	// template.identifier = group.identifier.replace(/\s/g, '');
	return template;
});

//apiresponse is the xml file with AINs not having the spaces inside
var apiresponse = {};
apiresponse['devicelist'] = { version: '1', device: devices, group: groups };
apiresponse['templatelist'] = { version: '1', template: templates };

/*Test*/
describe('Test of Fritzdect-AHA-API', () => {
	let port = 3333;
	before('start the FB emulation', () => {
		const emulation = new FritzEmu(
			port,
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
	});
	var fritz;
	// if promise is returned = success
	it('should create a new fritzdect instance', function() {
		fritz = new Fritz('admin', 'password', 'http://localhost:3333', null);
	});
	it('login success returns true', async () => {
		const result = await fritz.login_SID();
		//assert.equal(result, true);
		expect(result).to.equal(true);
	});
	/*
	it('function getdevicelistinfos', async () => {
		const result = await fritz.getDeviceListInfos();
		//console.log('getdevicelistinfos result', JSON.parse(result));
		const devicelist = apiresponse['devicelist'];
		//console.log(switchlist);
		expect(parser.xml2json(result).devicelist).to.eql(devicelist);
	});
	*/
	it('function getswitchlist', async () => {
		const result = await fritz.getSwitchList();
		//console.log('getswitchlist result', result);
		const switchlist = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('switch'))
			.map((device) => device.identifier)
			.concat(
				apiresponse['devicelist']['group']
					.filter((device) => device.hasOwnProperty('switch'))
					.map((device) => device.identifier)
			);
		//FB liefert kein array zurück, sondern ain über Komma getrennt
		//switchlist wäre ein array, über String() wird es vergleichbarer Text
		expect(result).to.eql(String(switchlist));
	});
	it('logout success returns true', async () => {
		const result = await fritz.logout_SID();
		expect(result).to.equal(false);
	});
});

// alte Fb prüfen
// alle exponierten CMDs prüfen
// Inhalte prüfen

/*
var assert = require('assert');
describe('login test', () => {
	const fritz = new Fritz('admin', 'password', 'http://localhost:3333', null);
	it('login success returns true', () => {
		return fritz.login_SID().then((result) => {
			assert.equal(result, true);
		});
	});
});
*/
