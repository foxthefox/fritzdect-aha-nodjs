// @ts-nocheck
//server to emulate the fritzbox responses
const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const parser = require('xml2json-light');
const crypto = require('crypto');

const path = require('path');
console.log('PATH ist ' + path.join(__dirname, './data/'));

const xmlDevicesGroups = fs.readFileSync(path.join(__dirname, './data/') + 'test_api_response.xml');
//var xmlDevicesGroups = fs.readFileSync('./test.xml');
const xmlTemplate = fs.readFileSync(path.join(__dirname, './data/') + 'template_answer.xml');
const xmlTempStat = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_temp_answer.xml');
const xmlPowerStats = fs.readFileSync(path.join(__dirname, './data/') + 'devicestat_power_answer.xml');
const xmlColorDefaults = fs.readFileSync(path.join(__dirname, './data/') + 'color_defaults.xml');
const hkr_batt = fs.readFileSync(path.join(__dirname, './data/') + 'hkr_response.xml');
const guestWlan = fs.readFileSync(path.join(__dirname, './data/') + 'guest_wlan_form.xml');

//hashing stuff
const challenge = (4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);
const challenge2 = (4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);
const password = 'password';
const challengeResponse =
	challenge + '-' + crypto.createHash('md5').update(Buffer.from(challenge + '-' + password, 'utf16le')).digest('hex');
const mocksid =
	(4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8) +
	(4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);

//Devices and Groups derved from xmlDevicesGroups
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
//Templates derived from xmlTemplate
const templates2json = parser.xml2json(String(xmlTemplate));
let templates = [].concat((templates2json.templatelist || {}).template || []).map(function(template) {
	// remove spaces in AINs
	// template.identifier = group.identifier.replace(/\s/g, '');
	return template;
});

//apiresponse is the xml file with AINs not having the spaces inside
//used in the response
var apiresponse = {};
apiresponse['devicelist'] = { version: '1', device: devices, group: groups };
apiresponse['templatelist'] = { version: '1', template: templates };
//console.log(apiresponse);

// Functions for reply on the requests

function loginoutAnswerV2(response, sid, method, username, userresponse, request) {
	if (!sid && method == 'GET') {
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
				challenge +
				'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
		);
		response.end();
		return response;
	} else if (!sid && method == 'POST') {
		let body = '';
		request.on('data', (chunk) => {
			body += chunk.toString(); // convert Buffer to string
		});
		request.on('end', () => {
			const form = parse(body);
			console.log('user: ' + form.username);
			console.log('pbkf2 response: ' + form.response);
			// pbkf2 ausrechnen und vergleichen
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
					mocksid +
					'</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights></SessionInfo>'
			);
			response.end();
			return response;
		});
	} else if (sid && method == 'GET') {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
				mocksid +
				'</SID><Challenge>' +
				challenge2 +
				'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
		);
		response.end();
		return response;
	} else if (sid && logout === 1 && method == 'GET') {
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
				challenge2 +
				'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
		);
		response.end();
		return response;
	}
}
function loginoutAnswerV1(response, sid, method, username, userresponse) {
	if (!sid && method == 'GET') {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
				challenge +
				'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
		);
		response.end();
		return response;
	} else if (!sid && username === 'admin') {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
				challenge +
				'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
		);
		response.end();
		return response;
	} else if (!sid && username === 'admin' && userresponse == challengeResponse) {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
				mocksid +
				'</SID><Challenge>' +
				challenge2 +
				'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights></SessionInfo>'
		);
		response.end();
		return response;
	} else if (sid) {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
				mocksid +
				'</SID><Challenge>' +
				challenge2 +
				'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
		);
		response.end();
		return response;
	} else if (sid == mocksid && logout == 1) {
		//check the URL of the current request
		response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
		response.write(
			'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
				challenge2 +
				'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
		);
		response.end();
		return response;
	}
}

function errorAnswer(response, code) {
	response.statusCode = code;
	response.end();
	return response;
}

