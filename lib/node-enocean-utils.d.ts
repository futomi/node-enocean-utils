/**
 * node-enocean-typings
 *
 * @link https://github.com/futomi/node-enocean-utils
 * @author Dominique Rau [domi.github@gmail.com](mailto:domi.github@gmail.com)
 * @version 0.0.1
 */

declare module 'node-enocean-utils' {
	interface Device {
		id: string; // The module ID of the device. The value must be a string. (e.g. "00 00 00 2C 86 5C")
		eep: string; // The EEP which the device supports. The value must be a string. (e.g. "F6-02-04")
		name?: string; // The name of the device which you can identify the device. The value is not used for any process in this module. You can set any name. The length of the value must be equal to or less than 50.
		manufacturer?: string; // The manufacturer name of the device. The value is not used for any process. You can set any name. The length of the value must be equal to or less than 50.
	}

	interface Message {
		packet_type: number; // The code of the packet type. You can see the meaning of this value from the packet_type_desc property.
		packet_type_desc: string; // The pakcet type.
		device: Device; // The Device object representing the originated device.
		oid: string; // The module ID of the originated device. This value is not normalized.
		crc: boolean; // The result of all of the CRC8 checks specified in EnOcean Serial Protocol 3 (ESP3) specification. If all of the CRC8 checks were passed, the value of this property will be true, otherwise false.
		known: boolean; // If the originated device was registered and the EEP was supported by this module, this value will be true, otherwise false.
		value: Value; // The Value representing the EEP-specific report from the originated device. This value is an hash object. The properties in the object depends on the EEP. See the section "[Value] object](#Value-object)" and the section "Supported EEPs" in details.
		desc: string; // This value represents the report from the originated device. This value is a string summarizing the report.
		learn: boolean; // When the telegram is a Teach-In telegram, this value will be true, otherwise false.
		rorg: number; // The R-ORG part in the EEP.
		rorg_desc: string; // The meaning of the R-ORG.
		func: number; // The FUNC part in the EEP.
		func_desc: string; // The meaning of the FUNC.
		type: number; // The TYPE part in the EEP.
		type_desc: string; // The meaning of the TYPE.
		dbm: number; // The RSSI value. The unit is dBm.
		dbm_desc: string; // The RSSI with the unit.
		data_dl_buffer: Buffer; // A Buffer object representing the Data DL.

		/*
			The EEP of the telegram.
			A5-02-05 //RORG: A5 - FUNC: 02 - TYPE : Temperature Sensor Range 0°C to +40°C (05)
			A5-04-01 //RORG: A5 - FUNC: 04 - TYPE : Range 0°C to +40°C and 0% to 100% (01)
			A5-07-01 //RORG: A5 - FUNC: 07 - TYPE : Occupancy with Supply voltage monitor (01)
			A5-09-04 //RORG: A5 - FUNC: 09 - TYPE : CO2 Sensor (04)
			D5-00-01 //RORG: D5 - FUNC: 00 - TYPE : Single Input Contact (01)
			F6-02-01 //RORG: F6 - FUNC: 02 - TYPE : Light and Blind Control - Application Style 1 (01)
			F6-02-02 //RORG: F6 - FUNC: 02 - TYPE : Light and Blind Control - Application Style 2 (02)
			F6-02-04 //RORG: F6 - FUNC: 02 - TYPE : Light and blind control ERP2 (04)
		*/
		eep:
			| 'A5-02-05'
			| 'A5-04-01'
			| 'A5-07-01'
			| 'A5-09-04'
			| 'D5-00-01'
			| 'F6-02-01'
			| 'F6-02-02'
			| 'F6-02-04';
	}

	interface Telegram {
		message: Message;
		buffer: Buffer; // This Buffer object represents a whole extent of the telegram.
		hex: string[]; // This array represents a whole extent of the telegram. Each element in the array is an hexadecimal representation of each byte.
		structure: any[]; // This array is used for analyzer.js. You probably don't need this array. If you are interested in this array, you can see the structure using console.dir().
	}

	interface Value {
		humidity?: number; // This value is the humidity measured by the originated sensor. The unit is percent (%).
		temperature?: number; // This value is the temperature measured by the originated temperature sensor. The unit is Celsius (℃). If the originated sensor does not have temperature sensor availability, this value is null.
		pirs?: number; // This value represents the PIR status. If the occupancy sensor detect any motion, this value will be 1, otherwise 0.
		svc?: number; // This value represents the supply voltage. This value is a floating number between 0 and 5. The unit is V.
		concentration?: number; // This value is the CO2 concentration measured by the originated sensor. The unit is ppm.
		contact?: number; // This value will be 1 if the door was closed. Otherwise it will be 0.
		pressed?: number; // If a button was pressed, this value will be 1. If a button was released, this value will be 0.
		button?: string; // The button name which was pressed or released. This value is either 'BI', 'B0', 'AI', or 'A0'.
	}

	interface MonitoringOptions {
		path?: string; //The path of the USB gateway. If you use Windows OS, it should be like COM3. If you use Linux, it should be like /dev/tty-usbserial1.
		rate?: number; //The baud rate of the USB gateway. The default value of the rate property is 56700. If your USB gateway supports the default baud rate, you don't need to specify the property.
	}

	interface Gateway {
		path: string; // The identifier of the serial port. (e.g., "/dev/ttyUSB0", "COM7")
		baudRate: number; // The baud rate. (e.g., 57600)
		manufacturer: string; // The manufacturer of the USB gateway dongle or the USB serial chip in the USB gateway dongle. (e.g., "EnOcean GmbH", "FTDI")
		vendorId: string; // The vendor ID of the USB serial chip in the USB gateway dongle. (e.g., "0403")
		productId: string; // The product ID of the USB serial chip in the USB gateway dongle or the name of the USB gateway dongle. (e.g., "6001", "EnOcean USB 400J DA")
		serialNumber: string; // The serial number of the USB serial chip in the USB gateway dongle. (e.g., "FT5CTUI")
		appVersion: string; // The application version of the USB gateway dongle. (e.g., "1.3.0.0")
		chipId: string; // The chip ID of the USB gateway dongle. (e.g., "04014979")
		chipVersion: string; // The chip version of the USB gateway dongle. (e.g., "69.79.4.0")
		appDescription: string; // The application description of the USB gateway dongle. (e.g., "DolphinV4_GWC")
	}

	// This method resisters a device. The Device object must be passed as the 1st argument. See the section "Device object" in details for the Device object.
	export function teach(device: Device): Promise<void>;

	// This method returns a Device object identified by the specified id among the registered devices using the teach() method.
	export function getDeviceInfo(deviceId: string): Device;

	// This method returns all of the registered devices as an hash object. The key of the hash object is a normalized module ID of a device.
	export function getLearnedDevices(): { [deviceId: string]: Device };

	// This method establishes a connection to a USB serial port associated to your USB gateway dongle and starts to monitor telegrams coming from EnOcean devices. This method returns a Promise object by default.
	export function startMonitor(options?: MonitoringOptions): Promise<Gateway>;
	export function startMonitor(
		options?: MonitoringOptions,
		cb?: (err, gateway: Gateway) => void
	): void;

	// This method stops monitoring incoming telegrams. This method returns a Promise object by default.
	export function stopMonitor(): Promise<void>;
	export function stopMonitor(cb?: (err) => void): void;
	export function on(
		name: 'data' | 'data-unknown' | 'data-unknown' | 'data-learn',
		callback: (telegram: Telegram) => void
	);
	export function off(
		name: 'data' | 'data-unknown' | 'data-unknown' | 'data-learn',
		callback: (telegram: Telegram) => void
	);
}
