'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils.js');

// Teach the information of Enocean devices

enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});
enocean.teach({
	'id'  : '00 00 00 2C BD 6F',
	'eep' : 'F6-02-04',
	'name': 'OPTEX CSW-S1-J Wall Switch'
});
enocean.teach({
	'id'  : '00 00 00 2E 22 8B',
	'eep' : 'F6-02-04',
	'name': 'OPTEX CSW-S2-J Wall Switch'
});
enocean.teach({
	'id'  : '00 00 04 00 F0 67',
	'eep' : 'A5-07-01',
	'name': 'OPTEX CPI-J Occupancy Sensor'
});
enocean.teach({
	'id'  : '00 00 00 2C 86 7E',
	'eep' : 'F6-02-04',
	'name': 'X3100HB-W-R-928 Rocker Switch Single'
});
enocean.teach({
	'id'  : '00 00 00 2C 86 5C',
	'eep' : 'F6-02-04',
	'name': 'ESM210R Rocker Switch Single'
});
enocean.teach({
	'id'  : '00 00 00 29 91 94',
	'eep' : 'F6-02-04',
	'name': 'X3200HB-W-R-928 Rocker Switch Double'
});
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
	"id"  : "00 00 04 00 58 FD",
	"eep" : "A5-04-01",
	"name": "Pressac Mini Temperature & Humidity"
});
enocean.teach({
	"id"  : "00 00 04 01 81 4D",
	"eep" : "A5-09-04",
	"name": "Pressac CO2, Temperature and Humidity Sensor"
});
enocean.teach({
	"id"  : "00 00 00 2E 58 FA",
	"eep" : "F6-02-04",
	"name": "EASYFIT EWSDJ Rocker Switch Double"
});
enocean.teach({
	"id"  : "00 00 00 2E 58 AF",
	"eep" : "F6-02-04",
	"name": "EASYFIT EWSSJ Rocker Switch Single"
});
enocean.teach({
	"id"  : "00 00 04 01 11 6C",
	"eep" : "A5-02-05",
	"name": "ETM501J Beacon"
});
enocean.teach({
	"id"  : "00 00 05 00 21 3C",
	"eep" : "D5-00-01",
	"name": "ETM502J Vibration sensor"
});
enocean.teach({
	"id"  : "00 00 04 00 4E 5D",
	"eep" : "A5-04-01",
	"name": "Pressac Mini Temperature & Humidity (2)"
});

/*
enocean.teach({
	"id"  : "00 00 01 80 BA 56",
	"eep" : "A5-02-05",
	"name": "ESK 300 - STM 33x Self-powered temperature sensor"
});
enocean.teach({
	"id"  : "00 00 FE FB DF 0F",
	"eep" : "F6-02-01",
	"name": "ESK 300 - PTM 21x Push button transmitter module"
});
enocean.teach({
	"id"  : "00 00 01 A0 AC 80",
	"eep" : "F6-02-01",
	"name": "ESK 300 - ECO 200 & PTM 330 Push Button Generator"
});
enocean.teach({
	"id"  : "00 00 01 82 30 61",
	"eep" : "A5-04-01",
	"name": "Pressac Mini Temperature & Humidity 868MHz"
});

enocean.teach({
	"id"  : "00 00 01 80 B9 80",
	"eep" : "A5-02-05",
	"name": "ESK 300U - STM 33x Self-powered temperature sensor"
});
enocean.teach({
	"id"  : "00 00 00 28 DE 1E",
	"eep" : "F6-02-01",
	"name": "ESK 300U - PTM 21x Push button transmitter module"
});
enocean.teach({
	"id"  : "00 00 01 81 B4 94",
	"eep" : "F6-02-01",
	"name": "ESK 300U - ECO 200 & PTM 330 Push Button Generator"
});
enocean.teach({
	"id"  : "00 00 01 8A 33 B0",
	"eep" : "A5-04-01",
	"name": "Pressac Mini Temperature & Humidity 902MHz"
});
*/

// Start to monitor telegrams incoming from the Enocean devices
//enocean.startMonitor({'path': 'COM7', 'rate': 57600});
enocean.startMonitor(null, (error, gateway) => {
//enocean.startMonitor({'path':'/dev/ttyAMA0'}, (error, gateway) => {
//enocean.startMonitor({'path':'/dev/ttyS0'}, (error, gateway) => {
	if(error) {
		console.log('ERROR');
		console.error(error);
	} else {
		console.log('The USB gateway was activated successfully:');
		console.log(JSON.stringify(gateway, null, '  '));
		// Set an event listener for 'data-known' events
		enocean.on('data-known', (telegram) => {
			let message = telegram['message'];
			console.log(message['device']['name'] + ': ' + message['desc']);
		});
	}
});