function homeautoswitchAnswer(
	response,
	switchcmd,
	ain,
	onoff,
	param,
	endtimestamp,
	colorcmd,
	hue,
	saturation,
	temperature,
	duration,
	target
) {
	switch (switchcmd) {
		case 'getdevicelistinfos':
			const devicelistinfos = apiresponse['devicelist']['device'].concat(apiresponse['devicelist']['group']);
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
			//response.write(String(devicelistinfos));
			response.write(String(xmlDevicesGroups));
			response.end();
			return response;
			break;
		case 'getdeviceinfos':
			const deviceinfos = apiresponse['devicelist']['device'].filter((device) => device.identifier === ain);
			if (deviceinfos) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(deviceinfos));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'gettemplatelistinfos':
			// todo empty templates
			//const templatelistinfos = apiresponse['templatelist']['template']
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
			//response.write(String(templatelistinfo));
			response.write(String(xmlTemplate));
			response.end();
			return response;
			break;
		case 'applytemplate':
			const template = apiresponse['templatelist']['template'].filter(
				(template) => template.hasOwnProperty('identifier') && template.identifier === ain
			);
			if (template) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(template[0].id);
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in templates ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		//alles zu switches
		case 'getswitchlist':
			//check the URL of the current request
			const switchlist = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('switch'))
				.map((device) => device.identifier)
				.concat(
					apiresponse['devicelist']['group']
						.filter((device) => device.hasOwnProperty('switch'))
						.map((device) => device.identifier)
				);
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
			response.write(String(switchlist));
			response.end();
			return response;
			break;
		case 'setswitchon':
		case 'setswitchoff':
		case 'setswitchtoggle':
			const setswitchstate = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
				.map((device) => device.switch.state);
			const setgroupstate = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
				.map((group) => group.switch.state);
			if (setswitchstate) {
				const pos = findAin('device', ain);
				if ((switchcmd = 'setswitchon')) {
					apiresponse.devicelist.device[pos].switch.state = 1;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ '1' ]));
					response.end();
				} else if ((switchcmd = 'setswitchoff')) {
					apiresponse.devicelist.device[pos].switch.state = 0;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ '0' ]));
					response.end();
				} else if ((switchcmd = 'setswitchtoggle')) {
					apiresponse.devicelist.device[pos].switch.state = !setswitchstate;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ "'" + !setswitchstate + "'" ]));
					response.end();
				}
			} else if (setgroupstate) {
				const pos = findAin('group', ain);
				if ((switchcmd = 'setswitchon')) {
					apiresponse.devicelist.group[pos].switch.state = 0;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ '1' ]));
					response.end();
				} else if ((switchcmd = 'setswitchoff')) {
					apiresponse.devicelist.group[pos].switch.state = 1;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ '0' ]));
					response.end();
				} else if ((switchcmd = 'setswitchtoggle')) {
					apiresponse.devicelist.group[pos].switch.state = !setgroupstate;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(JSON.stringify([ "'" + !setgroupstate + "'" ]));
					response.end();
				}
			} else {
				console.log(' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'gettemperature':
			const gettemp = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('temperature') && device.identifier === ain)
				.map((device) => device.temperature.celsius);
			const getgrouptemp = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('temperature') && device.identifier === ain)
				.map((group) => group.temperature.celsius);
			if (gettemp) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(gettemp));
				response.end();
			} else if (getgrouptemp) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(getgrouptemp));
				response.end();
			} else {
				console.log(' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'getswitchname':
		case 'getswitchpresent':
			const item = switchcmd.replace('getswitch', '');
			const switchvalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
				.map((device) => device[item]);
			const groupvalue = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
				.map((group) => group[item]);
			if (switchvalue) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(JSON.stringify([ "'" + switchvalue + "'" ]));
				response.end();
			} else if (groupvalue) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(JSON.stringify([ "'" + groupvalue + "'" ]));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'getswitchstate':
			const getswitchstate = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
				.map((device) => device.switch.state);
			const getgroupstate = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
				.map((group) => group.switch.state);
			if (getswitchstate) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(JSON.stringify([ "'" + getswitchstate + "'" ]));
				response.end();
			} else if (groupstate) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(JSON.stringify([ "'" + getgroupstate + "'" ]));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'getswitchpower':
		case 'getswitchenergy':
			const item2 = switchcmd.replace('getswitch', '');
			const getswitchmeter = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
				.map((device) => device.powermeter[item2]);
			const getgroupmeter = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
				.map((group) => group.powermeter[item2]);
			if (getswitchmeter.length > 0) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				//response.write(JSON.stringify([ "'" + getswitchmeter + "'" ]));
				response.write(String(getswitchmeter));
				response.end();
			} else if (getgroupmeter.length > 0) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				//response.write(JSON.stringify([ "'" + getgroupmeter + "'" ]));
				response.write(String(getgroupmeter));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				//verursacht StatusCode400
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		//alles KHR
		case 'gethkrtsoll':
		case 'gethkrkomfort':
		case 'gethkrabsenk':
			const item3 = switchcmd.replace('gethkr', '');
			const gethkrtemp = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr[item3]);
			const getgrouphkrtemp = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr[item3]);
			if (gethkrtemp) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(gethkrtemp));
				response.end();
			} else if (getgrouphkrtemp) {
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(getgrouphkrtemp));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'sethkrtsoll':
			console.log('tsoll = ' + param);
			const sethkrtemp = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr.tsoll);
			const setgrouphkrtemp = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr.tsoll);
			if (sethkrtemp) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].hkr.tsoll = param;
				response.statusCode = 200;
				response.end();
			} else if (setgrouphkrtemp) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].hkr.tsoll = param;
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', '->  did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		//different
		case 'getbasicdevicestats':
			// todo prüfen ob gruppen statistik haben können
			const thermostat = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr.tsoll);
			const groupthermo = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr.tsoll);
			const switcher = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr.tsoll);
			const groupswitcher = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr.tsoll);
			if (thermostat || groupthermo) {
				//check the URL of the current request
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(xmlTempStat));
				response.end();
			} else if (switcher || groupswitcher) {
				//check the URL of the current request
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(xmlPowerStats));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'setsimpleonoff':
			console.log('simple status ' + onoff);
			const simplevalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('simpleonoff') && device.identifier === ain)
				.map((device) => device.simpleonoff.state);
			const groupsimplevalue = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('simpleonoff') && group.identifier === ain)
				.map((group) => group.simpleonoff.state);
			let newstate = null;

			if (simplevalue) {
				if (onoff == 2) {
					newstate = !simplevalue;
				} else {
					//ohne prüfung ob auch 0 oder 1 geschickt wird
					newstate = onoff;
				}
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].simpleonoff.state = newstate;
				response.statusCode = 200;
				response.end();
			} else if (groupsimplevalue) {
				if (onoff == 2) {
					newstate = !groupsimplevalue;
				} else {
					//ohne prüfung ob auch 0 oder 1 geschickt wird
					newstate = onoff;
				}
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].simpleonoff.state = newstate;
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response);
			}
			return response;
			break;
		case 'setlevel':
			console.log('level ' + level);
			const levelvalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('levelcontrol') && device.identifier === ain)
				.map((device) => device.levelcontrol.level);
			const grouplevel = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('levelcontrol') && group.identifier === ain)
				.map((group) => group.levelcontrol.level);
			if (levelvalue) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].levelcontrol.level = level;
				apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = Math.floor(Number(level) / 255 * 100);
				response.statusCode = 200;
				response.end();
			} else if (grouplevel) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].levelcontrol.level = level;
				apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = Math.floor(Number(level) / 255 * 100);
				response.statusCode = 200;
				response.end();
			} else {
				console.log(' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response);
			}
			return response;
			break;
		case 'setlevelpercentage':
			console.log('level ' + level);
			const levelvalueperc = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('levelcontrol') && device.identifier === ain)
				.map((device) => device.levelcontrol.levelpercentage);
			const grouplevelperc = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('levelcontrol') && group.identifier === ain)
				.map((group) => group.levelcontrol.levelpercentage);
			if (levelvalueperc) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].levelcontrol.level = Math.floor(Number(level) / 100 * 255);
				apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = level;
				response.statusCode = 200;
				response.end();
			} else if (grouplevelperc) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].levelcontrol.level = Math.floor(Number(level) / 100 * 255);
				apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = level;
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'setcolor':
			console.log('colorcmd ' + colorcmd);
			console.log('hue ' + hue);
			console.log('saturation ' + saturation);
			console.log('additional cmd duration' + duration);
			const colorvalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('colorcontrol') && device.identifier === ain)
				.map((device) => device.colorontrol[cmd]);
			const groupcolor = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('colorcontrol') && group.identifier === ain)
				.map((group) => group.colorcontrol[cmd]);
			const newvalue = hue || saturation;
			if (colorvalue) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].colorcontrol[cmd] = newvalue;
				response.statusCode = 200;
				response.end();
			} else if (groupcolor) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].colorcontrol[cmd] = newvalue;
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'setcolortemperature':
			console.log('temperature ' + temperature);
			const settempvalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('colorcontrol') && device.identifier === ain)
				.map((device) => device.colorontrol.temperature);
			const setgrouptemp = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('colorcontrol') && group.identifier === ain)
				.map((group) => group.colorcontrol.temperature);
			if (settempvalue) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].colorcontrol.temperature = temperature;
				response.statusCode = 200;
				response.end();
			} else if (setgrouptemp) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].colorcontrol.temperature = temperature;
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'getcolordefaults':
			//wird unabhängig von Lampen geschickt
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
			response.write(String(xmlColorDefaults));
			response.end();
			return response;
			break;
		case 'sethkrboost':
			console.log('endtimestamp ' + endtimestamp);
			const hkrboost = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr.boostactiveendtime);
			const groupboost = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr.boostactiveendtime);
			if (endttimestamp > now) {
				endtimepstamp = '';
			}
			if (hkrboost) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].hkr.boostactiveendtime = endtimestamp;
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(endtimestamp));
				response.end();
			} else if (groupboost) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].hkr.boostactiveendtime = endtimestamp;
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(endtimestamp));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'sethkrwindowopen':
			console.log('endtimestamp ' + endtimestamp);
			const hkrwindow = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
				.map((device) => device.hkr.windowopenactiveendtime);
			const groupwindow = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
				.map((group) => group.hkr.windowopenactiveendtime);
			if (endttimestamp > now) {
				endtimepstamp = '';
			}
			if (hkrwindow) {
				const pos = findAin('device', ain);
				apiresponse.devicelist.device[pos].hkr.windowopenactiveendtime = endtimestamp;
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(endtimestamp));
				response.end();
			} else if (groupwindow) {
				const pos = findAin('group', ain);
				apiresponse.devicelist.group[pos].hkr.windowopenactiveendtime = endtimestamp;
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(endtimestamp));
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'setblind':
			console.log('target ' + target);
			const blindvalue = apiresponse['devicelist']['device']
				.filter((device) => device.hasOwnProperty('blind') && device.identifier === ain)
				.map((device) => device.blind.mode);
			const groupblind = apiresponse['devicelist']['group']
				.filter((group) => group.hasOwnProperty('blind') && group.identifier === ain)
				.map((group) => group.blind.mode);
			if (blindvalue) {
				response.statusCode = 200;
				response.end();
			} else if (groupblind) {
				response.statusCode = 200;
				response.end();
			} else {
				console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
				response = errorAnswer(response, 400);
			}
			return response;
			break;
		case 'setname':
			response.statusCode = 200;
			response.end();
			return response;
			break;
		case 'setmetadata':
			break;
		case 'gettriggerlistinfo':
			break;
		case 'settriggeractive':
			break;
		case 'setmappedcolor':
			break;
		case 'setcolortemperature':
			break;
		case 'addcolorleveltemplate':
			break;
		case 'startulesubscription':
			break;
		case 'getsubscriptionstate':
			break;
		default:
			console.log('\x1b[31m', 'switchcmd no case found ' + switchcmd);
			response = errorAnswer(response, 400);
			return response;
			break;
	}
}
// helper function
function findAin(type, ain) {
	let position = null;
	if (type === 'device') {
		for (let i = 0; i < apiresponse['devicelist']['device'].length; i++) {
			if (apiresponse['devicelist']['device'][i].identifier === ain) {
				position = i;
				break;
			}
		}
	} else if (type === 'group') {
		for (let i = 0; i < apiresponse['devicelist']['device'].length; i++) {
			if (apiresponse['devicelist']['device'][i].identifier === ain) {
				position = i;
				break;
			}
		}
	}
	return position;
}

