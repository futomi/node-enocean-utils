/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-09-04.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-03
*
* EEP:A5-09-04 (EEP 2.6.5 specification P41)
* - RORG:A5:4BS Telegram
* - FUNC:09:Gas Sensor
* - TYPE:04:CO2 Sensor
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
	let hum_result = hum * 5 / 10;
	let hum_desc = hum_result + ' %';
	// Concentration
	let conc = db2;
	let conc_result = conc * 10;
	let conc_desc = conc_result + ' ppm';
	// Temperature
	let tmp = db1;
	let tmp_result = tmp * 2 / 10;
	let tmp_desc = tmp_result + ' ℃';

	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Humidity Sensor availability
	let hsn = (db0 & 0b00000100) >> 2;
	let hsn_desc = '';
	if(hsn === 0) {
		hsn_desc = 'Humidity Sensor not available';
	} else if(hsn === 1) {
		hsn_desc = 'Humidity Sensor available';
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
	let db0_bin = ('0000000' + db0.toString(2)).slice(-8);
	let values = {
		'HUM': {
			'key'  : 'HUM',
			'field': 'Humidity',
			'value': hum,
			'hex'  : [mBuffer.convDecToHexString(hum)],
			'desc' : hum_desc
		},
		'Conc': {
			'key'  : 'Conc',
			'field': 'Concentration',
			'value': conc,
			'hex'  : [mBuffer.convDecToHexString(conc)],
			'desc' : conc_desc
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
		'HSN': {
			'key'  : 'HSN',
			'field': 'Humidity Sensor availability',
			'value': hsn,
			'hex'  : [mBuffer.convDecToHexString(hsn)],
			'desc' : hsn_desc
		},
		'TSN': {
			'key'  : 'TSN',
			'field': 'Temperature Sensor availability',
			'value': tsn,
			'hex'  : [mBuffer.convDecToHexString(tsn)],
			'desc' : tsn_desc
		}
	};
	let message_desc_list = [];
	if(hsn) {
		message_desc_list.push(hum_desc);
	}
	message_desc_list.push(conc_desc);
	if(tsn) {
		message_desc_list.push(tmp_desc);
	}
	let message = {
		'eep'  : 'A5-09-04',
		'value': {
			'humidity': hsn ? hum_result : null,
			'concentration': conc_result,
			'temperature': tsn ? tmp_result : null
		},
		'desc' : message_desc_list.join('/'),
		'learn': lrnb ? false : true
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['HUM'], values['Conc'], values['TMP'], values['LRNB'], values['HSN'], values['TSN']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
