/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-F6-02-02.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-15
*
* EEP:F6-02-02 (EEP 2.6.5 specification P15)
* - RORG:F6:RPS Telegram
* - FUNC:02:Rocker Switch, 2 Rocker
* - TYPE:01:Light and Blind Control - Application Style 1
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 1) {
		return null;
	}
	let d = dd_buf.readUInt8(0);
	// Rocker 1st action
	let r1 = d >> 5;
	let r1_desc = '';
	let button_name = '';
	if(r1 === 0) {
		r1_desc = 'AI';
		button_name = 'AI';
	} else if(r1 === 1) {
		r1_desc = 'A0';
		button_name = 'A0';
	} else if(r1 === 2) {
		r1_desc = 'BI';
		button_name = 'BI';
	} else if(r1 === 3) {
		r1_desc = 'B0';
		button_name = 'B0';
	}
	// Energy Bow
	let eb = (d & 0b00010000) >> 4;
	let eb_desc = '';
	if(eb === 0) {
		eb_desc = 'released';
	} else if(eb === 1) {
		eb_desc = 'pressed';
	}
	// Rocker 2nd action
	let r2 = (d & 0b00001110) >> 1;
	let r2_desc = '';
	if(r2 === 0) {
		r2_desc = 'AI';
	} else if(r2 === 1) {
		r2_desc = 'A0';
	} else if(r2 === 2) {
		r2_desc = 'BI';
	} else if(r2 === 3) {
		r2_desc = 'B0';
	}
	// 2nd Action
	let sa = d & 0b00000001;
	let sa_desc = '';
	if(sa === 0) {
		sa_desc = 'No 2nd action';
	} else {
		sa_desc = '2nd action valid';
	}
	//
	let data_bin = ('0000000' + d.toString(2)).slice(-8);
	let values = {
		'R1': {
			'key'  : 'R1',
			'field': 'Rocker 1st action',
			'value': r1,
			'hex'  : [mBuffer.convDecToHexString(r1)],
			'bin'  : data_bin.substr(0, 3),
			'desc' : r1_desc
		},
		'EB': {
			'key'  : 'EB',
			'field': 'Energy Bow',
			'value': eb,
			'hex'  : [mBuffer.convDecToHexString(eb)],
			'bin'  : data_bin.substr(3, 1),
			'desc' : eb_desc
		},
		'R2': {
			'key'  : 'R2',
			'field': 'Rocker 2nd action',
			'value': r2,
			'hex'  : [mBuffer.convDecToHexString(r2)],
			'bin'  : data_bin.substr(4, 3),
			'desc' : r2_desc
		},
		'SA': {
			'key'  : 'SA',
			'field': '2nd Action',
			'value': sa,
			'hex'  : [mBuffer.convDecToHexString(sa)],
			'bin'  : data_bin.substr(7, 1),
			'desc' : sa_desc
		}
	};
	let message = {
		'eep'  : 'F6-02-02',
		'value': {
			'button': button_name,
			'pressed': eb 
		},
		'desc' : r1_desc + ' ' + eb_desc,
		'learn': false
	};
	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['R1'], values['EB'], values['R2'], values['SA']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
