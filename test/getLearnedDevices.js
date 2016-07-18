'use strict';
process.chdir(__dirname);

var enocean = require('../lib/node-enocean-utils');

enocean.teach({
	'id'  : '00 00 04 00 8F E0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});
enocean.teach({
	'id'  : '00 00 04 01 2B B4',
	'eep' : 'A5-07-01',
	'name': 'HM92-01WHC motion detector'
});
enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

var devices = enocean.getLearnedDevices();
for(var id in devices) {
	var device = devices[id];
	var cols = [device['id'], device['eep'], device['name']];
	console.log(cols.join(' | '));
}