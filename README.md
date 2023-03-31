# fritzdect-aha-nodejs
NodeJS library using the AHA api of Fritzbox to control DECT smarthome devices.
This library is not, in any way, affiliated or related to AVM GmbH. Use it at your own risk.

[![NPM version](http://img.shields.io/npm/v/fritzdect-aha-nodejs.svg)](https://npmjs.org/package/fritzdect-aha-nodejs)
[![NPM Downloads](https://img.shields.io/npm/dm/fritzdect-aha-nodejs.svg?style=flat)](https://npmjs.org/package/fritzdect-aha-nodejs)
![Test and Release](https://github.com/foxthefox/fritzdect-aha-nodejs/workflows/Test%20and%20Release/badge.svg)

## Features
* javascript methods to use DECT-devices connected to fritzbox
* control switches, thermostats, blinds, lamps
* control grouped devices
* control configured templates
* uses new session ID method (FW >7.25), as well as the fallback to md5 method
* no production dependencies for the API itself (the dependencies are only related to the testscript and emulation)

## Getting Started
it is an common js module with named exports.
it exposes 2 classes, the API (Fritz) and an emulation (FritzEmu)

### Prerequisites
* nodejs >14 (may work with older version, but tested with > 14)
* fritzbox FW >6.69

### Installing
install the released version on npm with
```javascript
npm install fritzdect-aha-nodejs
```

### Usage
```javascript
const Fritz = require('fritzdect-aha-nodejs').Fritz;
fritz = new Fritz(yourUsername, yourPassword, your.Url || '', your.options || {});

//your async function
...
const login = await fritz.login_SID();
const devicelistinfos = await fritz.getDeviceListInfos();
const logout = await fritz.logout_SID();
...
```
see the example.js.

## API Calls
### reading FB

|API-call|implements FB call|
|:----|:---|
|getDeviceListInfos()| getdevicelistinfos|
|getTemplateListInfos()| gettemplatelistinfos|
|getTriggerListInfos()| gettriggerlistinfos|
|getColorDefaults()| getcolordefaults|	
|getDeviceInfos(ain)| getdeviceinfos|
|getBasicDeviceStats(ain)| getbasicdevicestats|
|getSwitchList()| getswitchlist|
|getSwitchState(ain)| getswitchstate|
|getSwitchPresent(ain)| getswitchpresent|
|getSwitchPower(ain)| getswitchpower|
|getSwitchEnergy(ain)| getswitchenergy|
|getSwitchName(ain)| getswitchname|
|getTemperature(ain)| gettemperature|
|getHkrTsoll(ain)| gethkrtsoll|
|getHkrKomfort(ain)| gethkrkomfort|
|getHkrAbsenk(ain)| gethkrabsenk|
|getUserPermissions()| not a FB call|

### commands to FB

|API-call|implements FB call|
|:----|:---|
|applyTemplate(ain)| applytemplate|
|setSwitchOn(ain)| setswitchon|
|setSwitchOff(ain)| setswitchoff|
|setSwitchToggle(ain)| setswitchtoggle|
|setSimpleOn(ain)| setsimpleonoff&onoff=1|
|setSimpleOff(ain)| setsimpleonoff&onoff=0|
|setSimpleToggle(ain)| setsimpletoggle|
|setTempTarget(ain, temp)| sethkrtsoll|
|setHkrBoost(ain, time)| sethkrboost|
|setWindowOpen(ain, time)| sethkrwindowopen|
|setBlind(ain, target)| setblind|
|setLevel(ain, level)| setlevel|
|setColorTemperature(ain, temp)| setcolortemperature|
|setColor(ain, saturation, hue)| setcolor|
|setUnmappedColor(ain, saturation, hue)| setunmappedcolor|
|setTriggerActive(ain, active)| settriggeractive|

## Changelog
### 2.1.0
* (foxthefox) new functions setSimpleToggle, setLevelPercentage, setUnmappedColor, setTriggerActive
* (foxthefox) remove spaces in ain if part of the function call
* (foxthefox) extended testing
* (foxthefox) debug-flag as new parameter during instantiation

### 2.0.1
* (foxthefox) forgotten "this." at apiresponse

### 2.0.0
* (foxthefox) recfactoring of emulation (breaking change), variable testdata can be injected

### 1.0.2
* (foxthefox) use of User-Agent
* (foxthefox) implementation of new commands from API version 1.57

### 1.0.1
* (foxthefox) skipping usage of chalk, figlet

### 1.0.0
* (foxthefox) common js module with 2 named exports Fritz and FritzEmu

### 0.9.1
* (foxthefox) first release on npm as ESM

## License
Copyright (c) 2022-2023 foxthefox <foxthefox@wysiwis.net>

see [LICENSE.md]

 ## Acknowledgments
 * based on ideas of https://github.com/andig/fritzapi

 ## Related Projects
 * ioBroker.fritzdect

