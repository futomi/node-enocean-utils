/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils.js
*
* Copyright (c) 2016 - 2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2019-03-26
*
* [Abstract]
*
* The node-enocean-utils is a Node.js module which allows you to get
* and analyze detagrams came from EnOcean devices via a USB gateway
* such as USB 300/300U/400J.
*
* This module is based on EnOcean specification as follows:
* - EnOcean Serial Protocol 3
* - EnOcean Radio Protocol 1
* - EnOcean Radio Protocol 2
* - EnOcean Equipment Profiles 2.6.5
* See the EnOcean web site for details (https://www.enocean.com/).
*
* [Dependencies]
*  - serialport
*      https://www.npmjs.com/package/serialport
* ---------------------------------------------------------------- */
'use strict';
const mEventEmitter = require('events').EventEmitter;
const mSerialPort   = require('serialport');
const mUtil         = require('util');
const mEepDesc      = require('./node-enocean-utils-eep-desc.js');
const mManufacturer = require('./node-enocean-utils-manufacturer.js');
const mCrc8         = require('./node-enocean-utils-crc8.js');
const mPacketType   = require('./node-enocean-utils-packet-type.js');
const mBuffer       = require('./node-enocean-utils-buffer.js');
const EepData       = require('./node-enocean-utils-eep-data.js');
const mGateway      = require('../lib/node-enocean-utils-gateway.js');

/* ------------------------------------------------------------------
* Constructor: EnoceanUtils()
* ---------------------------------------------------------------- */
const EnoceanUtils = function() {
	this._default_baud_rate = 57600;
	this._baud_rate = 57600;
	this._path = '';
	this._devices = {};
	this._port = null;
	this._telegram_buffer = null;
	this._gateway = null;
	mEventEmitter.call(this);
};
mUtil.inherits(EnoceanUtils, mEventEmitter);

EnoceanUtils.prototype._isValidCallback = function(callback) {
	return (callback && typeof(callback) === 'function') ? true : false;
};

EnoceanUtils.prototype._execCallback = function(callback, arg1, arg2) {
	if(this._isValidCallback(callback)) {
		callback(arg1, arg2);
	}
};

/* ------------------------------------------------------------------
* Method: emulateIncomingTelegram(telegram)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.emulateIncomingTelegram = function(telegram) {
	let buf = null;
	if(typeof(telegram) === 'string') {
		if(/^[a-fA-F0-9\s]+/.test(telegram)) {
			let hex = telegram.replace(/\s/g, '');
			buf = Buffer.alloc(hex.length / 2);
			for(let i=0; i<hex.length; i+=2) {
				let h = hex.substr(i, 2);
				let n = parseInt(h, 16);
				buf.writeUInt8(n, i/2);
			}
		} else {
			throw new Error('The `telegram` must be a hexadecimal representation.');
		}
	} else if(Buffer.isBuffer(telegram)) {
		buf = telegram;
	} else {
		throw new Error('The `telegrams` must be a string or a Buffer object.');
	}
	if(!this._port) {
		throw new Error('No serial port was found.');
	}
	this._port.emit('data', buf);
};

/* ------------------------------------------------------------------
* Method: teach(params)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.teach = function(params) {
	// The module ID of the device (required)
	let id = ('id' in params) ? params['id'] : '';
	// The EEP supported by the device (required)
	let eep = ('eep' in params) ? params['eep'] : '';
	// The name of the device (optional)
	let name = ('name' in params) ? params['name'] : '';
	// The manufacturer of the module in the device (optional)
	let manufacturer = ('manufacturer' in params) ? params['manufacturer'] : '';

	// Check the value of 'id'
	let id_err = this._checkDeviceId(id);
	if(id_err) {
		throw new Error('The value of the "id" member in the 1st augument of the teach() method is invalid: ' + id_err);
	} else {
		id = this._normalizeDeviceId(id);
	}

	// Check the value of 'eep'
	let eep_err = this._checkDeviceEep(eep);
	if(eep_err) {
		throw new Error('The value of the "eep" member in the 1st augument of the teach() method is invalid: ' + eep_err);
	} else {
		eep = this._normalizeDeviceEep(eep);
	}

	// Check the value of 'name'
	if(name) {
		let name_err = this._checkDeviceName(name);
		if(name_err) {
			throw new Error('The value of the "name" member in the 1st augument of the teach() method is invalid: ' + name_err);
		}
	}

	// Check the value of 'manufacturer'
	if(manufacturer) {
		let manufacturer_err = this._checkDeviceManufacturer(manufacturer);
		if(manufacturer_err) {
			throw new Error('The value of the "manufacturer" member in the 1st augument of the teach() method is invalid: ' + manufacturer_err);
		}
	}

	// Register the device
	this._devices[id] = {
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
		let id_len = id.length;
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
		let m = eep.match(/^([0-9A-F]{2})\-([0-9A-F]{2})\-([0-9A-F]{2})$/);
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
	let id_err = this._checkDeviceId(id);
	if(id_err) {
		return null;
	}
	id = this._normalizeDeviceId(id);
	if(id in this._devices) {
		return JSON.parse(JSON.stringify(this._devices[id]));
	} else {
		return null;
	}
};

/* ------------------------------------------------------------------
* Method: getLearnedDevices()
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.getLearnedDevices = function() {
	return JSON.parse(JSON.stringify(this._devices));
};

/* ------------------------------------------------------------------
* Method: setDeviceName(id, name)
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.setDeviceName = function(id, name) {
	let id_err = this._checkDeviceId(id);
	if(id_err) {
		throw new Error('The 1st augument (id) of the setDeviceName() method is invalid: ' + id_err);
	}

	let name_err = this._checkDeviceName(name);
	if(name_err) {
		throw new Error('The 2nd augument (name) of the setDeviceName() method is invalid: ' + name_err);
	}

	let device = this.getDeviceInfo(id);
	if(device) {
		device['name'] = name;
		return this.getDeviceInfo(id);
	} else {
		return null;
	}
};

/* ------------------------------------------------------------------
* Method: startMonitor([params[, callback]])
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.startMonitor = function(params, callback) {
	let promise = new Promise((resolve, reject) => {
		if(!params) {
			params = {};
		}
		if(typeof(params) !== 'object') {
			reject(new Error('The 1st argument of the startMonitor() must be an object.'));
		}
		if('path' in params) {
			let path = params['path'];
			if(typeof(path) === 'string' && path !== '') {
				this._path = path;
			} else {
				reject(new Error('The "path" member in the 1st argument of the startMonitor() is invalid.'));
			}
		}
		if('rate' in params) {
			let rate = params['rate'];
			if(typeof(rate) === 'number') {
				this._baud_rate = rate;
			} else {
				reject(new Error('The "rate" member in the 1st argument of the startMonitor() is invalid.'));
			}
		} else {
			this.rate = this._default_baud_rate;
		}

		this.stopMonitor().then(() => {
			return this._openSerialPort({
				path: this._path,
				baudRate: this._baud_rate
			});
		}).then((res) => {
			this._port = res['port'];
			this._path = this._port.path;
			this._gateway = res['gateway'];
			this._initSerialPort();
			resolve(JSON.parse(JSON.stringify(this._gateway)));
		}).catch((error) => {
			reject(error);
		});
	});

	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null, JSON.parse(JSON.stringify(this._gateway)));
		}).catch((error) => {
			this._execCallback(callback, error, null);
		});
	} else {
		return promise;
	}
};

EnoceanUtils.prototype._openSerialPort = function(p) {
	let promise = new Promise((resolve, reject) => {
		let gateway = null;
		this._findGateway(p).then((gw) => {
			gateway = gw;
			return this._tryOpenSerialPort(gw['path'], p['baudRate']);
		}).then((port) => {
			resolve({
				port   : port,
				gateway: gateway
			});
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnoceanUtils.prototype._findGateway = function(p) {
	let promise = new Promise((resolve, reject) => {
		mGateway.find(p).then((gw) => {
			resolve(gw);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnoceanUtils.prototype._tryOpenSerialPort = function(path, rate) {
	let promise = new Promise((resolve, reject) => {
		let port = new mSerialPort(path, {
			baudRate: rate
		});
		port.once('error', (error) => {
			reject(error);
		});
		port.once('open', () => {
			resolve(port);
		});
	});
	return promise;
};

EnoceanUtils.prototype._initSerialPort = function() {
	this._telegram_buffer = null;
	this._port.on('data', (buf) => {
		if(buf.readUInt8(0) === 0x55) {
			this._telegram_buffer = buf;
		} else if(this._telegram_buffer !== null) {
			this._telegram_buffer = Buffer.concat([this._telegram_buffer, buf]);
		} else {
			return;
		}
		if(this._telegram_buffer === null || this._telegram_buffer.length <= 6) {
			return;
		}
		let x = this._telegram_buffer.readUInt16BE(1);
		let y = this._telegram_buffer.readUInt8(3);
		let valid_length = 6 + x + y + 1;
		if(this._telegram_buffer.length === valid_length) {
			let parsed = this._parseTelegram(this._telegram_buffer);
			if(parsed['message']['learn'] === true) {
				this.emit('data-learn', parsed);
			} else if(parsed['message']['known'] === true) {
				this.emit('data-known', parsed);
			} else {
				this.emit('data-unknown', parsed);
			}
			this.emit('data', parsed);
			this._telegram_buffer = null;
		}
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitor([callback])
* ---------------------------------------------------------------- */
EnoceanUtils.prototype.stopMonitor = function(callback) {
	let promise = new Promise((resolve, reject) => {
		if(this._port) {
			this._port.removeAllListeners('data');
			this._closeSerialPort(() => {
				this._port = null;
				this._gateway = null;
				resolve();
			});
		} else {
			this._port = null;
			this._gateway = null;
			resolve();
		}
	});

	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null, null);
		}).catch((error) => {
			this._execCallback(callback, error, null);
		});
	} else {
		return promise;
	}
};

