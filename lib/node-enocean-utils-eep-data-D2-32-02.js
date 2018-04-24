/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-F6-02-02.js
*
* Copyright (c) 2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-04-24
*
* EEP:D2-32-02 (EEP 2.6.7 specification P218)
* - D2: VLD Telegram
* - 32: A.C. Current Clamp
* - 02: Type 0x02
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 6) {
		return null;
	}

	let db5 = dd_buf.readUInt8(0);
	let pf = (db5 & 0b10000000) ? 1 : 0;
	let pf_desc = pf ? 'True' : 'False';

	let div = (db5 & 0b01000000) ? 1 : 0;
	let div_desc = div ? 'x/10' : 'x/1';

	// CH1
	let ch1 = (dd_buf.readUInt16BE(1) & 0b1111111111110000) >> 4;
	let ch1_hex = mBuffer.convDecToHexString(ch1);
	ch1 = ch1 / (div ? 10 : 1);
	let ch1_desc = ch1 + 'A';
	// CH2
	let ch2 = (dd_buf.readUInt16BE(2) & 0b0000111111111111);
	let ch2_hex = mBuffer.convDecToHexString(ch2);
	ch2 = ch2 / (div ? 10 : 1);
	let ch2_desc = ch2 + 'A';
	// CH3
	let ch3 = (dd_buf.readUInt16BE(4) & 0b1111111111110000) >> 4;
	let ch3_hex = mBuffer.convDecToHexString(ch3);
	ch3 = ch3 / (div ? 10 : 1);
	let ch3_desc = ch3 + 'A';

	let db5_bin = ('0000000' + db5.toString(2)).slice(-8);
	let values = {
		'PF': {
			'key'  : 'PF',
			'field': 'Power Fail',
			'value': pf,
			'hex'  : [mBuffer.convDecToHexString(pf)],
			'bin'  : db5_bin.substr(0, 1),
			'desc' : pf_desc
		},
		'DIV': {
			'key'  : 'DIV',
			'field': 'Divisor',
			'value': div,
			'hex'  : [mBuffer.convDecToHexString(div)],
			'bin'  : db5_bin.substr(1, 1),
			'desc' : div_desc
		},
		'CH1': {
			'key'  : 'CH1',
			'field': 'Channel 1',
			'value': ch1,
			'hex'  : [ch1_hex],
			'desc' : ch1_desc
		},
		'CH2': {
			'key'  : 'CH2',
			'field': 'Channel 2',
			'value': ch2,
			'hex'  : [ch2_hex],
			'desc' : ch2_desc
		},
		'CH3': {
			'key'  : 'CH3',
			'field': 'Channel 3',
			'value': ch3,
			'hex'  : [ch3_hex],
			'desc' : ch3_desc
		}
	};
	let message = {
		'eep'  : 'D2-32-02',
		'value': {
			'fail' : pf ? true : false,
			'ch1': ch1,
			'ch2': ch2,
			'ch3': ch3
		},
		'desc' : [ch1_desc, ch2_desc, ch3_desc].join('/'),
		'learn': false
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['PF'], values['DIV'], values['CH1'], values['CH2'], values['CH3']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
