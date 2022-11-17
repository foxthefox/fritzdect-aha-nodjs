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
* uses new session ID method (FW >7.25), as well as the fallback to md5 method as a fallback
* no production dependencies

## Getting Started
it is an ES module with named exports

### Prerequisites
* nodejs >14 (may work with older version, but tested with > 14)
* fritzbox FW >6.69

### Installing
install the released version on npm with
```javascript
npm install fritzdect-aha-nodejs
```

## Changelog
### **WORK IN PROGRESS**
* 0.9.1 (foxthefox) first release on npm
* 0.0.1 (foxthefox) initial release

## License
Copyright (c) 2022 foxthefox <foxthefox@wysiwis.net>

see [LICENSE.md]

 ## Acknowledgments
 * based on ideas of https://github.com/andig/fritzapi

 ## Related Projects
 * ioBroker.fritzdect