EnoceanUtils.prototype._closeSerialPort = function(callback) {
	if(this._port && this._port.isOpen) {
		this._port.close(callback);
	} else {
		callback();
	}
};

EnoceanUtils.prototype._parseTelegram = function(buf) {
	let structure = [];
	// Sync. Byte
	let sync = this._parseTelegramSyncByte(buf);
	structure.push(sync);
	// Header
	let header = this._parseTelegramHeader(buf);
	let data_length = header['values']['data_length']['value'];
	let opt_length = header['values']['optional_length']['value'];	
	let packet_type = header['values']['packet_type']['value'];
	let packet_type_desc = header['values']['packet_type']['desc'];
	structure.push(header);
	// CRC8H
	let crc8h = this._parseTelegramCrch8(buf);
	structure.push(crc8h);
	// Data
	let data_offset = 6;
	let data = this._parseData(buf, data_offset, data_length, packet_type);
	structure.push(data);
	// Optional Data
	let opt_offset = data_offset + data_length;
	let optional_data = null;
	if(opt_length > 0) {
		optional_data = this._parseTelegramOptionalData(buf, opt_offset, opt_length, packet_type);
		structure.push(optional_data);
	}
	// CRC8D
	let crc8d_offset = opt_offset + opt_length;
	let crc8d = this._parseTelegramCrcd8(buf, crc8d_offset);
	structure.push(crc8d);

	// Create a return object
	let message = {};
	message['packet_type'] = packet_type;
	message['packet_type_desc'] = packet_type_desc;
	for(let k in data['message']) {
		message[k] = data['message'][k];
	}
	if(optional_data) {
		for(let k in optional_data['message']) {
			message[k] = optional_data['message'][k];
		}
	}
	message['crc'] = message['crc'] && crc8h['message']['valid'] && crc8d['message']['valid'];

	let telegram = {
		'message'  : message,
		'buffer'   : buf,
		'hex'      : mBuffer.convBufferToHexString(buf),
		'structure': structure
	};
	return telegram;
};

