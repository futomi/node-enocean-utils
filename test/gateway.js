'use strict';

const mGateway = require('../lib/node-enocean-utils-gateway.js');
mGateway.find({
	path: 'COM7',
	baudRate: 57600
}).then((com) => {
	console.log(JSON.stringify(com, null, '  '))
}).catch((error) => {
	console.error(error);
});