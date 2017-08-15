/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-buffer.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-02
* ---------------------------------------------------------------- */
'use strict';

const EnoceanUtilsBuffer = function() {};

EnoceanUtilsBuffer.prototype.convDecToHexString = function(dec) {
	let h = dec.toString(16);
	h = ('0' + h).slice(-2);
	return h.toUpperCase();
};

EnoceanUtilsBuffer.prototype.convBufferToHexString = function(buf) {
	let len = buf.length;
	let hex_list = [];
	for(let i=0; i<len; i++) {
		let dec = buf.readUInt8(i);
		let hex = this.convDecToHexString(dec);
		hex_list.push(hex);
	}
	return hex_list;
};

module.exports = new EnoceanUtilsBuffer();
