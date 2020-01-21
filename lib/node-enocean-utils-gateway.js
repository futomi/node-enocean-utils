/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-gateway.js
*
* Copyright (c) 2016 - 2020, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2020-01-21
* ---------------------------------------------------------------- */
'use strict';
const mSerialPort = require('serialport');
const mCrc8 = require('./node-enocean-utils-crc8.js');
const mOs = require('os');

const EnoceanUtilsGateway = function () {
	this._DEFAULT_BAUD_RATE = 57600;
};

EnoceanUtilsGateway.prototype.find = function (params) {
	let path = '';
	let baud_rate = this._DEFAULT_BAUD_RATE;
	if (params && typeof (params) === 'object') {
		if (params['path'] && typeof (params['path']) === 'string') {
			path = params['path'];
		}
		if (params['rate'] && typeof (params['rate']) === 'number') {
			baud_rate = params['rate'];
		}
	}

	let promise = new Promise((resolve, reject) => {
		this._findPortCandidates(path).then((candidate_com_list) => {
			return this._scanPorts(baud_rate, candidate_com_list);
		}).then((res) => {
			resolve(res);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnoceanUtilsGateway.prototype._findPortCandidates = function (path) {
	let promise = new Promise((resolve, reject) => {
		let com_info = {
			path: path,
			manufacturer: '',
			serialNumber: '',
			locationId: '',
			vendorId: '',
			productId: ''
		};
		try {
			mSerialPort.list().then((com_list) => {
				let candidate_com_list = [];
				let pf = mOs.platform();
				if (path) {
					com_list.forEach((com) => {
						let com_path = com.path || com.comName;
						if (com_path === path) {
							candidate_com_list.push(com);
						}
					});
				} else if (pf === 'linux') {
					// ------------------------------------------------
					// * Linux
					// {
					//   "manufacturer": "EnOcean GmbH",
					//   "serialNumber": "FT5CTUI",
					//   "pnpId": "usb-EnOcean_GmbH_EnOcean_USB_400J_DA_FT5CTUI-if00-port0",
					//   "vendorId": "0403",
					//   "productId": "EnOcean USB 400J DA",
					//   "path": "/dev/ttyUSB0"
					// }
					// ------------------------------------------------
					com_list.forEach((com) => {
						if ((com.manufacturer && com.manufacturer.match(/EnOcean/)) || (com.pnpId && com.pnpId.match(/EnOcean/)) || (com.productId && com.productId.match(/EnOcean/))) {
							candidate_com_list.push(com);
						}
					});
				} else if (pf === 'win32') {
					// ------------------------------------------------
					// * win32
					// {
					//   "path": "COM7",
					//   "manufacturer": "FTDI",
					//   "pnpId": "FTDIBUS\\VID_0403+PID_6001+FT5CTUIA\\0000",
					//   "vendorId": "0403",
					//   "productId": "6001"
					// ------------------------------------------------
					com_list.forEach((com) => {
						if (com.manufacturer && com.manufacturer.match(/FTDI/)) {
							candidate_com_list.push(com);
						}
					});
				} else if (pf === 'darwin') {
					// ------------------------------------------------
					// * darwin
					// {
					//   "path": "/dev/cu.usbserial-FT5CTUI",
					//   "manufacturer": "EnOcean GmbH",
					//   "serialNumber": "FT5CTUI",
					//   "locationId": "0x14110000",
					//   "vendorId": "0x0403",
					//   "productId": "0x6001"
					// }
					// ------------------------------------------------
					com_list.forEach((com) => {
						let com_path = com.path || com.comName;
						if (com_path.match(/usb/) && com.manufacturer && com.manufacturer.match(/EnOcean/)) {
							candidate_com_list.push(com);
						}
					});
				}
				resolve(candidate_com_list);
			}).catch((error) => {
				resolve([com_info]);
			});
		} catch (e) {
			if (path) {
				resolve([com_info]);
			} else {
				reject(e);
			}
		}
	});
	return promise;
};

EnoceanUtilsGateway.prototype._scanPorts = function (baud_rate, com_list) {
	let promise = new Promise((resolve, reject) => {
		let e = null;
		let tryConnect = (callback) => {
			let com = com_list.shift();
			if (!com) {
				let err = e || new Error('No USB gateway was found.');
				callback(err);
				return;
			}
			let path = com.path || com.comName;
			let port = new mSerialPort(path, {
				baudRate: baud_rate
			});
			port.once('error', (error) => {
				e = error;
				tryConnect(callback);
			});
			port.once('open', () => {
				let timer = null;
				let message = null;
				port.on('data', (chunk) => {
					if (message === null && chunk.readUInt8(0) === 0x55) {
						message = chunk;
					} else if (message !== null) {
						message = Buffer.concat([message, chunk]);
					}
					if (message && message.length === 40) {
						port.removeAllListeners('data');
						port.close(() => {
							if (timer) {
								clearTimeout(timer);
							}
							let parsed = this._parseVersionTelegram(message);
							if (parsed) {
								if (!com.serialNumber) {
									com.serialNumber = '';
									if (com.pnpId) {
										let m = com.pnpId.match(/PID_\d+\+([0-9a-zA-Z]+)/);
										if (m && m[1]) {
											com.serialNumber = m[1];
										}
									}
								}
								callback(null, {
									path: path,
									baudRate: baud_rate,
									manufacturer: com.manufacturer,
									vendorId: com.vendorId,
									productId: com.productId,
									serialNumber: com.serialNumber,
									appVersion: parsed['appVersion'],
									apiVersion: parsed['apiVersion'],
									chipId: parsed['chipId'],
									chipVersion: parsed['chipVersion'],
									appDescription: parsed['appDescription']
								});
							} else {
								tryConnect(callback);
							}
						});
					}
				});
				let buf = this._createGetVersionTelegramBuffer();
				port.write(buf, 'binary');
				timer = setTimeout(() => {
					port.removeAllListeners('data');
					port.close(() => {
						tryConnect(callback);
					});
				}, 1000);
			});
		};
		tryConnect((error, res) => {
			if (error) {
				reject(error);
			} else {
				resolve(res);
			}
		});
	});
	return promise;
};

EnoceanUtilsGateway.prototype._createGetVersionTelegramBuffer = function () {
	// EnOcean Serial Protocol 3 (ESP3) specification P31
	// 1.10.5 Code 03: CO_RD_VERSION
	let sync = Buffer.from([0x55]);
	let header = Buffer.from([0x00, 0x01, 0x00, 0x05]);
	let crc8h = Buffer.from([mCrc8.calcCrc8(header)]);
	let data = Buffer.from([0x03]);
	let crc8d = Buffer.from([mCrc8.calcCrc8(data)]);
	return Buffer.concat([sync, header, crc8h, data, crc8d]);
};

EnoceanUtilsGateway.prototype._parseVersionTelegram = function (buf) {
	// EnOcean Serial Protocol 3 (ESP3) specification P31
	// 1.10.5 Code 03: CO_RD_VERSION
	if (buf.length !== 40) {
		return null;
	}
	// Sync. Byte
	if (buf.readUInt8(0) !== 0x55) {
		return null;
	}
	// Data Length
	if (buf.readUInt16BE(1) !== 0x21) {
		return null;
	}
	// Packet Type
	if (buf.readUInt8(4) !== 0x02) {
		return null;
	}
	// Return Code
	if (buf.readUInt8(6) !== 0x00) {
		return null;
	}
	// APP version
	let app_ver = [
		buf.readUInt8(7),
		buf.readUInt8(8),
		buf.readUInt8(9),
		buf.readUInt8(10)
	].join('.');
	// API version
	let api_ver = [
		buf.readUInt8(11),
		buf.readUInt8(12),
		buf.readUInt8(13),
		buf.readUInt8(14)
	].join('.');
	// Chip ID
	let chip_id = buf.slice(15, 19).toString('hex');
	// Chip version
	let chip_ver = [
		buf.readUInt8(19),
		buf.readUInt8(20),
		buf.readUInt8(21),
		buf.readUInt8(22)
	].join('.');
	// App. description
	//let app_desc = buf.slice(23, 39).toString('ascii').replace(/\\u0000/g, '');
	let app_desc = '';
	for (let i = 23; i < 39; i++) {
		if (buf.readUInt8(i) === 0x00) {
			break;
		} else {
			app_desc += buf.slice(i, i + 1).toString('ascii');
		}
	}
	// return the result
	return {
		appVersion: app_ver,
		apiVersion: api_ver,
		chipId: chip_id,
		chipVersion: chip_ver,
		appDescription: app_desc
	};
};

module.exports = new EnoceanUtilsGateway();
