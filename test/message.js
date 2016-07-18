'use strict';
process.chdir(__dirname);

var enocean = require('../lib/node-enocean-utils.js');

enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-known', (telegram) => {
	console.dir(telegram['message']);
});