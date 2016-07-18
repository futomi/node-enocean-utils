/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-02-05.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
*
* EEP:A5-02-05 (EEP 2.6.5 specification P27)
* - RORG:A5:4BS Telegram
* - FUNC:02:Temperature Sensors
* - TYPE:05:Temperature Sensor Range 0°C to +40°C
* ---------------------------------------------------------------- */
'use strict';
var mBuffer = require('./node-enocean-utils-buffer.js');

var EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return parsed_unknown;
	}
	var db1 = dd_buf.readUInt8(2);
	var db0 = dd_buf.readUInt8(3);
	// Temperature
	var tmp = 40 * (1 - (db1 / 255));
	tmp = tmp.toFixed(1);
	var tmp_desc = tmp + '℃';
	// LRN Bit
	var lrnb = (db0 & 0b00001000) >> 3;
	var lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	//
	var db0_bin = ('0000000' + db0.toString(2)).slice(-8);
	var values = {
		'TMP': {
			'key'  : 'TMP',
			'field': 'Temperature',
			'value': db1, 
			'hex'  : [mBuffer.convDecToHexString(db1)],
			'desc' : tmp_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'bin'  : db0_bin.substr(4, 1),
			'desc' : lrnb_desc
		}
	};
	var message = {
		'eep'  : 'A5-02-05',
		'value': {
			'temperature': tmp
		},
		'desc' : tmp_desc,
		'learn': lrnb ? false : true
	};
	var parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['TMP'], values['LRNB']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
