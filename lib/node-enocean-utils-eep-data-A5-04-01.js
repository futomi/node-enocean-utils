/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-04-01.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-03
*
* EEP:A5-04-01 (EEP 2.6.5 specification P33)
* - RORG:A5:4BS Telegram
* - FUNC:04:Temperature and Humidity Sensor
* - TYPE:01:Range 0°C to +40°C and 0% to 100%
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return null;
	}
	let db2 = dd_buf.readUInt8(1);
	let db1 = dd_buf.readUInt8(2);
	let db0 = dd_buf.readUInt8(3);
	// Humidity
	let hum = db2;
	let hum_result = (hum * 100 / 250).toFixed(1);
	let hum_desc = hum_result + ' %';
	// Temperature
	let tmp = db1;
	let tmp_result = (tmp * 40 / 250).toFixed(1);
	let tmp_desc = tmp_result + ' ℃';

	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Temperature Sensor availability
	let tsn = (db0 & 0b00000010) >> 1;
	let tsn_desc = '';
	if(tsn === 0) {
		tsn_desc = 'Temperature Sensor not available';
	} else if(tsn === 1) {
		tsn_desc = 'Temperature Sensor available';
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
		'TSN': {
			'key'  : 'TSN',
			'field': 'Temperature Sensor availability',
			'value': tsn,
			'hex'  : [mBuffer.convDecToHexString(tsn)],
			'desc' : tsn_desc
		}
	};
	let message_desc = hum_desc;
	if(tsn) {
		message_desc += '/' + tmp_desc
	}
	let message = {
		'eep'  : 'A5-04-01',
		'value': {
			'humidity'   : hum_result,
			'temperature': tsn ? tmp_result : null
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
		'structure': [values['HUM'], values['TMP'], values['LRNB'], values['TSN']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
