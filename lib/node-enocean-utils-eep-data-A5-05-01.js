/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-05-01.js
*
* Copyright (c) 2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-06-12
*
* EEP:A5-05-01 (EEP 2.6.5 specification P36)
* - RORG:A5:4BS Telegram
* - FUNC:05:Barometric Sensor
* - TYPE:01:Range 500 to 1150 hPa
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return null;
	}
	//let db3 = dd_buf.readUInt8(0);
	//let db2 = dd_buf.readUInt8(1);
	//let db1 = dd_buf.readUInt8(2);
	let db0 = dd_buf.readUInt8(3);
	// Barometer
	let bar = dd_buf.readUInt16BE(0) & 0b0000001111111111;
	let bar_result = Math.round(500 + (bar * (1150 - 500) / 1023));
	let bar_desc = bar_result + ' hPa';
	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Telegram Type
	let ttp = db0 & 0b00000001;
	let ttp_desc = '';
	if(ttp === 0) {
		ttp_desc = 'Heartbeat';
	} else if(ttp === 1) {
		ttp_desc = 'Event triggered';
	}
	//
	let db0_bin = ('0000000' + db0.toString(2)).slice(-8);
	let values = {
		'BAR': {
			'key'  : 'BAR',
			'field': 'Barometer',
			'value': bar,
			'hex'  : [mBuffer.convDecToHexString(bar)],
			'desc' : bar_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'bin'  : db0_bin.substr(4, 1),
			'desc' : lrnb_desc
		},
		'TTP': {
			'key'  : 'TTP',
			'field': 'Telegram Type',
			'value': ttp,
			'hex'  : [mBuffer.convDecToHexString(ttp)],
			'bin'  : db0_bin.substr(7, 1),
			'desc' : ttp_desc
		}
	};

	let message = {
		'eep'  : 'A5-05-01',
		'value': {
			'bar' : bar_result,
			'ttp' : ttp
		},
		'desc' : bar_desc,
		'learn': lrnb ? false : true
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['BAR'], values['LRNB'], values['TTP']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
