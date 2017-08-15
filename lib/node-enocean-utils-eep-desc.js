/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-desc.js
*
* Copyright (c) 2016 - 2017, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2017-08-02
* ---------------------------------------------------------------- */
'use strict';
// Based on EnOcean Equipment Profiles 2.6.5 Specification

const EnoceanUtilsEepDesc = function() {
	this.RORG_MAP = {
		'F6': 'RPS Telegram',
		'D5': '1BS Telegram',
		'A5': '4BS Telegram',
		'D2': 'VLD Telegram'
	};

	this.FUNC_MAP = {
		'F6': { // RPS Telegram
			'02': 'Rocker Switch, 2 Rocker',
			'03': 'Rocker Switch, 4 Rocker',
			'04': 'Position Switch, Home and Office Application',
			'05': 'Detectors',
			'10': 'Mechanical Handle'
		},
		'D5': { // 1BS Telegram
			'00': 'Contacts and Switches'
		},
		'A5': { // 4BS Telegram
			'02': 'Temperature Sensors',
			'04': 'Temperature and Humidity Sensor',
			'05': 'Barometric Sensor',
			'06': 'Light Sensor',
			'07': 'Occupancy Sensor',
			'08': 'Light, Temperature and Occupancy Sensor',
			'09': 'Gas Sensor',
			'10': 'Room Operating Panel',
			'11': 'Controller Status',
			'12': 'Automated Meter Reading (AMR)',
			'13': 'Environmental Applications',
			'14': 'Multi-Func Sensor',
			'20': 'HVAC Components',
			'30': 'Digital Input',
			'37': 'Energy Management',
			'38': 'Central Command',
			'3F': 'Universal'
		},
		'D2': { // VLD Telegram
			'00': 'Room Control Panel (RCP)',
			'01': 'Electronic switches and dimmers with Energy Measurement and Local Control',
			'02': 'Sensors for Temperature, Illumination, Occupancy And Smoke',
			'03': 'Light, Switching + Blind Control',
			'04': 'CO2, Humidity, Temperature, Day/Night and Autonomy',
			'05': 'Blinds Control for Position and Angle',
			'06': 'Multisensor Window Handle',
			'10': 'Room Control Panels with Temperature & Fan Speed Control, Room Status Information and Time Program',
			'11': 'Bidirectional Room Operating Panel',
			'20': 'Fan Control',
			'30': 'Floor Heating Controls and Automated Meter Reading',
			'31': 'Automated Meter Reading Gateway',
			'32': 'A.C. Current Clamp',
			'40': 'LED Controller Status',
			'50': 'Heat Recovery Ventilation',
			'A0': 'Standard Valve'
		}
	};

	this.TYPE_MAP = {
		'F6': { // RPS Telegram
			'02': { // Rocker Switch, 2 Rocker
				'01': 'Light and Blind Control - Application Style 1',
				'02': 'Light and Blind Control - Application Style 2',
				'03': 'Light Control - Application Style 1',
				'04': 'Light and blind control ERP2'
			},
			'03': { // Rocker Switch, 4 Rocker
				'01': 'Light and Blind Control - Application Style 1',
				'02': 'Light and Blind Control - Application Style 2'
			},
			'04': { // Position Switch, Home and Office Application'
				'01': 'Key Card Activated Switch',
				'02': 'Key Card Activated Switch ERP2'
			},
			'05': { // Detectors
				'01': 'Liquid Leakage Sensor (mechanic harvester)'
			},
			'10': { // Mechanical Handle
				'00': 'Window Handle',
				'01': 'Window Handle ERP2'
			}
		},
		'D5': { // 1BS Telegram
			'00': { // Contacts and Switches
				'01': 'Single Input Contact'
			}
		},
		'A5': { // 4BS Telegram
			'02': { // Temperature Sensors
				'01': 'Temperature Sensor Range -40℃ to 0℃',
				'02': 'Temperature Sensor Range -30℃ to +10℃',
				'03': 'Temperature Sensor Range -20℃ to +20℃',
				'04': 'Temperature Sensor Range -10℃ to +30℃',
				'05': 'Temperature Sensor Range 0℃ to +40℃',
				'06': 'Temperature Sensor Range +10℃ to +50℃',
				'07': 'Temperature Sensor Range +20℃ to +60℃',
				'08': 'Temperature Sensor Range +30℃ to +70℃',
				'09': 'Temperature Sensor Range +40℃ to +80℃',
				'0A': 'Temperature Sensor Range +50℃ to +90℃',
				'0B': 'Temperature Sensor Range +60℃ to +100℃',
				'10': 'Temperature Sensor Range -60℃ to +20℃',
				'11': 'Temperature Sensor Range -50℃ to +30℃',
				'12': 'Temperature Sensor Range -40℃ to +40℃',
				'13': 'Temperature Sensor Range -30℃ to +50℃',
				'14': 'Temperature Sensor Range -20℃ to +60℃',
				'15': 'Temperature Sensor Range -10℃ to +70℃',
				'16': 'Temperature Sensor Range 0℃ to +80℃',
				'17': 'Temperature Sensor Range +10℃ to +90℃',
				'18': 'Temperature Sensor Range +20℃ to +100℃',
				'19': 'Temperature Sensor Range +30℃ to +110℃',
				'1A': 'Temperature Sensor Range +40℃ to +120℃',
				'1B': 'Temperature Sensor Range +50℃ to +130℃',
				'20': '10 Bit Temperature Sensor Range -10℃ to +41.2℃'
			},
			'04': { // Temperature and Humidity Sensor
				'01': 'Range 0°C to +40°C and 0% to 100%',
				'02': 'Range -20°C to +60°C and 0% to 100%',
				'03': 'Range -20°C to +60°C 10bit-measurement and 0% to 100%'
			},
			'05': { // Barometric Sensor
				'01': 'Range 500 to 1150 hPa'
			},
			'06': { // Light Sensor
				'01': 'Range 300lx to 60.000lx',
				'02': 'Range 0lx to 1.020lx',
				'03': '10-bit measurement (1-Lux resolution) with range 0lx to 1000lx',
				'04': 'Curtain Wall Brightness Sensor',
				'05': 'Range 0lx to 10.200lx'
			},
			'07': { // Occupancy Sensor
				'01': 'Occupancy with Supply voltage monitor',
				'02': 'Occupancy with Supply voltage monitor',
				'03': 'Occupancy with Supply voltage monitor and 10-bit illumination measurement'
			},
			'08': { // Light, Temperature and Occupancy Sensor
				'01': 'Range 0lx to 510lx, 0°C to +51°C and Occupancy Button',
				'02': 'Range 0lx to 1020lx, 0°C to +51°C and Occupancy Button',
				'03': 'Range 0lx to 1530lx, -30°C to +50°C and Occupancy Button'
			},
			'09': { // Gas Sensor
				'02': 'CO-Sensor 0 ppm to 1020 ppm',
				'04': 'CO2 Sensor',
				'05': 'VOC Sensor',
				'06': 'Radon',
				'07': 'Particles',
				'08': 'Pure CO2 Sensor',
				'09': 'Pure CO2 Sensor with Power Failure Detection',
				'0A': 'Hydrogen Gas Sensor'
			},
			'10': { // Room Operating Panel
				'01': 'Temperature Sensor, Set Point, Fan Speed and Occupancy Control',
				'02': 'Temperature Sensor, Set Point, Fan Speed and Day/Night Control',
				'03': 'Temperature Sensor, Set Point Control',
				'04': 'Temperature Sensor, Set Point and Fan Speed Control',
				'05': 'Temperature Sensor, Set Point and Occupancy Control',
				'06': 'Temperature Sensor, Set Point and Day/Night Control',
				'07': 'Temperature Sensor, Fan Speed Control',
				'08': 'Temperature Sensor, Fan Speed and Occupancy Control',
				'09': 'Temperature Sensor, Fan Speed and Day/Night Control',
				'0A': 'Temperature Sensor, Set Point Adjust and Single Input Contact',
				'0B': 'Temperature Sensor and Single Input Contact',
				'0C': 'Temperature Sensor and Occupancy Control',
				'0D': 'Temperature Sensor and Day/Night Control',
				'10': 'Temperature and Humidity Sensor, Set Point and Occupancy Control',
				'11': 'Temperature and Humidity Sensor, Set Point and Day/Night Control',
				'12': 'Temperature and Humidity Sensor and Set Point',
				'13': 'Temperature and Humidity Sensor, Occupancy Control',
				'14': 'Temperature and Humidity Sensor, Day/Night Control',
				'15': '10 Bit Temperature Sensor, 6 bit Set Point Control',
				'16': '10 Bit Temperature Sensor, 6 bit Set Point Control;Occupancy Control',
				'17': '10 Bit Temperature Sensor, Occupancy Control',
				'18': 'Illumination, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control',
				'19': 'Humidity, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control',
				'1A': 'Supply voltage monitor, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control',
				'1B': 'Supply Voltage Monitor, Illumination, Temperature Sensor, Fan Speed and Occupancy Control',
				'1C': 'Illumination, Illumination Set Point, Temperature Sensor, Fan Speed and Occupancy Control',
				'1D': 'Humidity, Humidity Set Point, Temperature Sensor, Fan Speed and Occupancy Control',
				'1E': 'Supply Voltage Monitor, Illumination, Temperature Sensor, Fan Speed and Occupancy Control',
				'1F': 'Temperature Sensor, Set Point, Fan Speed, Occupancy and Unoccupancy Control',
				'20': 'Temperature and Set Point with Special Heating States',
				'21': 'Temperature, Humidity and Set Point with Special Heating States',
				'22': 'Temperature, Setpoint, Humidity and Fan Speed',
				'23': 'Temperature, Setpoint, Humidity, Fan Speed and Occupancy'
			},
			'11': { // Controller Status
				'01': 'Lighting Controller',
				'02': 'Temperature Controller Output',
				'03': 'Blind Status',
				'04': 'Extended Lighting Status',
				'05': 'Dual-Channel Switch Actuator (BI-DIR)'
			},
			'12': { // Automated Meter Reading (AMR)
				'00': 'Counter',
				'01': 'Electricity',
				'02': 'Gas',
				'03': 'Water',
				'04': 'Temperature and Load Sensor',
				'05': 'Temperature and Container Sensor',
				'10': 'Current meter 16 channels'
			},
			'13': { // Environmental Applications
				'01': 'Weather Station',
				'02': 'Sun Intensity',
				'03': 'Date Exchange',
				'04': 'Time and Day Exchange',
				'05': 'Direction Exchange',
				'06': 'Geographic Position Exchange',
				'07': 'Wind Sensor',
				'08': 'Rain Sensor',
				'10': 'Sun position and radiation'
			},
			'14': { // Multi-Func Sensor
				'01': 'Single Input Contact (Window/Door), Supply voltage monitor',
				'02': 'Single Input Contact (Window/Door), Supply voltage monitor and Illumination',
				'03': 'Single Input Contact (Window/Door), Supply voltage monitor and Vibration',
				'04': 'Single Input Contact (Window/Door), Supply voltage monitor, Vibration and Illumination',
				'05': 'Vibration/Tilt, Supply voltage monitor',
				'06': 'Vibration/Tilt, Illumination and Supply voltage monitor'
			},
			'20': { // HVAC Components
				'01': 'Battery Powered Actuator (BI-DIR)',
				'02': 'Basic Actuator (BI-DIR)',
				'03': 'Line powered Actuator (BI-DIR)',
				'04': 'Heating Radiator Valve Actuating Drive with Feed and Room Temperature Measurement, Local Set Point Control and Display (BI-DIR)',
				'10': 'Generic HVAC Interface (BI-DIR)',
				'11': 'Generic HVAC Interface – Error Control',
				'12': 'Temperature Controller Input'
			},
			'30': { // Digital Input
				'01': 'Single Input Contact, Battery Monitor',
				'02': 'Single Input Contact',
				'03': '4 Digital Inputs, Wake and Temperature',
				'04': '3 Digital Inputs, 1 Digital Input 8 Bits',
				'05': 'Single Input Contact, Retransmission, Battery Monitor'
			},
			'37': { // Energy Management
				'01': 'Demand Response'
			},
			'38': { // Central Command
				'08': 'Gateway',
				'09': 'Extended Lighting-Control'
			},
			'3F': { // Universal
				'00': 'Radio Link Test (BI-DIR)',
				'7F': 'Universal'
			}
		},
		'D2': { // VLD Telegram
			'00': { // Room Control Panel (RCP)
				'01': 'RCP with Temperature Measurement and Display (BI-DIR)'
			},
			'01': { // Electronic switches and dimmers with Energy Measurement and Local Control
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02',
				'03': 'Type 0x03',
				'04': 'Type 0x04',
				'05': 'Type 0x05',
				'06': 'Type 0x06',
				'07': 'Type 0x07',
				'08': 'Type 0x08',
				'09': 'Type 0x09',
				'0A': 'Type 0x0A',
				'0B': 'Type 0x0B',
				'0C': 'Type 0x0C',
				'0D': 'Type 0x0D',
				'0E': 'Type 0x0E',
				'0F': 'Type 0x0F',
				'10': 'Type 0x10',
				'11': 'Type 0x11',
				'12': 'Type 0x12'
			},
			'02': { // Sensors for Temperature, Illumination, Occupancy And Smoke
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02'
			},
			'03': { // Light, Switching + Blind Control
				'00': 'Type 0x00',
				'10': 'Mechanical Handle',
				'20': 'Beacon with Vibration Detection'
			},
			'04': { // CO2, Humidity, Temperature, Day/Night and Autonomy
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02',
				'03': 'Type 0x03',
				'04': 'Type 0x04',
				'05': 'Type 0x05',
				'06': 'Type 0x06',
				'07': 'Type 0x07',
				'08': 'Type 0x08',
				'09': 'Type 0x09',
				'10': 'Type 0x10',
				'1A': 'Type 0x1A',
				'1B': 'Type 0x1B',
				'1C': 'Type 0x1C',
				'1D': 'Type 0x1D',
				'1E': 'Type 0x1E'
			},
			'05': { // Blinds Control for Position and Angle
				'00': 'Type 0x00'
			},
			'06': { // Multisensor Window Handle
				'01': 'Alarm, Position Sensor, Vacation Mode, Optional Sensors'
			},
			'10': { // Room Control Panels with Temperature & Fan Speed Control, Room Status Information and Time Program
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02'
			},
			'11': { // Bidirectional Room Operating Panel
				'01': 'Type 0x01',
				'02': 'Type 0x02',
				'03': 'Type 0x03',
				'04': 'Type 0x04',
				'05': 'Type 0x05',
				'06': 'Type 0x06',
				'07': 'Type 0x07',
				'08': 'Type 0x08'
			},
			'20': { // Fan Control
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02'
			},
			'30': { // Floor Heating Controls and Automated Meter Reading
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02',
				'03': 'Type 0x03',
				'04': 'Type 0x04',
				'05': 'Type 0x05'
			},
			'31': { // Automated Meter Reading Gateway
				'00': 'Type 0x00',
				'01': 'Type 0x01'
			},
			'32': { // A.C. Current Clamp
				'00': 'Type 0x00',
				'01': 'Type 0x01',
				'02': 'Type 0x02'
			},
			'40': { // LED Controller Status
				'00': 'Type 0x00',
				'01': 'Type 0x01'
			},
			'50': { // Heat Recovery Ventilation
				'00': 'Type 0x00',
				'01': 'Type 0x01'
			},
			'A0': { // Standard Valve
				'01': 'Valve Control (BI-DIR)'
			}
		}
	};
};

