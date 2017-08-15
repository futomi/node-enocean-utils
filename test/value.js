'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils.js');

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

enocean.teach({
	"id"  : "00 00 04 00 58 FD",
	"eep" : "A5-04-01",
	"name": "Pressac Mini Temperature & Humidity"
});

enocean.teach({
	"id"  : "00 00 04 01 81 4D",
	"eep" : "A5-09-04",
	"name": "Pressac CO2, Temperature and Humidity Sensor"
});


enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-known', (telegram) => {
	let value = telegram['message']['value']; // Value object
	let eep = telegram['message']['eep'];
	if(eep === 'D5-00-01') {
		// STM250J Door Sensor
		console.log('[' + eep + '] STM250J Door Sensor');
		if(value['contact'] === 1) {
			console.log('- The door was closed.');
		} else if(value['contact'] === 0) {
			console.log('- The door was opened.');
		}
	} else if(eep === 'F6-02-04') {
		// ESM210R Rocker Switch Single
		console.log('[' + eep + '] ESM210R Rocker Switch Single');
		if(value['pressed'] === 1) {
			console.log('- ' + value['button'] + ' was pressed.');
		} else if(value['pressed'] === 0) {
			console.log('- ' + value['button'] + ' was released.');
		}
	} else if(eep === 'A5-04-01') {
		// Pressac Mini Temperature & Humidity
		console.log('[' + eep + '] Pressac Mini Temperature & Humidity');
		console.log('- Humidity          : ' + value['humidity'] + ' %');
		console.log('- Temperature       : ' + value['temperature'] + ' ℃');
	} else if(eep === 'A5-09-04') {
		// Pressac CO2, Temperature and Humidity Sensor
		console.log('[' + eep + '] Pressac CO2, Temperature and Humidity Sensor');
		console.log('- Humidity          : ' + value['humidity'] + ' %');
		console.log('- CO2 concentration : ' + value['concentration'] + ' ppm');
		console.log('- Temperature       : ' + value['temperature'] + ' ℃');
	}
});