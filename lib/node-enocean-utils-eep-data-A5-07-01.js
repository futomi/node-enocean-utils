/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-07-01.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-03
*
* EEP:A5-07-01 (EEP 2.6.5 specification P38)
* - RORG:A5:4BS Telegram
* - FUNC:07:Occupancy Sensor
* - TYPE:01:Occupancy with Supply voltage monitor
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return null;
	}
	let db3 = dd_buf.readUInt8(0);
	let db1 = dd_buf.readUInt8(2);
	let db0 = dd_buf.readUInt8(3);
	// Supply voltage
	let svc = db3;
	let svc_desc = '';
	let svc_result = 0;
	if(svc >= 0 && svc <= 250) {
		svc_result = svc * 5 / 250;
		svc_desc = svc_result + ' V';
	} else if(svc >= 251 && svc <= 255) {
		svc_desc = 'error code: ' + svc;
	}
	// PIR Status
	let pirs = db1;
	let pirs_desc = '';
	let pirs_result = 0;
	if(pirs >= 0 && pirs <= 127) {
		pirs_desc = 'PIR off';
		pirs_result = 0;
	} else if(pirs >= 128 && pirs <= 255) {
		pirs_desc = 'PIR on';
		pirs_result = 1;
	}
	// LRN Bit
	let lrnb = (db0 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}
	// Supply voltage availability
	let sva = db0 & 0b00000001;
	let sva_desc = '';
	if(sva === 0) {
		sva_desc = 'Supply voltage is not supported';
	} else if(sva === 1) {
		sva_desc = 'Supply voltage is supported';
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
		'PIRS': {
			'key'  : 'PIRS',
			'field': 'PIR Status',
			'value': pirs,
			'hex'  : [mBuffer.convDecToHexString(pirs)],
			'desc' : pirs_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'desc' : lrnb_desc
		},
		'SVA': {
			'key'  : 'SVA',
			'field': 'Supply voltage availability',
			'value': sva,
			'hex'  : [mBuffer.convDecToHexString(sva)],
			'desc' : sva_desc
		}
	};
	let message = {
		'eep'  : 'A5-07-01',
		'value': {
			'pirs': pirs_result,
			'svc' : svc_result
		},
		'desc' : pirs_desc + '/' + svc_desc,
		'learn': lrnb ? false : true
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['SVC'], values['PIRS'], values['LRNB'], values['SVA']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
