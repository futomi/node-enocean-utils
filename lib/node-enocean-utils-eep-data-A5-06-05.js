/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-06-05.js
*
* Copyright (c) 2016 - 2020, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2020-02-07
*
* EEP:A5-06-05 (EEP 2.6.5 specification P39)
* - RORG:A5:4BS Telegram
* - FUNC:06:Light Sensor
* - TYPE:05:Range 0lx to 10.200lx
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
	// Supply voltage
	let svc = db3;
	let svc_result = Math.round((svc * 5.1 / 255) * 100) / 100;
	let svc_desc = svc_result + ' V';
	// Illumination 2
	let ill2 = db2;
	let ill2_result = ill2 * 5100 / 255;
	let ill2_desc = ill2_result + ' lx';
	// Illumination 1
	let ill1 = db1;
	let ill1_result = ill1 * 10200 / 255;
	let ill1_desc = ill1_result + ' lx';
	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Range select
	let rs = db0 & 0b00000001;
	let rs_desc = '';
	let ill_result = 0;
	let ill_desc = '';
	if(rs === 0) {
		rs_desc = 'Range acc. to DB_1 (ILL1)';
		ill_result = ill1_result;
		ill_desc = ill1_desc;
	} else if(rs === 1) {
		rs_desc = 'Range acc. to DB_2 (ILL2)';
		ill_result = ill2_result;
		ill_desc = ill2_desc;
	}
	//
	let db0_bin = ('0000000' + db0.toString(2)).slice(-8);
	let values = {
		'SVC': {
			'key'  : 'SVC',
			'field': 'Supply voltage',
			'value': svc,
			'hex'  : [mBuffer.convDecToHexString(svc)],
			'desc' : svc_desc
		},
		'ILL2': {
			'key'  : 'ILL2',
			'field': 'Illumination 2',
			'value': ill2,
			'hex'  : [mBuffer.convDecToHexString(ill2)],
			'desc' : ill2_desc
		},
		'ILL1': {
			'key'  : 'ILL1',
			'field': 'Illumination 1',
			'value': ill1,
			'hex'  : [mBuffer.convDecToHexString(ill1)],
			'desc' : ill1_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'bin'  : db0_bin.substr(4, 1),
			'desc' : lrnb_desc
		},
		'RS': {
			'key'  : 'RS',
			'field': 'Range select',
			'value': rs,
			'hex'  : [mBuffer.convDecToHexString(rs)],
			'bin'  : db0_bin.substr(7, 1),
			'desc' : rs_desc
		}
	};

	let message = {
		'eep'  : 'A5-06-02',
		'value': {
			'ill' : ill_result,
			'svc' : svc_result
		},
		'desc' : ill_desc,
		'learn': lrnb ? false : true
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['SVC'], values['ILL2'], values['ILL1'], values['LRNB'], values['RS']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
