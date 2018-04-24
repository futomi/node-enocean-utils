'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils.js');

enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

enocean.teach({
	"id"  : "00 00 04 01 86 39",
	"eep" : "D2-32-02",
	"name": "Pressac Three Channel CT Clamp V3 928MHz"
});

//enocean.startMonitor({'path': 'COM7', 'rate': 57600});
enocean.startMonitor();

enocean.on('data-known', (telegram) => {
	console.dir(telegram['message']);
});