/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data.js
*
* Copyright (c) 2016 - 2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-06-27
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepData = function() {
	this.parsers = {
		'F6-02-01': require('./node-enocean-utils-eep-data-F6-02-01.js'),
		'F6-02-02': require('./node-enocean-utils-eep-data-F6-02-02.js'),
		'F6-02-04': require('./node-enocean-utils-eep-data-F6-02-04.js'),
		'D5-00-01': require('./node-enocean-utils-eep-data-D5-00-01.js'),
		'A5-04-01': require('./node-enocean-utils-eep-data-A5-04-01.js'),
		'A5-04-03': require('./node-enocean-utils-eep-data-A5-04-03.js'),
		'A5-05-01': require('./node-enocean-utils-eep-data-A5-05-01.js'),
		'A5-06-02': require('./node-enocean-utils-eep-data-A5-06-02.js'),
		'A5-07-01': require('./node-enocean-utils-eep-data-A5-07-01.js'),
		'A5-02-05': require('./node-enocean-utils-eep-data-A5-02-05.js'),
		'A5-09-04': require('./node-enocean-utils-eep-data-A5-09-04.js'),
		'D2-32-02': require('./node-enocean-utils-eep-data-D2-32-02.js')
	};
};

EnoceanUtilsEepData.prototype.isKnown = function(eep) {
	return (eep in this.parsers) ? true : false;
};

EnoceanUtilsEepData.prototype.parse = function(eep, dd_buf) {
	let parsed_unknown = {
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
		let parsed = this.parsers[eep].parse(dd_buf);
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
