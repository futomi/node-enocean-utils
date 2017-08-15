/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-manufacturer.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-15
* ---------------------------------------------------------------- */
'use strict';
// Based on the EnOcean Link Reference
// https://www.enocean.com/fileadmin/redaktion/support/enocean-link/eo_manufacturer_8h.html

const EnoceanUtilsManufacturer = function() {
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
		0x018: 'ZENO_CONTROLS',
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
		0x042: 'ERMINE_CORP',
		0x043: 'SODA_GMBH',
		0x044: 'EKE_AUTOMATION',
		0x045: 'HOLTER_REGELARMUTREN',
		0x046: 'ID_RF',
		0x047: 'DEUTA_CONTROLS_GMBH',
		0x048: 'EWATCHH',
		0x049: 'MICROPELT',
		0x04A: 'CALEFFI_SPA',
		0x04B: 'DIGITAL_CONCEPTS',
		0x04C: 'EMERSON_CLIMATE_TECHNOLOGIES',
		0x04D: 'ADEE_ELECTRONIC',
		0x04E: 'ALTECON',
		0x04F: 'NANJING_PUTIAN_TELECOMMUNICATIONS',
		0x050: 'TERRALUX',
		0x051: 'MENRED',
		0x052: 'IEXERGY_GMBH',
		0x053: 'OVENTROP_GMBH',
		0x054: 'BUILDING_AUTOMATION_PRODUCTS_INC',
		0x055: 'FUNCTIONAL_DEVICES_INC',
		0x056: 'OGGA',
		0x057: 'ITHO_DAALDEROP',
		0x058: 'RESOL',
		0x059: 'ADVANCED_DEVICES',
		0x05A: 'AUTANI_LCC',
		0x05B: 'DR_RIEGEL_GMBH',
		0x05C: 'HOPPE_HOLDING_AG',
		0x7FF : 'MULTI_USER_MANUFACTURER'
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
