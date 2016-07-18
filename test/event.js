'use strict';
process.chdir(__dirname);

var known_device_list = [
	{
		'id'  : '00 00 00 2C 86 7E',
		'eep' : 'F6-02-04',
		'name': 'X3100HB-W-R-928 Rocker Switch Single'
	},
	{
		'id'  : '00 00 00 2C 86 5C',
		'eep' : 'F6-02-04',
		'name': 'ESM210R Rocker Switch Single'
	},
	{
		'id'  : '00 00 00 29 91 94',
		'eep' : 'F6-02-04',
		'name': 'X3200HB-W-R-928 Rocker Switch Double'
	},
	{
		'id'  : '00 00 04 00 8F E0',
		'eep' : 'D5-00-01',
		'name': 'STM250J Door Sensor'
	},
	{
		'id'  : '00 00 04 01 2B B4',
		'eep' : 'A5-07-01',
		'name': 'HM92-01WHC motion detector'
	},
	{
		'id'  : '00 00 04 01 31 95',
		'eep' : 'A5-02-05',
		'name': 'STM 431J Temperature Sensor'
	}
];

var enocean = require('../lib/node-enocean-utils.js');

known_device_list.forEach((device) => {
	enocean.teach(device);
});

enocean.startMonitor({'path': 'COM7', 'rate': 57600}, (err) => {
	if(err) {
		console.log('ERROR: ' + err.toString(err));
	}
});

enocean.on('data-known', (telegram) => {
	console.log('data-known');
});
enocean.on('data-unknown', (telegram) => {
	console.log('data-unknown');
});
enocean.on('data-learn', (telegram) => {
	console.log('data-learn');
});
enocean.on('data', (telegram) => {
	console.log('data');
});