// the emulation class
let server;
class FritzEmu {
	constructor(testfile, port, debugmode) {
		this.testfile = testfile;
		this.emuport = port;
		this.debugmode = debugmode;
		this.deviceresponse = null;
	}
	// S7WebAPI
	setupHttpServer(callback) {
		console.log('\x1b[33m', '  _____ ____       _    _   _    _  ');
		console.log('\x1b[33m', ' |  ___| __ )     / \\  | | | |  / \\   ');
		console.log('\x1b[33m', ' | |_  |  _ \\    / _ \\ | |_| | / _ \\  ');
		console.log('\x1b[33m', ' |  _| | |_) |  / ___ \\|  _  |/ ___ \\ ');
		console.log('\x1b[33m', ' |_|   |____/  /_/   \\_\\_| |_/_/   \\_\\ ');
		console.log('\x1b[32m', ' _____                  _       _   _     ');
		console.log('\x1b[32m', '| ____| _ __ ___  _   _| | __ _| |_(_) ___  _ __  ');
		console.log('\x1b[32m', '|  _|  | `_ ` _ \\| | | | |/ _` | __| |/ _ \\| `_ \\ ');
		console.log('\x1b[32m', '| |___ | | | | | | |_| | | (_| | |_| | (_) | | | |');
		console.log('\x1b[32m', '|_____||_| |_| |_|\\__,_|_|\\__,_|\\__|_|\\___/|_| |_|');
		console.log('\x1b[0m');
		//We need a which handles requests and send response
		//Create a server
		server = http.createServer(this.handleHttpRequest);
		//Lets start our server
		server.listen(3333, function() {
			//Callback triggered when server is successfully listening. Hurray!
			console.log('\x1b[34m', 'MOCK HTTP-Server (Fritzbox Emulation) listening on: http://localhost:3333');
			console.log();
			console.log('\x1b[34m', 'for testing, setup in iobroker for second instance admin:password');
			console.log('\x1b[0m', '-------------------------------------------------------------------');
			callback();
		});
	}

