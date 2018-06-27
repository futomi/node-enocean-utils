/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-04-03.js
*
* Copyright (c) 2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-06-27
*
* EEP:A5-04-03 (EEP 2.6.7 specification P36)
* - RORG:A5:4BS Telegram
* - FUNC:04:Temperature and Humidity Sensor
* - TYPE:03:Range -20°C to +60°C 10bit-measurement and 0% to 100%
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return null;
	}
	let db3 = dd_buf.readUInt8(0);
	let db2 = dd_buf.readUInt8(1);
	let db1 = dd_buf.readUInt8(2);
	let db0 = dd_buf.readUInt8(3);
	// Humidity
	let hum = db3;
	let hum_result = hum * 100 / 255;
	hum_result = Math.round(hum_result * 10) / 10;
	let hum_desc = hum_result + ' %';
	// Temperature
	let tmp = ((db2 & 0b00000011) << 8) + db1;
	let tmp_result = -20 + (tmp * 80 / 1023);
	tmp_result = Math.round(tmp_result * 100) / 100;
	let tmp_desc = tmp_result + ' ℃';

	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Telegram Type
	let ttp = (db0 & 0b00000010) >> 1;
	let ttp_desc = '';
	if(ttp === 0) {
		ttp_desc = 'Heartbeat';
	} else if(ttp === 1) {
		ttp_desc = 'Event triggered';
	}
	//
	let values = {
		'HUM': {
			'key'  : 'HUM',
			'field': 'Humidity',
			'value': hum,
			'hex'  : [mBuffer.convDecToHexString(hum)],
			'desc' : hum_desc
		},
		'TMP': {
			'key'  : 'TMP',
			'field': 'Temperature',
			'value': tmp,
			'hex'  : [mBuffer.convDecToHexString(tmp)],
			'desc' : tmp_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'desc' : lrnb_desc
		},
		'TTP': {
			'key'  : 'TTP',
			'field': 'Telegram Type',
			'value': ttp,
			'hex'  : [mBuffer.convDecToHexString(ttp)],
			'desc' : ttp_desc
		}
	};
	let message_desc = hum_desc + '/' + tmp_desc;
	let message = {
		'eep'  : 'A5-04-03',
		'value': {
			'humidity'   : hum_result,
			'temperature': tmp_result,
			'ttp'        : ttp
		},
		'desc' : message_desc,
		'learn': lrnb ? false : true
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['HUM'], values['TMP'], values['LRNB'], values['TTP']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
