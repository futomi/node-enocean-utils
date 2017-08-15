/* ------------------------------------------------------------------
* node-enocean-utils learn.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-04
*
* [Abstract]
*
* This script is a command-line tool to show you incoming Teach-In
* telegrams as a formatted text.
* ---------------------------------------------------------------- */
'use strict';
process.chdir(__dirname);
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

enocean.startMonitor(opts).then(() => {
	let col_len_list = [12, 8, 40];
	console.log(formatLineColmns(['Module ID', 'EEP', 'Manufacturer'], col_len_list));
	console.log(createLine(col_len_list));
	enocean.on('data-learn', (telegram) => {
		let device = telegram['message']['device'];
		let cols = [device['id'], device['eep'], device['manufacturer']];
		console.log(formatLineColmns(cols, col_len_list));
	});
}).catch((error) => {
	console.log('ERROR: ' + error.message);
});

function createLine(w) {
	let line_list = [];
	w.forEach((len) => {
		let line = '';
		for(let i=0; i<len; i++) {
			line += '-';
		}
		line_list.push(line);
	});
	return formatLineColmns(line_list, w);
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