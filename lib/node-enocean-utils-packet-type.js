/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-packet-type.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
* ---------------------------------------------------------------- */
'use strict';
// Based on EnOcean Serial Protocol 3 (ESP3) P13

var EnoceanUtilsPacketType = function() {
	this.PACKET_TYPE_MAP = { 
		0x01: 'RADIO_ERP1 (Radio telegram)',
		0x02: 'RESPONSE (Response to any packet)',
		0x03: 'RADIO_SUB_TEL (Radio subtelegram)',
		0x04: 'EVENT (Event message)',
		0x05: 'COMMON_COMMAND (Common command)',
		0x06: 'SMART_ACK_COMMAND (Smart Ack command)',
		0x07: 'REMOTE_MAN_COMMAND (Remote management command)',
		0x09: 'RADIO_MESSAGE (Radio message)',
		0x0A: 'RADIO_ERP2 (ERP2 protocol radio telegram)',
		0x10: 'RADIO_802_15_4 (802_15_4_RAW Packet)',
		0x11: 'COMMAND_2_4 (2.4 GHz Command)'
	};
};

EnoceanUtilsPacketType.prototype.getPacketTypeDescription = function(packet_type) {
	if(packet_type in this.PACKET_TYPE_MAP) {
		return this.PACKET_TYPE_MAP[packet_type];
	} else if(packet_type >= 0x80 && packet_type <= 0xFF) {
		return 'available (MSC and messages)';
	} else {
		return '(Reserved for EnOcean)';
	}
};

module.exports = new EnoceanUtilsPacketType();
