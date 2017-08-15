'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils');
enocean.teach({
	'id'  : '00 00 04 00 8f e0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});
let device = enocean.getDeviceInfo('00 00 04 00 8f e0');
if(device) {
	console.log(device['id']);
	console.log(device['name']);
}