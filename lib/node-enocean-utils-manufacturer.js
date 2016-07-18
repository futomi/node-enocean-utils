/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-manufacturer.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-07-18
* ---------------------------------------------------------------- */
'use strict';
// Based on the EnOcean Link Reference
// https://www.enocean.com/fileadmin/redaktion/support/enocean-link/eo_manufacturer_8h.html

var EnoceanUtilsManufacturer = function() {
	this.MANUFACTURER_MAP = {
		0x001: 'PEHA',
		0x002: 'THERMOKON',
		0x003: 'SERVODAN',
		0x004: 'ECHOFLEX_SOLUTIONS',
		0x005: 'OMNIO_AG',
		0x006: 'HARDMEIER_ELECTRONICS',
		0x007: 'REGULVAR_INC',
		0x008: 'AD_HOC_ELECTRONICS',
		0x009: 'DISTECH_CONTROLS',
		0x00A: 'KIEBACK_AND_PETER',
		0x00B: 'ENOCEAN_GMBH',
		0x00C: 'PROBARE',
		0x00D: 'ELTAKO',
		0x00E: 'LEVITON',
		0x00F: 'HONEYWELL',
		0x010: 'SPARTAN_PERIPHERAL_DEVICES',
		0x011: 'SIEMENS',
		0x012: 'T_MAC',
		0x013: 'RELIABLE_CONTROLS_CORPORATION',
		0x014: 'ELSNER_ELEKTRONIK_GMBH',
		0x015: 'DIEHL_CONTROLS',
		0x016: 'BSC_COMPUTER',
		0x017: 'S_AND_S_REGELTECHNIK_GMBH',
		0x018: 'MASCO_CORPORATION',
		0x019: 'INTESIS_SOFTWARE_SL',
		0x01A: 'VIESSMANN',
		0x01B: 'LUTUO_TECHNOLOGY',
		0x01C: 'SCHNEIDER_ELECTRIC',
		0x01D: 'SAUTER',
		0x01E: 'BOOT_UP',
		0x01F: 'OSRAM_SYLVANIA',
		0x020: 'UNOTECH',
		0x21: 'DELTA_CONTROLS_INC',
		0x022: 'UNITRONIC_AG',
		0x023: 'NANOSENSE',
		0x024: 'THE_S4_GROUP',
		0x025: 'MSR_SOLUTIONS',
		0x26: 'GE',
		0x027: 'MAICO',
		0x28: 'RUSKIN_COMPANY',
		0x29: 'MAGNUM_ENERGY_SOLUTIONS',
		0x02A: 'KMC_CONTROLS',
		0x02B: 'ECOLOGIX_CONTROLS',
		0x2C: 'TRIO_2_SYS',
		0x02D: 'AFRISO_EURO_INDEX',
		0x030: 'NEC_ACCESSTECHNICA_LTD',
		0x031: 'ITEC_CORPORATION',
		0x32: 'SIMICX_CO_LTD',
		0x34: 'EUROTRONIC_TECHNOLOGY_GMBH',
		0x35: 'ART_JAPAN_CO_LTD',
		0x36: 'TIANSU_AUTOMATION_CONTROL_SYSTE_CO_LTD',
		0x38: 'GRUPPO_GIORDANO_IDEA_SPA',
		0x39: 'ALPHAEOS_AG',
		0x3A: 'TAG_TECHNOLOGIES',
		0x3C: 'CLOUD_BUILDINGS_LTD',
		0x3E: 'GIGA_CONCEPT',
		0x3F: 'SENSORTEC',
		0x40: 'JAEGER_DIREKT',
		0x41: 'AIR_SYSTEM_COMPONENTS_INC',
		0x7FF: 'MULTI_USER_MANUFACTURER'
	};
};

EnoceanUtilsManufacturer.prototype.getManufacturerName = function(manufacturer_id) {
	if(manufacturer_id in this.MANUFACTURER_MAP) {
		return this.MANUFACTURER_MAP[manufacturer_id];
	} else {
		return '';
	}
};

module.exports = new EnoceanUtilsManufacturer();
