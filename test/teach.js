'use strict';
process.chdir(__dirname);

var enocean = require('../lib/node-enocean-utils.js');

// Teach the information of Enocean devices
enocean.teach({
	'id'  : '00 00 00 2C 86 5C',
	'eep' : 'F6-02-04',
	'name': 'ESM210R Rocker Switch Single'
});
enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor({'path': 'COM7', 'rate': 57600});

// Set an event listener for 'data-known' events
enocean.on('data-known', (telegram) => {
	var message = telegram['message'];
	console.log(message['device']['name'] + ': ' + message['desc']);
});