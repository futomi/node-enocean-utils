/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
* ---------------------------------------------------------------- */
'use strict';
var mBuffer = require('./node-enocean-utils-buffer.js');

var EnoceanUtilsEepData = function() {
	this.parsers = {
		'F6-02-02': require('./node-enocean-utils-eep-data-F6-02-02.js'),
		'F6-02-04': require('./node-enocean-utils-eep-data-F6-02-04.js'),
		'D5-00-01': require('./node-enocean-utils-eep-data-D5-00-01.js'),
		'A5-07-01': require('./node-enocean-utils-eep-data-A5-07-01.js'),
		'A5-02-05': require('./node-enocean-utils-eep-data-A5-02-05.js')
	};
};

EnoceanUtilsEepData.prototype.isKnown = function(eep) {
	return (eep in this.parsers) ? true : false;
};

EnoceanUtilsEepData.prototype.parse = function(eep, dd_buf) {
	var parsed_unknown = {
		'field'  : 'Data_DL',
		'message': {},
		'hex'    : mBuffer.convBufferToHexString(dd_buf),
		'buffer' : dd_buf,
		'values' : {}
	};
	if(!eep || typeof(eep) !== 'string') {
		return parsed_unknown;
	}
	eep = eep.toUpperCase();
	eep = eep.replace(/[^\dA-F]/g, '');
	if(eep.length !== 6) {
		return parsed_unknown;
	}
	eep = eep.replace(/(.)(?=(.{2})+$)/g , '$1-');

	if((eep in this.parsers) && this.parsers[eep]) {
		var parsed = this.parsers[eep].parse(dd_buf);
		if(parsed) {
			return parsed;
		} else {
			return parsed_unknown;
		}
	} else {
		return parsed_unknown;
	}
};

module.exports = new EnoceanUtilsEepData();