EnoceanUtilsEepDesc.prototype.getEepDescription = function(eep) {
	let res = {
		'rorg': '',
		'rorg_desc': '',
		'func': '',
		'func_desc': '',
		'type': '',
		'type_desc': '',
	};
	if(eep === undefined || typeof(eep) !== 'string') {
		return res;
	}

	let m1 = eep.match(/^([0-9A-F]{2})/);
	let rorg = '';
	if(m1) {
		rorg = m1[1];
		res['rorg'] = rorg;
		if(rorg in this.RORG_MAP) {
			res['rorg_desc'] = this.RORG_MAP[rorg];
		} else {
			return res;
		}
	} else {
		return res;
	}
	let m2 = eep.match(/^[0-9A-F]{2}\-([0-9A-F]{2})/);
	let func = '';
	if(m2) {
		func = m2[1];
		res['func'] = func;
		if((rorg in this.FUNC_MAP) && (func in this.FUNC_MAP[rorg])) {
			res['func_desc'] = this.FUNC_MAP[rorg][func];
		} else {
			return res;
		}
	} else {
		return res;
	}

	let m3 = eep.match(/^[0-9A-F]{2}\-[0-9A-F]{2}\-([0-9A-F]{2})/);
	let type = '';
	if(m3) {
		type = m3[1];
		res['type'] = type;
		if((rorg in this.TYPE_MAP) && (func in this.TYPE_MAP[rorg]) && (type in this.TYPE_MAP[rorg][func])) {
			res['type_desc'] = this.TYPE_MAP[rorg][func][type];
		}
	}

	return res;
};

module.exports = new EnoceanUtilsEepDesc();
