'use strict';
process.chdir(__dirname);

var enocean = require('../lib/node-enocean-utils.js');

enocean.teach({
	'id'  : '00 00 04 00 8F E0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});

enocean.teach({
	'id'  : '00 00 00 2C 86 5C',
	'eep' : 'F6-02-04',
	'name': 'ESM210R Rocker Switch Single'
});

enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-known', (telegram) => {
	var value = telegram['message']['value']; // Value object
	var eep = telegram['message']['eep'];
	if(eep === 'D5-00-01') {
		// STM250J Door Sensor
		if(value['contact'] === 1) {
			console.log('The door was closed.');
		} else if(value['contact'] === 0) {
			console.log('The door was opened.');
		}
	} else if(eep === 'F6-02-04') {
		// ESM210R Rocker Switch Single
		if(value['pressed'] === 1) {
			console.log(value['button'] + ' was pressed.');
		} else if(value['pressed'] === 0) {
			console.log(value['button'] + ' was released.');
		}
	}
});