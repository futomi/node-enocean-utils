/* ------------------------------------------------------------------
* node-enocean-utils analyzer.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-15
*
* [Abstract]
*
* This script is a command-line tool to show you incoming telegrams
* as a formatted text.
* ---------------------------------------------------------------- */
'use strict';
process.chdir(__dirname);
const fs = require('fs');
const enocean = require('../lib/node-enocean-utils.js');

// Get command line arguments 
let serial_path = process.argv[2];
let serial_rate = process.argv[3];

let opts = {};
if(serial_path) {
	opts['path'] = serial_path;
}
if(serial_rate) {
	if(serial_rate.match(/[^\d]/)) {
		console.log('[ERROR] The baud rate must be a number.')
		process.exit();
	} else {
		opts['rate'] = parseInt(serial_rate, 10);
	}
}

let known_device_list = JSON.parse(fs.readFileSync('./analyzer.json', 'utf8'));

known_device_list.forEach((device) => {
	enocean.teach(device);
});

enocean.startMonitor(opts).then(() => {
	enocean.on('data', (telegram) => {
		console.log(createLine('='));
		console.log('[Summary]');
		showSummary(telegram);
		console.log(createLine('-'));
		console.log('[Telegram]');
		showTelegramBlock(telegram);
	});
}).catch((error) => {
	console.log('ERROR: ' + error.message);
});

function showSummary(telegram) {
	console.log(formatSummarylLineColmns(['- HEX', telegram['hex'].join(' ')]));

	let m = telegram['message'];
	console.log(formatSummarylLineColmns(['- Packet Type', m['packet_type_desc']]));

	let device = m['device'] || {};
	let device_name = device['name'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- Device Name', device_name]));
	let device_id = device['id'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- Device ID', device_id]));
	let manufacturer = device['manufacturer'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- Manufacturer', manufacturer]));

	let eep = m['eep'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- EEP', eep]));

	let rorg_desc = m['rorg_desc'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- RORG', rorg_desc]));

	let func_desc = m['func_desc'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- FUNC', func_desc]));

	let type_desc = m['type_desc'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- TYPE', type_desc]));

	let data_desc = m['desc'] || 'Unknown';
	console.log(formatSummarylLineColmns(['- Data', data_desc]));

	let learn = ('learn' in m) ? m['learn'].toString() : 'Unknown';
	console.log(formatSummarylLineColmns(['- Learn', learn]));

	let known = ('known' in m) ? m['known'].toString() : 'Unknown';
	console.log(formatSummarylLineColmns(['- Known', known]));

	let dbm_desc = ('dbm_desc' in m) ? m['dbm_desc'] : 'Unknown';
	console.log(formatSummarylLineColmns(['- RSSI', dbm_desc]));

	console.log(formatSummarylLineColmns(['- CRC', (m['crc'] ? 'valid' : 'invalid')]));
}

function createLine(char) {
	let len = process.stdout.columns - 1;
	let line = '';
	for(let i=0; i<len; i++) {
		line += char;
	}
	return line;
}

function showTelegramBlock(blk, indent_level) {
	if(!indent_level) {
		indent_level = 0;
	}
	let indent = '';
	for(let i=0; i<indent_level; i++) {
		indent += '  ';
	}
	if(('structure' in blk) && Array.isArray(blk['structure'])) {
		blk['structure'].forEach((blk) => {
			console.log(formatDetailLineColmns([
				indent + '- ' + blk['field'],
				blk['hex'].join(' '),
				('desc' in blk) ? blk['desc'] : ''
			]));
			if('structure' in blk) {
				showTelegramBlock(blk, indent_level + 1);
			}
		});
	}
}

function formatSummarylLineColmns(cols) {
	return formatLineColmns(cols, [31]);
}

function formatDetailLineColmns(cols) {
	return formatLineColmns(cols, [31, 11]);
}

function formatLineColmns(cols, w) {
	let formated_cols = [];
	for(let i=0; i<cols.length; i++) {
		formated_cols.push(spacePaddingRight(cols[i], w[i]));
	}
	let line = formated_cols.join('|');
	if(line.length > process.stdout.columns) {
		line = spacePaddingRight(line, process.stdout.columns - 2);
	}
	return line;
}

function spacePaddingRight(str, len) {
	if(!len) {
		return str;
	}
	let str_len = 0;
	if(str) {
		str_len = str.length;
	}
	if(str_len === len) {
		return str;
	} else if(str_len > len) {
		return (str.substr(0, len - 2) + '..');
	} else {
		let snum = len - str_len;
		for(let i=0; i<snum; i++) {
			str += ' ';
		}
		return str;
	}
}