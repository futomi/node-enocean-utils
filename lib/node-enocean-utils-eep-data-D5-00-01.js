/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-F6-02-02.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
*
* EEP:D5-00-01 (EEP 2.6.5 specification P25)
* - D5: 1BS Telegram
* - 00: Contacts and Switches
* - 01: Single Input Contact
* ---------------------------------------------------------------- */
'use strict';
var mBuffer = require('./node-enocean-utils-buffer.js');

var EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 1) {
		return parsed_unknown;
	}
	var d = dd_buf.readUInt8(0);
	// Learn Buttonw
	var lrn = (d & 0b00001000) >> 3;
	var lrn_desc = '';
	if(lrn === 0) {
		lrn_desc = 'pressed';
	} else if(lrn === 1) {
		lrn_desc = 'not pressed';
	}
	// Contact
	var co = d & 0b00000001;
	var co_desc = '';
	if(co === 0) {
		co_desc = 'open';
	} else if(co === 1) {
		co_desc = 'closed';
	}
	//
	var data_bin = ('0000000' + d.toString(2)).slice(-8);
	var values = {
		'LRN': {
			'key'  : 'LRN',
			'field': 'Learn Button',
			'value': lrn,
			'hex'  : [mBuffer.convDecToHexString(lrn)],
			'bin'  : data_bin.substr(4, 1),
			'desc' : lrn_desc
		},
		'CO': {
			'key'  : 'CO',
			'field': 'Contact',
			'value': co,
			'hex'  : [mBuffer.convDecToHexString(co)],
			'bin'  : data_bin.substr(7, 1),
			'desc' : co_desc
		}
	};
	var message = {
		'eep'  : 'D5-00-01',
		'value': {
			'contact': co
		},
		'desc' : co_desc,
		'learn': lrn ? false : true
	};
	var parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['LRN'], values['CO']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
