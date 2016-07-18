/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
*
* [Abstract]
*
* The node-enocean-utils is a Node.js module which allows you to get
* and analyze detagrams came from EnOcean devices via a USB gateway
* such as USB 400.
*
* This module is based on EnOcean specification as follows:
* - EnOcean Serial Protocol 3
* - EnOcean Radio Protocol 2
* - EnOcean Equipment Profiles 2.6.5
* See the EnOcean web site for details (https://www.enocean.com/).
*
* [Dependencies]
*  - serialport
*      https://www.npmjs.com/package/serialport
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mSerialPort   = require('serialport');
var mUtil         = require('util');
var mEepDesc      = require('./node-enocean-utils-eep-desc.js');
var mManufacturer = require('./node-enocean-utils-manufacturer.js');
var mCrc8         = require('./node-enocean-utils-crc8.js');
var mPacketType   = require('./node-enocean-utils-packet-type.js');
var mBuffer       = require('./node-enocean-utils-buffer.js');
var EepData       = require('./node-enocean-utils-eep-data.js');

/* ------------------------------------------------------------------
* Constructor: EnoceanUtils()
* ---------------------------------------------------------------- */
var EnoceanUtils = function() {
	this.default_baud_rate = 57600;
	this.baud_rate = 57600;
	this.path = '';
	this.devices = {};
	this.port = null;
	this.parsers = {};
	mEventEmitter.call(this);
};
mUtil.inherits(EnoceanUtils, mEventEmitter);

/* ------------------------------------------------------------------
* Method: teach(params)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.teach = function(params) {
	// The module ID of the device (required)
	var id = ('id' in params) ? params['id'] : '';
	// The EEP supported by the device (required)
	var eep = ('eep' in params) ? params['eep'] : '';
	// The name of the device (optional)
	var name = ('name' in params) ? params['name'] : '';
	// The manufacturer of the module in the device (optional)
	var manufacturer = ('manufacturer' in params) ? params['manufacturer'] : '';

	// Check the value of 'id'
	var id_err = this._checkDeviceId(id);
	if(id_err) {
		throw new Error('The value of the "id" member in the 1st augument of the teach() method is invalid: ' + id_err);
	} else {
		id = this._normalizeDeviceId(id);
	}

	// Check the value of 'eep'
	var eep_err = this._checkDeviceEep(eep);
	if(eep_err) {
		throw new Error('The value of the "eep" member in the 1st augument of the teach() method is invalid: ' + eep_err);
	} else {
		eep = this._normalizeDeviceEep(eep);
	}

	// Check the value of 'name'
	if(name) {
		var name_err = this._checkDeviceName(name);
		if(name_err) {
			throw new Error('The value of the "name" member in the 1st augument of the teach() method is invalid: ' + name_err);
		}
	}

	// Check the value of 'manufacturer'
	if(manufacturer) {
		var manufacturer_err = this._checkDeviceManufacturer(manufacturer);
		if(manufacturer_err) {
			throw new Error('The value of the "manufacturer" member in the 1st augument of the teach() method is invalid: ' + manufacturer_err);
		}
	}

	// Register the device
	this.devices[id] = {
		'id'          : id,
		'eep'         : eep,
		'name'        : name,
		'manufacturer': manufacturer,
		'learned'     : true
	};

	return this.getDeviceInfo(id);
};

EnoceanUtils.prototype._normalizeDeviceId = function(id) {
	id = id.toUpperCase();
	id = id.replace(/[\s\-]/g, '');
	id = ('000000' + id).slice(-12);
	return id;
};

EnoceanUtils.prototype._normalizeDeviceEep = function(eep) {
	return eep.toUpperCase();
};

EnoceanUtils.prototype._checkDeviceId = function(id) {
	if(id === undefined) {
		return 'The value is required.';
	} else if(typeof(id) !== 'string') {
		return 'The type of the value must be string';
	} else {
		id = id.toUpperCase();
		id = id.replace(/[\s\-]/g, '');
		var id_len = id.length;
		if(!(id.match(/^[0-9A-F]{6,12}$/) && (id_len === 6 || id_len === 8 || id_len === 12))) {
			return 'The value is invalid as the module ID of the device.';
		}
	}
	return null;
};

EnoceanUtils.prototype._checkDeviceEep = function(eep) {
	if(!eep) {
		return 'The value is required.';
	} else if(typeof(eep) !== 'string') {
		return 'The type of the value must be string';
	} else {
		eep = eep.toUpperCase();
		var m = eep.match(/^([0-9A-F]{2})\-([0-9A-F]{2})\-([0-9A-F]{2})$/);
		if(!m) {
			return 'The value must be the form of "FF-FF-FF".';
		}
	}
	return null;
};

EnoceanUtils.prototype._checkDeviceName = function(name) {
	if(name === undefined) {
		return 'The value is required.';
	} else if(typeof(name) !== 'string') {
		return 'The type of the value must be string.';
	} else if(name.length > 50) {
		return 'The value is too long. The length of the value must be equal to or less than 50.';
	}
	return null;
};

EnoceanUtils.prototype._checkDeviceManufacturer = function(manufacturer) {
	if(manufacturer === undefined) {
		return 'The value is required.'
	} else if(typeof(manufacturer) !== 'string') {
		throw new Error('The type of the value must be string.');
	} else if(manufacturer.length > 50) {
		throw new Error('The value is too long. The length of the value must be equal to or less than 50.');
	}
	return null;
};

/* ------------------------------------------------------------------
* Method: getDeviceInfo(id)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.getDeviceInfo = function(id) {
	var id_err = this._checkDeviceId(id);
	if(id_err) {
		return null;
	}
	id = this._normalizeDeviceId(id);
	if(id in this.devices) {
		return JSON.parse(JSON.stringify(this.devices[id]));
	} else {
		return null;
	}
};

/* ------------------------------------------------------------------
* Method: getLearnedDevices()
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.getLearnedDevices = function() {
	return JSON.parse(JSON.stringify(this.devices));
};

/* ------------------------------------------------------------------
* Method: setDeviceName(id, name)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.setDeviceName = function(id, name) {
	var id_err = this._checkDeviceId(id);
	if(id_err) {
		throw new Error('The 1st augument (id) of the setDeviceName() method is invalid: ' + id_err);
	}

	var name_err = this._checkDeviceName(name);
	if(name_err) {
		throw new Error('The 2nd augument (name) of the setDeviceName() method is invalid: ' + name_err);
	}

	var device = this.getDeviceInfo(id);
	if(device) {
		device['name'] = name;
		return this.getDeviceInfo(id);
	} else {
		return null;
	}
};

/* ------------------------------------------------------------------
* Method: startMonitor(params, callback)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.startMonitor = function(params, callback) {
	if(!params) {
		throw new Error('The startMonitor() requires the 1st argument.');
	}
	if(typeof(params) !== 'object') {
		throw new Error('The 1st argument of the startMonitor() must be an object.');
	}
	if('path' in params) {
		var path = params['path'];
		if(typeof(path) === 'string' && path !== '') {
			this.path = path;
		} else {
			throw new Error('The "path" member in the 1st argument of the startMonitor() is invalid.');
		}
	} else {
		throw new Error('The "path" member is required in the 1st argument of the startMonitor().');
	}
	if('rate' in params) {
		var rate = params['rate'];
		if(typeof(rate) === 'number') {
			this.baud_rate = rate;
		} else {
			throw new Error('The "rate" member in the 1st argument of the startMonitor() is invalid.');
		}
	} else {
		this.rate = this.default_baud_rate;
	}

	if(!callback) {
		callback = function(){};
	}
	this.stopMonitor(() => {
		this._initSerialPort(callback);
	});
};

EnoceanUtils.prototype._initSerialPort = function(callback) {
	this.port = new mSerialPort(this.path, {
		baudRate: this.baud_rate
	});
	this.port.once('error', (err) => {
		callback(err);
	});
	this.port.once('open', () => {
		callback();
	});
	var telegram_buffer = null;
	this.port.on('data', (buf) => {
		if(buf.readUInt8(0) === 0x55) {
			telegram_buffer = buf;
		} else if(telegram_buffer !== null) {
			telegram_buffer = Buffer.concat([telegram_buffer, buf]);
		} else {
			return;
		}
		if(telegram_buffer === null || telegram_buffer.length <= 6) {
			return;
		}
		var x = telegram_buffer.readUInt16BE(1);
		var y = telegram_buffer.readUInt8(3);
		var valid_length = 6 + x + y + 1;
		if(telegram_buffer.length === valid_length) {
			var parsed = this._parseTelegram(telegram_buffer);
			if(parsed['message']['learn'] === true) {
				this.emit('data-learn', parsed);
			} else if(parsed['message']['known'] === true) {
				this.emit('data-known', parsed);
			} else {
				this.emit('data-unknown', parsed);
			}
			this.emit('data', parsed);
			telegram_buffer = null;
		}
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitor(callback)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.stopMonitor = function(callback) {
	if(this.port) {
		this.port.removeAllListeners('data');
		this._closeSerialPort(() => {
			this.port = null;
			callback();
		});
	} else {
		this.port = null;
		callback();
	}
};

EnoceanUtils.prototype._closeSerialPort = function(callback) {
	if(this.port && this.port.isOpen()) {
		this.port.close(callback);
	} else {
		callback();
	}
};

EnoceanUtils.prototype._parseTelegram = function(buf) {
	var structure = [];
	// Sync. Byte
	var sync = this._parseTelegramSyncByte(buf);
	structure.push(sync);
	// Header
	var header = this._parseTelegramHeader(buf);
	var data_length = header['values']['data_length']['value'];
	var opt_length = header['values']['optional_length']['value'];	
	var packet_type = header['values']['packet_type']['value'];
	var packet_type_desc = header['values']['packet_type']['desc'];
	structure.push(header);
	// CRC8H
	var crc8h = this._parseTelegramCrch8(buf);
	structure.push(crc8h);
	// Data
	var data_offset = 6;
	var data = this._parseData(buf, data_offset, data_length, packet_type);
	structure.push(data);
	// Optional Data
	var opt_offset = data_offset + data_length;
	if(opt_length > 0) {
		var optional_data = this._parseTelegramOptionalData(buf, opt_offset, opt_length, packet_type);
		structure.push(optional_data);
	}
	// CRC8D
	var crc8d_offset = opt_offset + opt_length;
	var crc8d = this._parseTelegramCrcd8(buf, crc8d_offset);
	structure.push(crc8d);

	// Create a return object
	var message = {};
	message['packet_type'] = packet_type;
	message['packet_type_desc'] = packet_type_desc;
	for(var k in data['message']) {
		message[k] = data['message'][k];
	}
	for(var k in optional_data['message']) {
		message[k] = optional_data['message'][k];
	}
	message['crc'] = message['crc'] && crc8h['message']['valid'] && crc8d['message']['valid'];

	var telegram = {
		'message'  : message,
		'buffer'   : buf,
		'hex'      : mBuffer.convBufferToHexString(buf),
		'structure': structure
	};
	return telegram;
};


EnoceanUtils.prototype._parseTelegramSyncByte = function(buf) {
	var value = buf.readUInt8(0);
	var buffer = buf.slice(0, 1);
	var hex = mBuffer.convBufferToHexString(buffer);
	var parsed = {
		'field' : 'Sync. Byte',
		'buffer': buffer,
		'value' : value,
		'hex'   : hex,
		'desc'  : hex
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramHeader = function(buf) {
	var header_buffer = buf.slice(1, 5);

	var data_length_value = buf.readUInt16BE(1);
	var data_length_buffer = buf.slice(1, 3);

	var opt_length_value = buf.readUInt8(3);
	var opt_length_buffer = buf.slice(3, 4);

	var packet_type_value = buf.readUInt8(4);
	var packet_type_buffer = buf.slice(4, 5);

	var values = {
		'data_length': {
			'field' : 'Data Length',
			'buffer': data_length_buffer,
			'value' : data_length_value,
			'hex'   : mBuffer.convBufferToHexString(data_length_buffer),
			'desc'  : data_length_value + ' byte'
		},
		'optional_length': {
			'field' : 'Optional Length',
			'buffer': opt_length_buffer,
			'value' : opt_length_value,
			'hex'   : mBuffer.convBufferToHexString(opt_length_buffer),
			'desc'  : opt_length_value + ' byte'
		},
		'packet_type': {
			'field' : 'Packet Type',
			'buffer': packet_type_buffer,
			'value' : packet_type_value,
			'hex'   : mBuffer.convBufferToHexString(packet_type_buffer),
			'desc'  : mPacketType.getPacketTypeDescription(packet_type_value)
		}
	};

	var parsed = {
		'field'    : 'Header',
		'buffer'   : header_buffer,
		'hex'      : mBuffer.convBufferToHexString(header_buffer),
		'values'   : values,
		'structure': [
			values['data_length'],
			values['optional_length'],
			values['packet_type']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramCrch8 = function(buf) {
	var value = buf.readUInt8(5);
	var buffer = buf.slice(5, 6);
	var valid = mCrc8.checkCrc8(value, buf.slice(1, 5));
	var parsed = {
		'field' : 'CRC8H',
		'message': {
			'valid': valid
		},
		'buffer': buffer,
		'value' : value,
		'hex'   : mBuffer.convBufferToHexString(buffer),
		'desc'  : valid ? 'valid' : 'invalid'
	};
	return parsed;
};

EnoceanUtils.prototype._parseData = function(buf, offset, len, packet_type) {
	if(packet_type === 0x0A) {
		// 0x0A: RADIO_ERP2 (ERP2 protocol radio telegram)
		return this._parseDataErp2(buf, offset, len);
	} else {
		return this._parseDataUnknown(buf, offset, len);
	}
};

EnoceanUtils.prototype._parseDataUnknown = function(buf, offset, len) {
	var buffer = buf.slice(offset, len);
	var hex = mBuffer.convBufferToHexString(buffer);
	var parsed = {
		'field'    : 'Data',
		'message'  : {},
		'buffer'   : buffer,
		'hex'      : hex
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp2 = function(buf, offset, len) {
	// EnOcean Radio Protocol 2 specification P16

	var buffer = buf.slice(offset, len);
	var hex = mBuffer.convBufferToHexString(buffer);
	var structure = [];

	// Header (1 byte)
	var header_value = buf.readUInt8(offset);
	var header_buffer = buf.slice(offset, offset + 1);
	var header_hex = mBuffer.convBufferToHexString(header_buffer);
	var header_bin = ('0000000' + header_value.toString(2)).slice(-8);
	// - Address Control (3 bit)
	var ac = header_value >> 5;
	var ac_map = {
		0b000: 'Originator-ID 24 bit; no Destination-ID',
		0b001: 'Originator-ID 32 bit; no Destination-ID',
		0b010: 'Originator-ID 32 bit, Destination-ID 32 bit',
		0b011: 'Originator-ID 48 bit, no Destination-ID',
		0b100: 'reserved101: reserved110',
		0b111: 'reserved'
	};
	var ac_desc = ac_map[ac] || '';
	// - Extended header available (1 bit)
	var eha = (header_value & 0b00010000) >> 4;
	var eha_map = {
		0b0: 'No extended header',
		0b1: 'Extended header available'
	};
	var eha_desc = eha_map[eha] || '';
	// - Telegram type (R-ORG) (4 bit)
	var tt = header_value & 0b00001111;
	var tt_map = {
		0b0000: 'RPS telegram (0xF6)',
		0b0001: '1BS telegram (0xD5)',
		0b0010: '4BS telegram (0xA5)',
		0b0011: 'Smart Acknowledge Signal telegram (0xD0)',
		0b0100: 'Variable length data telegram (0xD2)',
		0b0101: 'Universal Teach-In EEP based (0xD4)',
		0b0110: 'Manufacturer Specific Communication (0xD1)',
		0b0111: 'Secure telegram (0x30)',
		0b1000: 'Secure telegram with encapsulation (0x31)',
		0b1001: 'Secure Teach-In telegram for switch (0x35)',
		0b1010: 'Generic Profiles selective data (0xB3)',
		0b1011: 'reserved',
		0b1100: 'reserved',
		0b1101: 'reserved',
		0b1110: 'reserved',
		0b1111: 'Extended Telegram type available'
	};
	var tt_desc = tt_map[tt] || '';

	var header_values = {
		'AC': {
			'key'  : 'AC',
			'field': 'Address Control',
			'value': ac,
			'hex'  : [mBuffer.convDecToHexString(ac)],
			'bin'  : header_bin.substr(0, 3),
			'desc' : ac_desc
		},
		'EHA': {
			'key'  :' EHA',
			'field': 'Extended header available',
			'value': eha,
			'hex'  : [mBuffer.convDecToHexString(eha)],
			'bin'  : header_bin.substr(3, 1),
			'desc' : eha_desc
		},
		'TT': {
			'key'  :' TT',
			'field': 'Telegram type (R-ORG)',
			'value': tt,
			'hex'  : [mBuffer.convDecToHexString(tt)],
			'bin'  : header_bin.substr(4, 4),
			'desc' : tt_desc
		}
	};
	var header = {
		'field' : 'Header',
		'value' : header_value,
		'bin'   : ('0000000' + header_value.toString(2)).slice(-8),
		'hex'   : header_hex,
		'buffer': header_buffer,
		'values': header_values,
		'structure': [header_values['AC'], header_values['EHA'], header_values['TT']]
	};
	structure.push(header);

	// Extended header
	if(eha === 0b1) {
		// Currently not supported.
	}

	// Originator-ID
	var oid_length = 0;
	if(ac === 0b000) {
		oid_length = 3; // 24 bit
	} else if(ac === 0b001) {
		oid_length = 4; // 32 bit
	} else if(ac === 0b010) {
		oid_length = 4; // 32 bit
	} else if(ac === 0b011) {
		oid_length = 6; // 48 bit
	} else {
		return null;
	}
	var oid_offset = offset + 1;
	var oid_buffer = buf.slice(oid_offset, oid_offset + oid_length);
	var oid_hex = mBuffer.convBufferToHexString(oid_buffer);
	var oid_desc = oid_hex.join(' ');
	var oid = {
		'field' : 'Originator-ID',
		'hex'   : oid_hex,
		'buffer': oid_buffer,
		'desc'  : oid_desc
	};
	structure.push(oid);

	// Destination-ID
	var did = null;
	var did_length = 0;
	var did_offset = oid_offset + oid_length;
	if(ac === 0b010) {
		did_length = 4;
		var did_buffer = buf.slice(did_offset, did_offset + did_length);
		var did_hex = mBuffer.convBufferToHexString(did_buffer);
		did = {
			'field' : 'Destination-ID',
			'hex'   : did_hex,
			'buffer': did_buffer,
			'desc'  : did_hex.join(' ')
		};
		structure.push(did);
	}

	// Data of Data Link Layer (Data_DL)
	var dd_offset = did_offset + did_length;
	var dd_len = offset + len - dd_offset - 1;
	var dd_buffer = buf.slice(dd_offset, dd_offset + dd_len);
	var device = this.getDeviceInfo(oid_desc);
	var eep = '';
	if(device) {
		eep = device['eep'];
	}
	var dd = this._parseDataErp2TeachIn(tt, dd_buffer);
	if(dd) {
		if(dd['message']['eep']) {
			eep = dd['message']['eep'];
		}
	} else {
		dd = EepData.parse(eep, dd_buffer);
	}

	structure.push(dd);

	// CRC
	var crc_offset = dd_offset + dd_len;
	var crc_value = buf.readUInt8(crc_offset);
	var crc_buffer = buf.slice(crc_offset, crc_offset + 1);
	var crc_hex = mBuffer.convBufferToHexString(crc_buffer);
	var crc_valid = mCrc8.checkCrc8(crc_value, buf.slice(offset, crc_offset));
	var crc = {
		'field' : 'CRC',
		'value' : crc_value,
		'hex'   : crc_hex,
		'desc'  : crc_valid ? 'valid' : 'invalid'
	};
	structure.push(crc);

	if(device) {
		if(!device['manufacturer'] && dd['message']['manufacture_desc']) {
			device['manufacturer'] = dd['message']['manufacture_desc']
		}
	} else {
		device = {
			'id'  : this._normalizeDeviceId(oid_desc),
			'eep' : eep || '',
			'name': '',
			'manufacturer': dd['message']['manufacture_desc'] || '',
			'learned': false
		};
	};

	var message = {
		'device': device,
		'oid'   : oid_desc,
		'crc'   : crc_valid,
		'eep'   : eep,
		'known': EepData.isKnown(eep)
	};

	if(dd && ('message' in dd)) {
		var copied_dd = JSON.parse(JSON.stringify(dd['message']));
		for(var k in copied_dd) {
			message[k] = copied_dd[k];
		}
	}

	var eep_desc = mEepDesc.getEepDescription(eep);
	for(var k in eep_desc) {
		message[k] = eep_desc[k];
	}

	message['data_dl_buffer'] = dd_buffer;

	var parsed = {
		'field'    : 'Data',
		'message'  : message,
		'buffer'   : buffer,
		'hex'      : hex,
		'structure': structure
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp2TeachIn = function(tt, dd_buf) {
	if(tt === 0b0010) { // 4BS telegram (0xA5)
		return this._parseDataErp2TeachIn4bs(dd_buf);
	} else if(tt === 0b0001) { // 1BS telegram (0xD5)
		return this._parseDataErp2TeachIn1bs(dd_buf);
	} else {
		return null;
	}
}

EnoceanUtils.prototype._parseDataErp2TeachIn1bs = function(dd_buf) {
	// EEP 2.6.5 Specification P226
	var rorg = 0xD5;

	if(dd_buf.length !== 1) { return null; }
	var lrnb = (dd_buf.readUInt8(0) & 0b00001000) >> 3;
	if(lrnb !== 0) { return null; }

	var lrnb_hex = ('0' + lrnb.toString(16)).slice(-2).toUpperCase();
	var lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}	

	var values = {
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [lrnb_hex],
			'desc' : lrnb_desc
		}
	};

	var eep_value_list = [rorg]
	for(var i=0; i<eep_value_list.length; i++) {
		var v = ('0' + eep_value_list[i].toString(16)).slice(-2);
		eep_value_list[i] = v.toUpperCase();
	}
	var eep = eep_value_list.join('-');

	var message = {
		'eep'  : '',
		'mid' : '',
		'manufacture': '',
		'manufacture_desc': '',
		'desc' : '',
		'learn': true
	};

	var eep_desc = mEepDesc.getEepDescription(eep);
	for(var k in eep_desc) {
		message[k] = eep_desc[k];
	}

	var parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [
			values['LRNB']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp2TeachIn4bs = function(dd_buf) {
	// EEP 2.6.5 Specification P227
	var rorg = 0xA5;

	if(dd_buf.length !== 4) { return null; }
	var lrnb = (dd_buf.readUInt8(3) & 0b00001000) >> 3;
	if(lrnb !== 0) { return null; }

	var func = dd_buf.readUInt8(0) >> 2;
	var func_hex = ('0' + func.toString(16)).slice(-2).toUpperCase();
	var func_desc = func_hex;

	var type = dd_buf.readUInt16BE(0) >> 3;
	var type_hex = ('0' + type.toString(16)).slice(-2).toUpperCase();
	var type_desc = type_hex;

	var manufacturer = dd_buf.readUInt16BE(1) & 0b0000011111111111;
	var manufacturer_hex = ('000' + manufacturer.toString(16)).slice(-4).toUpperCase();
	var manufacturer_desc = mManufacturer.getManufacturerName(manufacturer);

	var lrn_type = (dd_buf.readUInt8(3) & 0b10000000) >> 7;
	var lrn_type_hex = ('0' + lrn_type.toString(16)).slice(-2).toUpperCase();
	var lrn_type_desc = '';
	if(lrn_type === 0) {
		lrn_type_desc = 'telegram without EEP and Manufacturer ID';
	} else if(lrn_type === 1) {
		lrn_type_desc = 'telegram with EEP number and Manufacturer ID';
	}

	var eep_res = (dd_buf.readUInt8(3) & 0b01000000) >> 6;
	var eep_res_hex = ('0' + eep_res.toString(16)).slice(-2).toUpperCase();
	var eep_res_desc = '';
	if(eep_res === 0) {
		eep_res_desc = 'EEP not supported';
	} else if(eep_res === 1) {
		eep_res_desc = 'EEP supported';
	}

	var lrn_res = (dd_buf.readUInt8(3) & 0b00100000) >> 5;
	var lrn_res_hex = ('0' + lrn_res.toString(16)).slice(-2).toUpperCase();
	var lrn_res_desc = '';
	if(lrn_res === 0) {
		lrn_res_desc = 'Sender ID deleted/not stored';
	} else if(lrn_res === 1) {
		lrn_res_desc = 'Sender ID stored';
	}

	var lrn_status = (dd_buf.readUInt8(3) & 0b00010000) >> 4;
	var lrn_status_hex = ('0' + lrn_status.toString(16)).slice(-2).toUpperCase();
	var lrn_status_desc = '';
	if(lrn_status === 0) {
		lrn_status_desc = 'Query';
	} else if(lrn_status === 1) {
		lrn_status_desc = 'Response';
	}

	var lrnb_hex = ('0' + lrnb.toString(16)).slice(-2).toUpperCase();
	var lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}	

	var values = {
		'FUNC': {
			'key'  : 'FUNC',
			'field': 'FUNC',
			'value': func,
			'hex'  : [func_hex],
			'desc' : func_desc
		},
		'TYPE': {
			'key'  : 'TYPE',
			'field': 'TYPE',
			'value': type,
			'hex'  : [type_hex],
			'desc' : type_desc
		},
		'MID': {
			'key'  : 'MID',
			'field': 'Manufacturer ID',
			'value': manufacturer,
			'hex'  : [manufacturer_hex],
			'desc' : manufacturer_desc
		},
		'LRNT': {
			'key'  : 'LRNT',
			'field': 'LRN Type',
			'value': lrn_type,
			'hex'  : [lrn_type_hex],
			'desc' : lrn_type_desc
		},
		'EEPR': {
			'key'  : 'EEPR',
			'field': 'EEP Result',
			'value': eep_res,
			'hex'  : [eep_res_hex],
			'desc' : eep_res_desc
		},
		'LRNR': {
			'key'  : 'LRNR',
			'field': 'LRN Result',
			'value': lrn_res,
			'hex'  : [lrn_res_hex],
			'desc' : lrn_res_desc
		},
		'LRNS': {
			'key'  : 'LRNS',
			'field': 'LRN Status',
			'value': lrn_status,
			'hex'  : [lrn_status_hex],
			'desc' : lrn_status_desc
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [lrnb_hex],
			'desc' : lrnb_desc
		}
	};

	var eep_value_list = [rorg, func, type]
	for(var i=0; i<3; i++) {
		var v = ('0' + eep_value_list[i].toString(16)).slice(-2);
		eep_value_list[i] = v.toUpperCase();
	}
	var eep = eep_value_list.join('-');

	var message = {
		'eep'  : eep,
		'mid' : manufacturer,
		'manufacture': values['MID']['value'],
		'manufacture_desc': values['MID']['desc'],
		'desc' : '',
		'learn': true,
	};

	var eep_desc = mEepDesc.getEepDescription(eep);
	for(var k in eep_desc) {
		message[k] = eep_desc[k];
	}

	var parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [
			values['FUNC'],
			values['TYPE'],
			values['MID'],
			values['LRNT'],
			values['EEPR'],
			values['LRNR'],
			values['LRNS'],
			values['LRNB']
		]
	};
	return parsed;
}

EnoceanUtils.prototype._parseTelegramOptionalData = function(buf, offset, len, packet_type) {
	// EnOcean Serial Protocol 3 specification P13
	if(packet_type === 0x01) {
		// RADIO_ERP1 (Radio telegram)
		return this._parseTelegramOptionalDataRadioErp1(buf, offset, len);
	} else if(packet_type === 0x03) {
		// RADIO_SUB_TEL (Radio subtelegram)
		return this._parseTelegramOptionalDataRadioSubTel(buf, offset, len);
	} else if(packet_type === 0x07) {
		// REMOTE_MAN_COMMAND (Remote management command)
		return this._parseTelegramOptionalDataRemoteManCommand(buf, offset, len);
	} else if(packet_type === 0x09) {
		// RADIO_MESSAGE (Radio message)
		return this._parseTelegramOptionalDataRadioMessage(buf, offset, len);
	} else if(packet_type === 0x0A) {
		// RADIO_ERP2 (ERP2 protocol radio telegram)
		return this._parseTelegramOptionalDataRadioErp2(buf, offset, len);
	} else {
		return this._parseTelegramOptionalDataUnknown(buf, offset, len);
	}
};

EnoceanUtils.prototype._parseTelegramOptionalDataUnknown = function(buf, offset, len) {
	var opt_buffer = buf.slice(offset, offset + len);
	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramOptionalDataRadioSubTel = function(buf, offset, len) {
	// EnOcean Serial Protocol 3 specification P20
	// I don't know wherther this method works well
	// because I don't have any devices which send RADIO_SUB_TEL telegrams.
	var opt_buffer = buf.slice(offset, offset + len);

	var sub_tel_num_value = buf.readUInt8(offset);
	var sub_tel_num_buffer = buf.slice(offset, offset + 1);

	var destination_id_buffer = buf.slice(offset + 1, offset + 5);
	var destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	var destination_id_desc = destination_id_hex.join(' ');
	var destination_id_value = destination_id_desc;

	var dbm_value = buf.readUInt8(offset + 5);
	var dbm_buffer = buf.slice(offset + 5, offset + 6);
	var dbm_desc = '-' + dbm_value + ' dBm';

	var security_level_value = buf.readUInt8(offset + 6);
	var security_level_buffer = buf.slice(offset + 6, offset + 7);

	var values = {
		'sub_tel_num': {
			'field' : 'SubTelNum',
			'buffer': sub_tel_num_buffer,
			'value' : sub_tel_num_value,
			'hex'   : mBuffer.convBufferToHexString(sub_tel_num_buffer),
			'desc'  : sub_tel_num_value.toString()
		},
		'destination_id': {
			'field' : 'Destination ID',
			'buffer': destination_id_buffer,
			'value' : destination_id_value,
			'hex'   : destination_id_hex,
			'desc'  : destination_id_desc
		},
		'dbm': {
			'field' : 'dBm',
			'buffer': dbm_buffer,
			'value' : dbm_value,
			'hex'   : mBuffer.convBufferToHexString(dbm_buffer),
			'desc'  : dbm_desc
		},
		'security_level': {
			'field' : 'SecurityLevel',
			'buffer': security_level_buffer,
			'value' : security_level_value,
			'hex'   : mBuffer.convBufferToHexString(security_level_buffer),
			'desc'  : security_level_value.toString()
		}
	};

	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {
			'dbm': 0 - dbm_value,
			'dbm_desc': dbm_desc
		},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
		'structure': [
			values['sub_tel_num'],
			values['destination_id'],
			values['dbm'],
			values['security_level']
		]
	};
	return parsed;

};

EnoceanUtils.prototype._parseTelegramOptionalDataRadioMessage = function(buf, offset, len) {
	// EnOcean Serial Protocol 3 specification P74
	// I don't know wherther this method works well
	// because I don't have any devices which send RADIO_MESSAGE telegrams.
	var opt_buffer = buf.slice(offset, offset + len);

	var destination_id_buffer = buf.slice(offset, offset + 4);
	var destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	var destination_id_desc = destination_id_hex.join(' ');
	var destination_id_value = destination_id_desc;

	var source_id_buffer = buf.slice(offset + 4, offset + 8);
	var source_id_hex = mBuffer.convBufferToHexString(source_id_buffer);
	var source_id_desc = source_id_hex.join(' ');
	var source_id_value = source_id_desc;

	var dbm_value = buf.readUInt8(offset + 8);
	var dbm_buffer = buf.slice(offset + 8, offset + 9);
	var dbm_desc = '-' + dbm_value + ' dBm';

	var values = {
		'destination_id': {
			'field' : 'Destination ID',
			'buffer': destination_id_buffer,
			'value' : destination_id_value,
			'hex'   : destination_id_hex,
			'desc'  : destination_id_desc
		},
		'source_id': {
			'field' : 'Source ID',
			'buffer': source_id_buffer,
			'value' : source_id_value,
			'hex'   : source_id_hex,
			'desc'  : source_id_desc
		},
		'dbm': {
			'field' : 'dBm',
			'buffer': dbm_buffer,
			'value' : dbm_value,
			'hex'   : mBuffer.convBufferToHexString(dbm_buffer),
			'desc'  : dbm_desc
		}
	};

	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {
			'dbm': 0 - dbm_value,
			'dbm_desc': dbm_desc
		},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
		'values'   : values,
		'structure': [
			values['destination_id'],
			values['source_id'],
			values['dbm']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramOptionalDataRemoteManCommand = function(buf, offset, len) {
	// EnOcean Serial Protocol 3 specification P72
	// I don't know wherther this method works well
	// because I don't have any devices which send REMOTE_MAN_COMMAND telegrams.
	var opt_buffer = buf.slice(offset, offset + len);

	var destination_id_buffer = buf.slice(offset, offset + 4);
	var destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	var destination_id_desc = destination_id_hex.join(' ');
	var destination_id_value = destination_id_desc;

	var source_id_buffer = buf.slice(offset + 4, offset + 8);
	var source_id_hex = mBuffer.convBufferToHexString(source_id_buffer);
	var source_id_desc = source_id_hex.join(' ');
	var source_id_value = source_id_desc;

	var dbm_value = buf.readUInt8(offset + 8);
	var dbm_buffer = buf.slice(offset + 8, offset + 9);
	var dbm_desc = '-' + dbm_value + ' dBm';

	var send_with_delay_value = buf.readUInt8(offset + 9);
	var send_with_delay_buffer = buf.slice(offset + 9, offset + 10);

	var values = {
		'destination_id': {
			'field' : 'Destination ID',
			'buffer': destination_id_buffer,
			'value' : destination_id_value,
			'hex'   : destination_id_hex,
			'desc'  : destination_id_desc
		},
		'source_id': {
			'field' : 'Source ID',
			'buffer': source_id_buffer,
			'value' : source_id_value,
			'hex'   : source_id_hex,
			'desc'  : source_id_desc
		},
		'dbm': {
			'field' : 'dBm',
			'buffer': dbm_buffer,
			'value' : dbm_value,
			'hex'   : mBuffer.convBufferToHexString(dbm_buffer),
			'desc'  : dbm_desc
		},
		'send_with_delay': {
			'field' : 'Send With Delay',
			'buffer': send_with_delay_buffer,
			'value' : send_with_delay_value,
			'hex'   : mBuffer.convBufferToHexString(send_with_delay_buffer),
			'desc'  : send_with_delay_value.toString()
		}
	};

	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {
			'dbm': 0 - dbm_value,
			'dbm_desc': dbm_desc
		},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
		'values'   : values,
		'structure': [
			values['destination_id'],
			values['source_id'],
			values['dbm'],
			values['send_with_delay']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramOptionalDataRadioErp1 = function(buf, offset, len) {
	// EnOcean Serial Protocol 3 specification P15
	// I don't know wherther this method works well
	// because I don't have any devices which send RADIO_ERP1 telegrams.
	var opt_buffer = buf.slice(offset, offset + len);

	var sub_tel_num_value = buf.readUInt8(offset);
	var sub_tel_num_buffer = buf.slice(offset, offset + 1);

	var destination_id_buffer = buf.slice(offset + 1, offset + 5);
	var destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	var destination_id_desc = destination_id_hex.join(' ');
	var destination_id_value = destination_id_desc;

	var dbm_value = buf.readUInt8(offset + 5);
	var dbm_buffer = buf.slice(offset + 5, offset + 6);
	var dbm_desc = '-' + dbm_value + ' dBm';

	var security_level_value = buf.readUInt8(offset + 6);
	var security_level_buffer = buf.slice(offset + 6, offset + 7);

	var values = {
		'sub_tel_num': {
			'field' : 'SubTelNum',
			'buffer': sub_tel_num_buffer,
			'value' : sub_tel_num_value,
			'hex'   : mBuffer.convBufferToHexString(sub_tel_num_buffer),
			'desc'  : sub_tel_num_value.toString()
		},
		'destination_id': {
			'field' : 'Destination ID',
			'buffer': destination_id_buffer,
			'value' : destination_id_value,
			'hex'   : destination_id_hex,
			'desc'  : destination_id_desc
		},
		'dbm': {
			'field' : 'dBm',
			'buffer': dbm_buffer,
			'value' : dbm_value,
			'hex'   : mBuffer.convBufferToHexString(dbm_buffer),
			'desc'  : dbm_desc
		},
		'security_level': {
			'field' : 'SecurityLevel',
			'buffer': security_level_buffer,
			'value' : security_level_value,
			'hex'   : mBuffer.convBufferToHexString(security_level_buffer),
			'desc'  : security_level_value.toString()
		}
	};

	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {
			'dbm': 0 - dbm_value,
			'dbm_desc': dbm_desc
		},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
		'structure': [
			values['sub_tel_num'],
			values['destination_id'],
			values['dbm'],
			values['security_level']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramOptionalDataRadioErp2 = function(buf, offset, len) {
	// EnOcean Serial Protocol 3 specification P76
	var opt_buffer = buf.slice(offset, offset + len);

	var sub_tel_num_value = buf.readUInt8(offset);
	var sub_tel_num_buffer = buf.slice(offset, offset + 1);

	var dbm_value = buf.readUInt8(offset + 1);
	var dbm_buffer = buf.slice(offset + 1, offset + 2);
	var dbm_desc = '-' + dbm_value + ' dBm';

	var values = {
		'sub_tel_num': {
			'field' : 'SubTelNum',
			'buffer': sub_tel_num_buffer,
			'value' : sub_tel_num_value,
			'hex'   : mBuffer.convBufferToHexString(sub_tel_num_buffer),
			'desc'  : sub_tel_num_value.toString()
		},
		'dbm': {
			'field' : 'dBm',
			'buffer': dbm_buffer,
			'value' : dbm_value,
			'hex'   : mBuffer.convBufferToHexString(dbm_buffer),
			'desc'  : dbm_desc
		}
	};

	var parsed = {
		'field'    : 'Optional Data',
		'message'  : {
			'dbm': 0 - dbm_value,
			'dbm_desc': dbm_desc
		},
		'buffer'   : opt_buffer,
		'hex'      : mBuffer.convBufferToHexString(opt_buffer),
		'structure': [
			values['sub_tel_num'],
			values['dbm']
		]
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramCrcd8 = function(buf, offset) {
	var value = buf.readUInt8(offset);
	var buffer = buf.slice(offset, offset + 1);
	var hex = mBuffer.convBufferToHexString(buffer);
	var valid = mCrc8.checkCrc8(value, buf.slice(6, offset));
	var parsed = {
		'field'    : 'CRC8D',
		'message'  : {
			'valid': valid
		},
		'buffer'   : buffer,
		'hex'      : hex,
		'desc'     : valid ? 'valid' : 'invalid'
	};
	return parsed;
};

module.exports = new EnoceanUtils();	