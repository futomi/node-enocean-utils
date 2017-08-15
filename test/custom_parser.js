'use strict';
process.chdir(__dirname);

const enocean = require('../lib/node-enocean-utils.js');
enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-unknown', (telegram) => {
	// Buffer object representing the Data DL
	let buf = telegram['message']['data_dl_buffer'];

	// If you know the EEP of the originated device,
	// you can parse the Data DL based on EEP specification.
	// The code below assumes that the EEP is F6-02-04.
	// This EEP represents the Light and blind control ERP2
	// such as rocker switches.
	// The specification for F6-02-04 is described in
	// the EEP 2.6.5 specification P17.

	// The Data DL consists of a byte, that is 8bit.
	let dd = buf.readUInt8(buf);

	// The 1st bit represents "Energy Bow" which means
	// whether a button was pressed or released.
	// In this case, releasing a button is not necessary.
	if((dd & 0b10000000) === 0) {
		return;
	}

	// The bit from 5th to 8th represents whether the
	// button was pressed or released.
	if(dd & 0b00001000) {
		console.log('The button BI was pressed.');
	} else if(dd & 0b00000100) {
		console.log('The button B0 was pressed.');
	} else if(dd & 0b00000010) {
		console.log('The button AI was pressed.');
	} else if(dd & 0b00000001) {
		console.log('The button A0 was pressed.');
	}
});