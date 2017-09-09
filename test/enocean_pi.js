'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils.js');

// Teach the information of Enocean devices
enocean.teach({
	"id"  : "00 00 FE FB DF 0F",
	"eep" : "F6-02-01",
	"name": "ESK 300 - PTM 21x Push button transmitter module"
});

// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor({
	'path':'/dev/ttyS0'
}).then((gateway) => {
	console.log('The USB gateway was activated successfully:');
	console.log(JSON.stringify(gateway, null, '  '));
	// Set an event listener for 'data-known' events
	enocean.on('data-known', (telegram) => {
		let message = telegram['message'];
		console.log(message['device']['name'] + ': ' + message['desc']);
	});
}).catch((error) => {
	console.error(error);
});
