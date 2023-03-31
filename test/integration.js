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

const xmlDevicesGroups = String(fs.readFileSync(path.join(__dirname, './data/') + 'test_api_response.xml'));
//var xmlDevicesGroups = fs.readFileSync('./test.xml');

const xmlTemplate = String(fs.readFileSync(path.join(__dirname, './data/') + 'template_answer.xml'));
const xmlTriggerlist = String(fs.readFileSync(path.join(__dirname, './data/') + 'getriggerlistinfos.xml'));
const xmlTempStats = String(fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_temp_answer.xml'));
const xmlPowerStats = String(fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_power_answer.xml'));
const xmlColorDefaults = String(fs.readFileSync(path.join(__dirname, './data/') + 'color_defaults.xml'));
const hkr_batt = fs.readFileSync(path.join(__dirname, './data/') + 'hkr_response.xml');
const guestWlan = fs.readFileSync(path.join(__dirname, './data/') + 'guest_wlan_form.xml');

const devices2json = parser.xml2json(xmlDevicesGroups);
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
const templates2json = parser.xml2json(xmlTemplate);
let templates = [].concat((templates2json.templatelist || {}).template || []).map(function(template) {
	// remove spaces in AINs
	template.identifier = template.identifier.replace(/\s/g, '');
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
			xmlTempStats,
			xmlPowerStats,
			guestWlan,
			hkr_batt
		);
		emulation.setupHttpServer(function() {});
	});
	var fritz;
	// if promise is returned = success
	it('should create a new fritzdect instance', function() {
		fritz = new Fritz('admin', 'password', 'http://localhost:3333', false, null);
	});
	it('login success returns true', async () => {
		const result = await fritz.login_SID();
		//assert.equal(result, true);
		expect(result).to.equal(true);
	});
	it('function getUserPermissions()', async () => {
		const result = await fritz.getUserPermissions();
		//console.log('getUserPermissions result', result);
		const permissions =
			'<Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access>';
		expect(result).to.eql(permissions);
		console.log('----------------------');
	});
	it('function getdevicelistinfos', async () => {
		const result = await fritz.getDeviceListInfos();
		const devicesgroups = parser.xml2json(result);
		let devices = [].concat((devicesgroups.devicelist || {}).device || []).map((device) => {
			// remove spaces in AINs
			device.identifier = device.identifier.replace(/\s/g, '');
			return device;
		});
		let groups = [].concat((devicesgroups.devicelist || {}).group || []).map((group) => {
			// remove spaces in AINs
			group.identifier = group.identifier.replace(/\s/g, '');
			return group;
		});
		const devicelist = apiresponse['devicelist'];
		expect({ version: '1', device: devices, group: groups }).to.eql(devicelist);
	});
	it('function gettemplatelistinfos', async () => {
		const result = await fritz.getTemplateListInfos();
		//console.log('gettemplatelistinfos result', result);
		const templatelist = apiresponse['templatelist'];
		expect(parser.xml2json(result).templatelist).to.eql(templatelist);
	});
	it('function gettriggerlistinfos', async () => {
		const result = await fritz.getTriggerListInfos();
		//console.log('gettriggerlistinfos result', result);
		const triggerlist = apiresponse['triggerlist'];
		expect(parser.xml2json(result).trigger).to.eql(triggerlist);
	});
	it('function getcolordefaults', async () => {
		const result = await fritz.getColorDefaults();
		//console.log('getcolordefaults result', result);
		const colordefaults = parser.xml2json(xmlColorDefaults);
		expect(parser.xml2json(result)).to.eql(colordefaults);
		//expect(result).to.eql(xmlColorDefaults);
	});
	it('function getdeviceinfos', async () => {
		let ain = '087610006161';
		const result = await fritz.getDeviceInfos(ain);
		const deviceinfo = apiresponse['devicelist']['device'].filter(
			(device) => device.hasOwnProperty('switch') && device.identifier === ain
		);
		expect(parser.xml2json(result)).to.eql({ device: deviceinfo[0] });
	});
	it('function getbasicdevicestats Temp', async () => {
		let ain = '119600642220';
		const result = await fritz.getBasicDeviceStats(ain);
		const basicdevicestats = parser.xml2json(xmlTempStats);
		expect(parser.xml2json(result)).to.eql(basicdevicestats);
	});
	it('function getbasicdevicestats Power', async () => {
		let ain = '087610006161';
		const result = await fritz.getBasicDeviceStats(ain);
		const basicdevicestats = parser.xml2json(xmlPowerStats);
		expect(parser.xml2json(result)).to.eql(basicdevicestats);
	});
	it('function getswitchstate', async () => {
		let ain = '087610006161';
		const result = await fritz.getSwitchState(ain);
		//console.log('getSwitchState result', result);
		const switchstate = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
			.map((device) => device.switch.state);
		expect(result).to.equal(switchstate[0]);
	});
	it('function getswitchpresent', async () => {
		let ain = '087610006161';
		const result = await fritz.getSwitchPresent(ain);
		//console.log('getswitchpresent result', result);
		const switchpresent = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('present') && device.identifier === ain)
			.map((device) => device.present);
		expect(result).to.equal(switchpresent[0]);
	});
	it('function getswitchpower', async () => {
		let ain = '087610006161';
		const result = await fritz.getSwitchPower(ain);
		//console.log('getswitchpower result', result);
		const switchpower = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('powermeter') && device.identifier === ain)
			.map((device) => device.powermeter.power);
		expect(result).to.equal(switchpower[0]);
	});
	it('function getswitchenergy', async () => {
		let ain = '087610006161';
		const result = await fritz.getSwitchEnergy(ain);
		//console.log('getswitchenergy result', result);
		const switchenergy = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('powermeter') && device.identifier === ain)
			.map((device) => device.powermeter.energy);
		expect(result).to.equal(switchenergy[0]);
	});
	it('function getswitchname', async () => {
		let ain = '087610006161';
		const result = await fritz.getSwitchName(ain);
		//console.log('getswitchname result', result);
		const switchname = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('name') && device.identifier === ain)
			.map((device) => device.name);
		expect(result).to.equal(String(switchname[0]));
	});
	it('function gettemperature', async () => {
		let ain = '119600642220';
		const result = await fritz.getTemperature(ain);
		//console.log('gettemperature result', result);
		const temperature = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('temperature') && device.identifier === ain)
			.map((device) => device.temperature.celsius);
		expect(result).to.equal(temperature[0]);
	});
	it('function gethkrtsoll', async () => {
		let ain = '119600642220';
		const result = await fritz.getHkrTsoll(ain);
		//console.log('gethkrtsoll result', result);
		const tsoll = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
			.map((device) => device.hkr.tsoll);
		expect(result).to.equal(tsoll[0]);
	});
	it('function gethkrkomfort', async () => {
		let ain = '119600642220';
		const result = await fritz.getHkrKomfort(ain);
		//console.log('gethkrkomfort result', result);
		const komfort = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
			.map((device) => device.hkr.komfort);
		expect(result).to.equal(komfort[0]);
	});
	it('function gethkrabsenk', async () => {
		let ain = '119600642220';
		const result = await fritz.getHkrAbsenk(ain);
		//console.log('gethkrabsenk result', result);
		const absenk = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
			.map((device) => device.hkr.absenk);
		expect(result).to.equal(absenk[0]);
	});
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
	it('applytemplate', async () => {
		let ain = 'tmp6F0093-39091EED0';
		const result = await fritz.applyTemplate(ain);
		expect(result).to.equal('60010');
	});
	it('setswitchon', async () => {
		let ain = '34:31:C1:AB:68:53';
		const result = await fritz.setSwitchOn(ain);
		expect(result).to.equal('1');
	});
	it('setswitchoff', async () => {
		let ain = '34:31:C1:AB:68:53';
		const result = await fritz.setSwitchOff(ain);
		expect(result).to.equal('0');
	});
	it('setswitchtoggle', async () => {
		let ain = 'EF:C4:CC-900';
		const result = await fritz.setSwitchToggle(ain);
		expect(result).to.equal('0');
	});
	it('setsimpleonoff&onoff=1', async () => {
		let ain = '13077 0018976-1';
		const result = await fritz.setSimpleOn(ain);
		expect(result).to.equal('1');
	});
	it('setsimpleonoff&onoff=0', async () => {
		let ain = '123456789012-1';
		const result = await fritz.setSimpleOff(ain);
		expect(result).to.equal('0');
	});
	it('setsimpleonoff&onoff=2', async () => {
		let ain = 'grp9CEFB6-3BDCFFC80';
		const result = await fritz.setSimpleToggle(ain);
		expect(result).to.equal('0');
	});
	it('sethkrtsoll', async () => {
		let ain = '11960 0642220';
		let temp = 23;
		const result = await fritz.setTempTarget(ain, temp);
		expect(result).to.equal('46');
	});
	it('sethkrboost', async () => {
		let ain = '11795 1033333';
		const now = new Date();
		let time = now.getTime() + 86410;
		let result = null;
		try {
			result = await fritz.setHkrBoost(ain, time);
		} catch (error) {
			result = error;
		}
		expect(result.status).to.equal(500);
	});
	it('sethkrwindowopen', async () => {
		let ain = '11795 1033333';
		let time = 1677538435;
		const result = await fritz.setWindowOpen(ain, time);
		expect(result).to.equal('1677538435');
	});
	it('setblind', async () => {
		let ain = '14276 0470139-1';
		let target = 55;
		const result = await fritz.setBlind(ain, target);
		expect(result).to.equal('55');
	});
	it('setlevel', async () => {
		let ain = '142760470139-1';
		let level = 55;
		const result = await fritz.setLevel(ain, level);
		expect(result).to.equal('55');
	});
	it('setlevelpercentage', async () => {
		let ain = '142760470139-1';
		let level = 23;
		const result = await fritz.setLevelPercentage(ain, level);
		expect(result).to.equal('23');
	});
	it('setcolortemperature', async () => {
		let ain = '13077 0018976-1';
		let temp = 3600;
		const result = await fritz.setColorTemperature(ain, temp);
		expect(result).to.equal('3400');
	});
	it('setcolor', async () => {
		let ain = '13077 0018976-1';
		let saturation = 188;
		let hue = 17;
		const result = await fritz.setColor(ain, saturation, hue);
		expect(result).to.equal('OK');
	});
	/*
	it('setunmappedcolor', async () => {
		let ain = '13077 0018976-1';
		let saturation = 200;
		let hue = 22;
		const result = await fritz.setUnmappedColor(ain, saturation, hue);
		expect(result).to.equal(false);
	});
	*/
	it('settriggeractive', async () => {
		let ain = 'trg695F2D-3CBF1DC25';
		let active = '1';
		try {
			const result = await fritz.setTriggerActive(ain, active);
		} catch (error) {
			console.log(error);
			expect(result).to.equal(active);
		}
	});

	it('logout success returns true', async () => {
		const result = await fritz.logout_SID();
		expect(result).to.equal(false);
	});
});

// alte Fb prüfen