EnoceanUtils.prototype._parseTelegramSyncByte = function(buf) {
	let value = buf.readUInt8(0);
	let buffer = buf.slice(0, 1);
	let hex = mBuffer.convBufferToHexString(buffer);
	let parsed = {
		'field' : 'Sync. Byte',
		'buffer': buffer,
		'value' : value,
		'hex'   : hex,
		'desc'  : hex
	};
	return parsed;
};

EnoceanUtils.prototype._parseTelegramHeader = function(buf) {
	let header_buffer = buf.slice(1, 5);

	let data_length_value = buf.readUInt16BE(1);
	let data_length_buffer = buf.slice(1, 3);

	let opt_length_value = buf.readUInt8(3);
	let opt_length_buffer = buf.slice(3, 4);

	let packet_type_value = buf.readUInt8(4);
	let packet_type_buffer = buf.slice(4, 5);

	let values = {
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

	let parsed = {
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
	let value = buf.readUInt8(5);
	let buffer = buf.slice(5, 6);
	let valid = mCrc8.checkCrc8(value, buf.slice(1, 5));
	let parsed = {
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
	//if(packet_type === 0x0A || packet_type === 0x01) {
	if(packet_type === 0x0A) {
		// 0x0A: RADIO_ERP2 (ERP2 protocol radio telegram)
		return this._parseDataErp2(buf, offset, len);
	} else if(packet_type === 0x01) {
		// 0x01: RADIO_ERP1 (ERP1 protocol radio telegram)
		return this._parseDataErp1(buf, offset, len);
	} else {
		return this._parseDataUnknown(buf, offset, len);
	}
};

EnoceanUtils.prototype._parseDataUnknown = function(buf, offset, len) {
	let buffer = buf.slice(offset, len);
	let hex = mBuffer.convBufferToHexString(buffer);
	let parsed = {
		'field'    : 'Data',
		'message'  : {},
		'buffer'   : buffer,
		'hex'      : hex
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp2 = function(buf, offset, len) {
	// EnOcean Radio Protocol 2 specification P16
	let buffer = buf.slice(offset, len);
	let hex = mBuffer.convBufferToHexString(buffer);
	let structure = [];

	// Header (1 byte)
	let header_value = buf.readUInt8(offset);
	let header_buffer = buf.slice(offset, offset + 1);
	let header_hex = mBuffer.convBufferToHexString(header_buffer);
	let header_bin = ('0000000' + header_value.toString(2)).slice(-8);
	// - Address Control (3 bit)
	let ac = header_value >> 5;
	let ac_map = {
		0b000: 'Originator-ID 24 bit; no Destination-ID',
		0b001: 'Originator-ID 32 bit; no Destination-ID',
		0b010: 'Originator-ID 32 bit, Destination-ID 32 bit',
		0b011: 'Originator-ID 48 bit, no Destination-ID',
		0b100: 'reserved101: reserved110',
		0b111: 'reserved'
	};
	let ac_desc = ac_map[ac] || '';
	// - Extended header available (1 bit)
	let eha = (header_value & 0b00010000) >> 4;
	let eha_map = {
		0b0: 'No extended header',
		0b1: 'Extended header available'
	};
	let eha_desc = eha_map[eha] || '';
	// - Telegram type (R-ORG) (4 bit)
	let tt = header_value & 0b00001111;
	let tt_map = {
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
	let tt_desc = tt_map[tt] || '';

	let header_values = {
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
	let header = {
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
	let oid_length = 0;
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
	let oid_offset = offset + 1;
	let oid_buffer = buf.slice(oid_offset, oid_offset + oid_length);
	let oid_hex = mBuffer.convBufferToHexString(oid_buffer);
	let oid_desc = oid_hex.join(' ');
	let oid = {
		'field' : 'Originator-ID',
		'hex'   : oid_hex,
		'buffer': oid_buffer,
		'desc'  : oid_desc
	};
	structure.push(oid);

	// Destination-ID
	let did = null;
	let did_length = 0;
	let did_offset = oid_offset + oid_length;
	if(ac === 0b010) {
		did_length = 4;
		let did_buffer = buf.slice(did_offset, did_offset + did_length);
		let did_hex = mBuffer.convBufferToHexString(did_buffer);
		did = {
			'field' : 'Destination-ID',
			'hex'   : did_hex,
			'buffer': did_buffer,
			'desc'  : did_hex.join(' ')
		};
		structure.push(did);
	}

	// Data of Data Link Layer (Data_DL)
	let dd_offset = did_offset + did_length;
	let dd_len = offset + len - dd_offset - 1;
	let dd_buffer = buf.slice(dd_offset, dd_offset + dd_len);
	let device = this.getDeviceInfo(oid_desc);
	let eep = '';
	if(device) {
		eep = device['eep'];
	}
	let dd = this._parseDataErp2TeachIn(tt, dd_buffer);
	if(dd) {
		if(dd['message']['eep']) {
			eep = dd['message']['eep'];
		}
	} else {
		dd = EepData.parse(eep, dd_buffer);
	}

	structure.push(dd);

	// CRC
	let crc_offset = dd_offset + dd_len;
	let crc_value = buf.readUInt8(crc_offset);
	let crc_buffer = buf.slice(crc_offset, crc_offset + 1);
	let crc_hex = mBuffer.convBufferToHexString(crc_buffer);
	let crc_valid = mCrc8.checkCrc8(crc_value, buf.slice(offset, crc_offset));
	let crc = {
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

	let message = {
		'device': device,
		'oid'   : oid_desc,
		'crc'   : crc_valid,
		'eep'   : eep,
		'known': EepData.isKnown(eep)
	};

	if(dd && ('message' in dd)) {
		let copied_dd = JSON.parse(JSON.stringify(dd['message']));
		for(let k in copied_dd) {
			message[k] = copied_dd[k];
		}
	}

	let eep_desc = mEepDesc.getEepDescription(eep);
	for(let k in eep_desc) {
		message[k] = eep_desc[k];
	}

	message['data_dl_buffer'] = dd_buffer;

	let parsed = {
		'field'    : 'Data',
		'message'  : message,
		'buffer'   : buffer,
		'hex'      : hex,
		'structure': structure
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp2TeachIn = function(tt, dd_buf) {
	if(tt === 0b0010 || tt === 0xA5) { // 4BS telegram (0xA5)
		return this._parseDataErp2TeachIn4bs(dd_buf);
	} else if(tt === 0b0001 || tt === 0xD5) { // 1BS telegram (0xD5)
		return this._parseDataErp2TeachIn1bs(dd_buf);
	} else {
		return null;
	}
}

EnoceanUtils.prototype._parseDataErp2TeachIn1bs = function(dd_buf) {
	// EEP 2.6.5 Specification P226
	let rorg = 0xD5;

	if(dd_buf.length !== 1) { return null; }
	let lrnb = (dd_buf.readUInt8(0) & 0b00001000) >> 3;
	if(lrnb !== 0) { return null; }

	let lrnb_hex = ('0' + lrnb.toString(16)).slice(-2).toUpperCase();
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}	

	let values = {
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [lrnb_hex],
			'desc' : lrnb_desc
		}
	};

	let eep_value_list = [rorg]
	for(let i=0; i<eep_value_list.length; i++) {
		let v = ('0' + eep_value_list[i].toString(16)).slice(-2);
		eep_value_list[i] = v.toUpperCase();
	}
	let eep = eep_value_list.join('-');

	let message = {
		'eep'  : '',
		'mid' : '',
		'manufacture': '',
		'manufacture_desc': '',
		'desc' : '',
		'learn': true
	};

	let eep_desc = mEepDesc.getEepDescription(eep);
	for(let k in eep_desc) {
		message[k] = eep_desc[k];
	}

	let parsed = {
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
	let rorg = 0xA5;

	if(dd_buf.length !== 4) { return null; }
	let lrnb = (dd_buf.readUInt8(3) & 0b00001000) >> 3;
	if(lrnb !== 0) { return null; }

	let func = dd_buf.readUInt8(0) >> 2;
	let func_hex = ('0' + func.toString(16)).slice(-2).toUpperCase();
	let func_desc = func_hex;

	let type = dd_buf.readUInt16BE(0) >> 3;
	let type_hex = ('0' + type.toString(16)).slice(-2).toUpperCase();
	let type_desc = type_hex;

	let manufacturer = dd_buf.readUInt16BE(1) & 0b0000011111111111;
	let manufacturer_hex = ('000' + manufacturer.toString(16)).slice(-4).toUpperCase();
	let manufacturer_desc = mManufacturer.getManufacturerName(manufacturer);

	let lrn_type = (dd_buf.readUInt8(3) & 0b10000000) >> 7;
	let lrn_type_hex = ('0' + lrn_type.toString(16)).slice(-2).toUpperCase();
	let lrn_type_desc = '';
	if(lrn_type === 0) {
		lrn_type_desc = 'telegram without EEP and Manufacturer ID';
	} else if(lrn_type === 1) {
		lrn_type_desc = 'telegram with EEP number and Manufacturer ID';
	}

	let eep_res = (dd_buf.readUInt8(3) & 0b01000000) >> 6;
	let eep_res_hex = ('0' + eep_res.toString(16)).slice(-2).toUpperCase();
	let eep_res_desc = '';
	if(eep_res === 0) {
		eep_res_desc = 'EEP not supported';
	} else if(eep_res === 1) {
		eep_res_desc = 'EEP supported';
	}

	let lrn_res = (dd_buf.readUInt8(3) & 0b00100000) >> 5;
	let lrn_res_hex = ('0' + lrn_res.toString(16)).slice(-2).toUpperCase();
	let lrn_res_desc = '';
	if(lrn_res === 0) {
		lrn_res_desc = 'Sender ID deleted/not stored';
	} else if(lrn_res === 1) {
		lrn_res_desc = 'Sender ID stored';
	}

	let lrn_status = (dd_buf.readUInt8(3) & 0b00010000) >> 4;
	let lrn_status_hex = ('0' + lrn_status.toString(16)).slice(-2).toUpperCase();
	let lrn_status_desc = '';
	if(lrn_status === 0) {
		lrn_status_desc = 'Query';
	} else if(lrn_status === 1) {
		lrn_status_desc = 'Response';
	}

	let lrnb_hex = ('0' + lrnb.toString(16)).slice(-2).toUpperCase();
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}	

	let values = {
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

	let eep_value_list = [rorg, func, type]
	for(let i=0; i<3; i++) {
		let v = ('0' + eep_value_list[i].toString(16)).slice(-2);
		eep_value_list[i] = v.toUpperCase();
	}
	let eep = eep_value_list.join('-');

	let message = {
		'eep'  : eep,
		'mid' : manufacturer,
		'manufacture': values['MID']['value'],
		'manufacture_desc': values['MID']['desc'],
		'desc' : '',
		'learn': true,
	};

	let eep_desc = mEepDesc.getEepDescription(eep);
	for(let k in eep_desc) {
		message[k] = eep_desc[k];
	}

	let parsed = {
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

EnoceanUtils.prototype._parseDataErp1 = function(buf, offset, len) {
	if(len < 7) {
		return this._parseDataUnknown(buf, offset, len);
	}

	let buffer = buf.slice(offset, len);
	let hex = mBuffer.convBufferToHexString(buffer);
	let structure = [];
	// R-ORG
	let rorg_value = buf.readUInt8(offset);
	let rorg_map = {
		0xF6: 'RPS telegram (0xF6)',
		0xD5: '1BS telegram (0xD5)',
		0xA5: '4BS telegram (0xA5)',
		0xD0: 'Smart Acknowledge Signal telegram (0xD0)',
		0xD2: 'Variable length data telegram (0xD2)',
		0xD4: 'Universal Teach-In EEP based (0xD4)',
		0xD1: 'Manufacturer Specific Communication (0xD1)',
		0x30: 'Secure telegram (0x30)',
		0x31: 'Secure telegram with encapsulation (0x31)',
		0x35: 'Secure Teach-In telegram for switch (0x35)',
		0xB3: 'Generic Profiles selective data (0xB3)'
	};
	let rorg_buffer = buf.slice(offset, offset + 1);
	structure.push({
		'field' : 'R-ORG',
		'hex'   : mBuffer.convBufferToHexString(rorg_buffer),
		'buffer': rorg_buffer,
		'desc'  : rorg_map[rorg_value] || ''
	});

	// Originator-ID (TXID)
	let oid_offset = offset + len - 5;
	let oid_buffer = buf.slice(oid_offset, oid_offset + 4);
	let oid_hex = mBuffer.convBufferToHexString(oid_buffer);
	let oid_desc = oid_hex.join(' ');
	let oid = {
		'field' : 'Originator-ID',
		'hex'   : oid_hex,
		'buffer': oid_buffer,
		'desc'  : oid_desc
	};

	// Data of Data Link Layer (Data_DL)
	let dd_offset = offset + 1;
	let dd_len = len - 6;
	let dd_buffer = buf.slice(dd_offset, dd_offset + dd_len);
	let device = this.getDeviceInfo(oid_desc);
	let eep = '';
	if(device) {
		eep = device['eep'];
	}

	let dd = this._parseDataErp1TeachIn(rorg_value, dd_buffer);
	if(dd) {
		if(dd['message']['eep']) {
			eep = dd['message']['eep'];
		}
	} else {
		dd = EepData.parse(eep, dd_buffer);
	}

	structure.push(dd);
	structure.push(oid);

	// Status
	let sts_offset = offset + len - 1;
	let sts_buffer = buf.slice(sts_offset, sts_offset + 1);
	let sts_hex = mBuffer.convBufferToHexString(sts_buffer);
	let sts_value = sts_buffer.readUInt8(0) & 0b00001111;
	let sts_desc = '';
	if(sts_value === 0b00000000) {
		sts_desc = 'Original sender';
	} else if(sts_value === 0b00000001) {
		sts_desc = 'Subtelegram was repeated 1 time';
	} else if(sts_value === 0b00000010) {
		sts_desc = 'Subtelegram was repeated 2 times';
	} else if(sts_value === 0b00001111) {
		sts_desc = 'Telegram shall not be repeated';
	}
	let sts = {
		'field' : 'Status',
		'hex'   : sts_hex,
		'buffer': sts_buffer,
		'desc'  : sts_desc + ', ' + sts_value.toString()
	};
	structure.push(sts);

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

	let message = {
		'device': device,
		'oid'   : oid_desc,
		'eep'   : eep,
		'known': EepData.isKnown(eep)
	};

	if(dd && ('message' in dd)) {
		let copied_dd = JSON.parse(JSON.stringify(dd['message']));
		for(let k in copied_dd) {
			message[k] = copied_dd[k];
		}
	}

	let eep_desc = mEepDesc.getEepDescription(eep);
	for(let k in eep_desc) {
		message[k] = eep_desc[k];
	}

	message['data_dl_buffer'] = dd_buffer;

	let parsed = {
		'field'    : 'Data',
		'message'  : message,
		'buffer'   : buffer,
		'hex'      : hex,
		'structure': structure
	};
	return parsed;
};

EnoceanUtils.prototype._parseDataErp1TeachIn = function(tt, dd_buf) {
	if(tt === 0xA5) { // 4BS telegram (0xA5)
		return this._parseDataErp1TeachIn4bs(dd_buf);
	} else if(tt === 0xD4) { // Universal Teach-In EEP based (0xD4)
		return this._parseDataErp1TeachInUte(dd_buf);
	} else if(tt === 0xD5) { // 1BS telegram (0xD5)
		return this._parseDataErp1TeachIn1bs(dd_buf);
	} else {
		return null;
	}
}

EnoceanUtils.prototype._parseDataErp1TeachIn1bs = function(dd_buf) {
	// Not supported for now.
	return null;
};

EnoceanUtils.prototype._parseDataErp1TeachInUte = function(dd_buf) {
	if(dd_buf.length !== 7) { return null; }
	let db6_n = dd_buf.readUInt8(0);
	let db5_n = dd_buf.readUInt8(1);
	let db4_n = dd_buf.readUInt8(2);
	let db3_n = dd_buf.readUInt8(3);
	let db2_n = dd_buf.readUInt8(4);
	let db1_n = dd_buf.readUInt8(5);
	let db0_n = dd_buf.readUInt8(6);

	// Uni-bi-directional communication (EEP operation)
	let direc = (db6_n & 0b10000000) >>> 7;
	let direc_hex = ('0' + direc.toString(16)).slice(-2).toUpperCase();
	let direc_desc = '';
	if(direc === 0b0) {
		direc_desc = 'Unidirectional communication (EEP opeartion)';
	} else if(direc === 0b1) {
		direc_desc = 'Bidirectional communication (EEP opeartion)';
	}
	// EEP Teach-In-Response message expected y/n
	let expec = (db6_n & 0b01000000) >>> 6;
	let expec_hex = ('0' + expec.toString(16)).slice(-2).toUpperCase();
	let expec_desc = '';
	if(expec === 0b0) {
		expec_desc = 'EEP Teach-In Response message expected';
	} else if(expec === 0b1) {
		expec_desc = 'No EEP Teach-In-Response message expected';
	}
	// Request accepted
	let accep = (db6_n & 0b00110000) >>> 4;
	let accep_hex = ('0' + accep.toString(16)).slice(-2).toUpperCase();
	let accep_desc = '';
	if(accep === 0b00) {
		accep_desc = 'Request not accepted, general reason';
	} else if(accep === 0b01) {
		accep_desc = 'Request accepted, teach-in successful';
	} else if(accep === 0b10) {
		accep_desc = 'Request accepted, deletion of teach-in successful';
	} else if(accep === 0b11) {
		accep_desc = 'Request not accepted, EEP not supported';
	}
	// Command identifier (CMD)
	let cmd = (db6_n & 0b00001111);
	let cmd_hex = ('0' + cmd.toString(16)).slice(-2).toUpperCase();
	let cmd_desc = '';
	if(cmd === 0b0) {
		cmd_desc = 'EEP Teach-In Query';
	} else if(cmd === 0b1) {
		cmd_desc = 'EEP Teach-In Response';
	}
	// No. of individual channel to be taught in
	let chann = db5_n;
	let chann_hex = Buffer.from([chann]).toString('hex').toUpperCase();
	let chann_desc = '';
	if(db5_n === 0xff) {
		chann_desc = 'Teach-in of all channels supported by the device';
	} else {
		chann_desc = chann.toString();
	}
	// Manufacturer-ID
	let manuf = ((db3_n & 0b00000111) << 8) + db4_n;
	let manuf_hex = ('000' + manuf.toString(16)).slice(-4).toUpperCase();
	let manuf_desc = mManufacturer.getManufacturerName(manuf);
	// TYPE of EEP
	let type = db2_n;
	let type_hex = Buffer.from([type]).toString('hex').toUpperCase();
	let type_desc = type_hex;
	// FUNC of EEP
	let func = db1_n;
	let func_hex = Buffer.from([func]).toString('hex').toUpperCase();
	let func_desc = func_hex;
	// RORG of EEP
	let rorg = db0_n;
	let rorg_hex = Buffer.from([rorg]).toString('hex').toUpperCase();
	let rorg_desc = rorg_hex;


	let values = {
		'DIR': {
			'key'  : 'DIR',
			'field': 'Uni-bi-directional communication (EEP operation)',
			'value': direc,
			'hex'  : [direc_hex],
			'desc' : direc_desc
		},
		'EXP': {
			'key'  : 'EXP',
			'field': 'EEP Teach-In-Response message expected y/n',
			'value': expec,
			'hex'  : [expec_hex],
			'desc' : expec_desc
		},
		'ACC': {
			'key'  : 'ACC',
			'field': 'Request accepted',
			'value': accep,
			'hex'  : [accep_hex],
			'desc' : accep_desc
		},
		'CMD': {
			'key'  : 'CMD',
			'field': 'Command identifier',
			'value': cmd,
			'hex'  : [cmd_hex],
			'desc' : cmd_desc
		},
		'CHA': {
			'key'  : 'CHA',
			'field': 'No. of individual channel to be taught in',
			'value': chann,
			'hex'  : [chann_hex],
			'desc' : chann_desc
		},
		'MID': {
			'key'  : 'MID',
			'field': 'Manufacturer ID',
			'value': manuf,
			'hex'  : [manuf_hex],
			'desc' : manuf_desc
		},
		'TYPE': {
			'key'  : 'TYPE',
			'field': 'TYPE',
			'value': type,
			'hex'  : [type_hex],
			'desc' : type_desc
		},
		'FUNC': {
			'key'  : 'FUNC',
			'field': 'FUNC',
			'value': func,
			'hex'  : [func_hex],
			'desc' : func_desc
		},
		'RORG': {
			'key'  : 'RORG',
			'field': 'RORG',
			'value': rorg,
			'hex'  : [rorg_hex],
			'desc' : rorg_desc
		}
	};

	let eep_value_list = [rorg, func, type]
	for(let i=0; i<3; i++) {
		let v = ('0' + eep_value_list[i].toString(16)).slice(-2);
		eep_value_list[i] = v.toUpperCase();
	}
	let eep = eep_value_list.join('-');

	let message = {
		'eep'  : eep,
		'mid' : manuf,
		'manufacture': values['MID']['value'],
		'manufacture_desc': values['MID']['desc'],
		'desc' : '',
		'dir': direc,
		'dir_desc': direc_desc,
		'expected': expec,
		'expected_desc': expec_desc,
		'accepted': accep,
		'accepted_desc': accep_desc,
		'cmd': cmd,
		'cmd_desc': cmd_desc,
		'channel': chann,
		'channel_desc': chann_desc
	};

	let eep_desc = mEepDesc.getEepDescription(eep);
	for(let k in eep_desc) {
		message[k] = eep_desc[k];
	}

	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [
			values['DIR'],
			values['EXP'],
			values['ACC'],
			values['CMD'],
			values['CHA'],
			values['MID'],
			values['TYPE'],
			values['FUNC'],
			values['RORG']
		]
	};
	return parsed;

};

EnoceanUtils.prototype._parseDataErp1TeachIn4bs = function(dd_buf) {
	let rorg = 0xA5;
	if(dd_buf.length !== 4) { return null; }
	let lrnb = (dd_buf.readUInt8(3) & 0b00001000) >> 3;
	if(lrnb !== 0) { return null; }

	let lrnb_hex = ('0' + lrnb.toString(16)).slice(-2).toUpperCase();
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}	

	let values = {
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [lrnb_hex],
			'desc' : lrnb_desc
		}
	};

	let message = {
		'desc' : '',
		'learn': true,
	};

	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);
	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);

	let sub_tel_num_value = buf.readUInt8(offset);
	let sub_tel_num_buffer = buf.slice(offset, offset + 1);

	let destination_id_buffer = buf.slice(offset + 1, offset + 5);
	let destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	let destination_id_desc = destination_id_hex.join(' ');
	let destination_id_value = destination_id_desc;

	let dbm_value = buf.readUInt8(offset + 5);
	let dbm_buffer = buf.slice(offset + 5, offset + 6);
	let dbm_desc = '-' + dbm_value + ' dBm';

	let security_level_value = buf.readUInt8(offset + 6);
	let security_level_buffer = buf.slice(offset + 6, offset + 7);

	let values = {
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

	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);

	let destination_id_buffer = buf.slice(offset, offset + 4);
	let destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	let destination_id_desc = destination_id_hex.join(' ');
	let destination_id_value = destination_id_desc;

	let source_id_buffer = buf.slice(offset + 4, offset + 8);
	let source_id_hex = mBuffer.convBufferToHexString(source_id_buffer);
	let source_id_desc = source_id_hex.join(' ');
	let source_id_value = source_id_desc;

	let dbm_value = buf.readUInt8(offset + 8);
	let dbm_buffer = buf.slice(offset + 8, offset + 9);
	let dbm_desc = '-' + dbm_value + ' dBm';

	let values = {
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

	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);

	let destination_id_buffer = buf.slice(offset, offset + 4);
	let destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	let destination_id_desc = destination_id_hex.join(' ');
	let destination_id_value = destination_id_desc;

	let source_id_buffer = buf.slice(offset + 4, offset + 8);
	let source_id_hex = mBuffer.convBufferToHexString(source_id_buffer);
	let source_id_desc = source_id_hex.join(' ');
	let source_id_value = source_id_desc;

	let dbm_value = buf.readUInt8(offset + 8);
	let dbm_buffer = buf.slice(offset + 8, offset + 9);
	let dbm_desc = '-' + dbm_value + ' dBm';

	let send_with_delay_value = buf.readUInt8(offset + 9);
	let send_with_delay_buffer = buf.slice(offset + 9, offset + 10);

	let values = {
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

	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);

	let sub_tel_num_value = buf.readUInt8(offset);
	let sub_tel_num_buffer = buf.slice(offset, offset + 1);

	let destination_id_buffer = buf.slice(offset + 1, offset + 5);
	let destination_id_hex = mBuffer.convBufferToHexString(destination_id_buffer);
	let destination_id_desc = destination_id_hex.join(' ');
	let destination_id_value = destination_id_desc;

	let dbm_value = buf.readUInt8(offset + 5);
	let dbm_buffer = buf.slice(offset + 5, offset + 6);
	let dbm_desc = '-' + dbm_value + ' dBm';

	let security_level_value = buf.readUInt8(offset + 6);
	let security_level_buffer = buf.slice(offset + 6, offset + 7);

	let values = {
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

	let parsed = {
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
	let opt_buffer = buf.slice(offset, offset + len);

	let sub_tel_num_value = buf.readUInt8(offset);
	let sub_tel_num_buffer = buf.slice(offset, offset + 1);

	let dbm_value = buf.readUInt8(offset + 1);
	let dbm_buffer = buf.slice(offset + 1, offset + 2);
	let dbm_desc = '-' + dbm_value + ' dBm';

	let values = {
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

	let parsed = {
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
	let value = buf.readUInt8(offset);
	let buffer = buf.slice(offset, offset + 1);
	let hex = mBuffer.convBufferToHexString(buffer);
	let valid = mCrc8.checkCrc8(value, buf.slice(6, offset));
	let parsed = {
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
