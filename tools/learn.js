/* ------------------------------------------------------------------
* node-enocean-utils learn.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
*
* [Abstract]
*
* This script is a command-line tool to show you incoming Teach-In
* telegrams as a formatted text.
* ---------------------------------------------------------------- */
'use strict';
process.chdir(__dirname);

var enocean = require('../lib/node-enocean-utils.js');

enocean.startMonitor({'path': 'COM7', 'rate': 57600}, (err) => {
	if(err) {
		console.log('ERROR: ' + err.toString(err));
	}
});

var col_len_list = [12, 8, 20];
console.log(formatLineColmns(['Module ID', 'EEP', 'Manufacturer'], col_len_list));
console.log(createLine(col_len_list));

enocean.on('data-learn', (telegram) => {
	var device = telegram['message']['device'];
	var cols = [device['id'], device['eep'], device['manufacturer']];
	console.log(formatLineColmns(cols, col_len_list));
});

function createLine(w) {
	var line_list = [];
	w.forEach((len) => {
		var line = '';
		for(var i=0; i<len; i++) {
			line += '-';
		}
		line_list.push(line);
	});
	return formatLineColmns(line_list, w);
}

function formatLineColmns(cols, w) {
	var formated_cols = [];
	for(var i=0; i<cols.length; i++) {
		formated_cols.push(spacePaddingRight(cols[i], w[i]));
	}
	var line = formated_cols.join('|');
	if(line.length > process.stdout.columns) {
		line = spacePaddingRight(line, process.stdout.columns - 2);
	}
	return line;
}

function spacePaddingRight(str, len) {
	if(!len) {
		return str;
	}
	var str_len = 0;
	if(str) {
		str_len = str.length;
	}
	if(str_len === len) {
		return str;
	} else if(str_len > len) {
		return (str.substr(0, len - 2) + '..');
	} else {
		var snum = len - str_len;
		for(var i=0; i<snum; i++) {
			str += ' ';
		}
		return str;
	}
}