	handleHttpRequest(request, response) {
		console.log('HTTP-Server (Fritzbox Emulation): Request: ' + request.method + ' ' + request.url);
		// requesturl zerlegen .split('?')
		// erste Teil ist entweder login oder webservice
		let reqstring = request.url.split('?');
		let switchcmd = null,
			sid = null,
			ain = null,
			onoff = null,
			param = null,
			endtimestamp = null,
			colorcmd = null,
			hue = null,
			saturation = null,
			temperature = null,
			duration = null,
			target = null,
			username = null,
			version = null,
			logout = null,
			userresponse = null;

		let command = reqstring[1].split('&');
		//right part of the http after '?'
		for (let i = 0; i < command.length; i++) {
			let commandsplit = command[i].split('=');
			switch (commandsplit[0]) {
				case 'sid':
					sid = commandsplit[1];
					console.log('\x1b[36m', '-> sid  : ', commandsplit[1]);
					break;
				case 'switchcmd':
					switchcmd = commandsplit[1];
					console.log('\x1b[36m', '-> switchcmd : ', commandsplit[1]);
					break;
				case 'ain':
					ain = commandsplit[1];
					console.log('\x1b[36m', '-> ain : ', commandsplit[1]);
					break;
				case 'ain':
					onoff = commandsplit[1];
					console.log('\x1b[36m', '-> onoff : ', commandsplit[1]);
					break;
				case 'param':
					onoff = commandsplit[1];
					console.log('\x1b[36m', '-> param : ', commandsplit[1]);
					break;
				case 'endtimestamp':
					onoff = commandsplit[1];
					console.log('\x1b[36m', '-> endtimestamp  : ', commandsplit[1]);
					break;
				case 'hue':
					colorcmd = 'hue';
					hue = commandsplit[1];
					console.log('\x1b[36m', '-> hue  : ', commandsplit[1]);
					break;
				case 'saturation':
					colorcmd = 'saturation';
					saturation = commandsplit[1];
					console.log('\x1b[36m', '-> saturation  : ', commandsplit[1]);
					break;
				case 'temperature':
					temperature = commandsplit[1];
					console.log('\x1b[36m', '-> temperature  : ', commandsplit[1]);
					break;
				case 'duration':
					temperature = commandsplit[1];
					console.log('\x1b[36m', '-> duration  : ', commandsplit[1]);
					break;
				case 'target':
					target = commandsplit[1];
					console.log('\x1b[36m', '-> target  : ', commandsplit[1]);
					break;
				case 'version':
					version = commandsplit[1];
					console.log('\x1b[36m', '-> version  : ', commandsplit[1]);
					break;
				case 'username':
					username = commandsplit[1];
					console.log('\x1b[36m', '-> username : ', commandsplit[1]);
					break;
				case 'response':
					response = commandsplit[1];
					console.log('\x1b[36m', '-> response  : ', commandsplit[1]);
					break;
				case 'logout':
					logout = commandsplit[1];
					console.log('\x1b[36m', '-> logout  : ', commandsplit[1]);
					break;
				default:
					break;
			}
		}

		if (reqstring[0] == '/login_sid.lua') {
			if (version == 2) {
				//console.log(request);
				response = loginoutAnswerV2(response, sid, request.method, username, userresponse, request);
			} else {
				response = loginoutAnswerV1(response, sid, request.method, username, userresponse, request);
			}
		} else if (reqstring[0] == '/webservices/homeautoswitch.lua' && sid === mocksid) {
			response = homeautoswitchAnswer(
				response,
				switchcmd,
				ain,
				onoff,
				param,
				endtimestamp,
				colorcmd,
				hue,
				saturation,
				temperature,
				duration,
				target
			);
		} else if (request.url == '/wlan/guest_access.lua?0=0&sid=' + mocksid) {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
			response.write(String(guestWlan));
			response.end();
		} else if (request.url == '/data.lua' && request.method === 'POST') {
			//check the URL of the current request
			let body = '';
			request.on('data', (chunk) => {
				body += chunk.toString(); // convert Buffer to string
			});
			request.on('end', () => {
				const form = parse(body);
				console.log(form);
				if (form.sid === sid && form.xhr === '1' && form.page === 'overview') {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
					response.write(
						JSON.stringify({
							data: {
								naslink: 'nas',
								SERVICEPORTAL_URL:
									'https://www.avm.de/fritzbox-service-portal.php?hardware=156&oem=avm&language=de&country=049&version=84.06.85&subversion=',
								fritzos: {
									Productname: 'FRITZ!Box Fon WLAN 7390',
									NoPwd: false,
									ShowDefaults: false,
									expert_mode: '1',
									nspver_lnk: '/home/pp_fbos.lua?sid=' + sid,
									nspver: '06.85',
									isLabor: false,
									FirmwareSigned: false,
									fb_name: '',
									isUpdateAvail: false,
									energy: '40',
									boxDate: '13:22:00 09.12.2018'
								}
							}
						})
					);
					response.end();
				} else if (
					form.sid === sid &&
					form.xhr === '1' &&
					form.device === '20' &&
					form.oldpage === '/net/home_auto_hkr_edit.lua' &&
					form.back_to_page === '/net/network.lua'
				) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
					response.write(String(hkr_batt));
					response.end();
				}
			});
		} else {
			console.log('\x1b[31m', '->  not supported call ' + request.method + '  ' + request.url);
			response.statusCode = 403;
			response.end();
		}
	}
}

module.exports = FritzEmu;

// ausprobieren bei echter FB ob getswitchname, getswitchpresent, gettemperature auch auf thermostat geht
// gettemperature hat 0.1
// gethkrtemps hat 0,5 Schrittweite
// was kommt bei logout von FB zurück?
