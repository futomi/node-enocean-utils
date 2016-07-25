node-enocean-utils
===============

The node-enocean-utils is a Node.js module which allows you to get and analyze telegrams came from EnOcean devices via a USB gateway such as USB 400.

This module is based on the EnOcean specification as follows:

- EnOcean Serial Protocol 3
- EnOcean Radio Protocol 2
- EnOcean Equipment Profiles 2.6.5

See the [EnOcean web site](https://www.enocean.com/) for details.

## Dependencies
- [Node.js](https://nodejs.org/en/) 4.4 +
- [serialport](https://www.npmjs.com/package/serialport)

## Installation
```
$ npm install node-enocean-utils
```
---------------------------------------
## Table of Contents

* [Quick Start](#Quick-Start)
* [Methods](#Methods)
	* [`teach(params)`](#teach-method)
	* [`getDeviceInfo(id)`](#getDeviceInfo-method)
	* [`getLearnedDevices()`](#getLearnedDevices-method)
	* [`startMonitor(params, callback)`](#startMonitor-method)
	* [`stopMonitor(callback)`](#stopMonitor-method)
* [Events](#Events)
	* [`data` event](#data-event)
	* [`data-known` event](#data-known-event)
	* [`data-unknown` event](#data-unknown-event)
	* [`data-learn` event](#data-learn-event)
* [Objects](#Objects)
	* [`EnoceanUtils` object](#EnoceanUtils-object)
	* [`Device` object](#Device-object)
	* [`Telegram` object](#Telegram-object)
	* [`Message` object](#Message-object)
	* [`Value` object](#Value-object)
* [Supported EEPs](#Supported-EEPs)
* [Command Line Tools](#Command-Line-Tools)
	* [analyzer.js](#analyzer-js)
	* [learn.js](#learn-js)
* [How to know the module ID and the EEP](#How-to-know)
* [How to create your custom EEP parser](#How-to-create)
* [License](#License)

---------------------------------------
## <a name="Quick-Start"> Quick Start</a>

```JavaScript
var enocean = require('node-enocean-utils');

// Teach the information of Enocean devices
enocean.teach({
	'id'  : '00 00 00 2C 86 5C',
	'eep' : 'F6-02-04',
	'name': 'ESM210R Rocker Switch Single'
});
enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor({'path': 'COM7', 'rate': 57600});

// Set an event listener for 'data-known' events
enocean.on('data-known', (telegram) => {
	var message = telegram['message'];
	console.log(message['device']['name'] + ': ' + message['desc']);
});
```
At first, the information of a Rocker switch and a Temperature sensor is set using [`teach()`](#teach-method) method. In this case, the information of a device consists of 3 properties. The `id` property is a module ID of the targeted device. The `eep` property is an EEP (EnOcean Equipment Profile) which the targeted device supports. The `name` property is a name of the targeted device.

Then the [`startMonitor()`](#startMonitor-method) method is called to start monitoring telegrams incoming from the targeted devices. The [`startMonitor()`](#startMonitor-method) method takes an argument. It must be an object having at least `path` property.

The `path` property means the path of the USB gateway. If you use Windows OS, it should be like `COM3`. If you use Linux, it should be like `/dev/tty-usbserial1`. You can also specify the `rate` property which means the baud rate. The default value of the `rate` property is 56700. If your USB gateway supports the default baud rate, you don't need to specify the property.

Finally, an event listener for the [`data-known`](#data-known-event) event is set in this case. The [`data-known`](#data-known-event) event will fired only if the received telegram came from the devices which you registered using the [`teach()`](#teach-method) method and the registered EEP for the device was supported by this Node.js module `node-enocean-utils`. You can see the supported EEPs in the section "[Supported EEPs](#Supported-EEPs)" below.

When the [`data-known`](#data-known-event) event is fired, a [`Telegram`](#Telegram-object) object will be passed to the callback function. The [`Telegram`](#Telegram-object) object contains many values parsed from the incoming telegram. The sample code above shows the device name and the report data detected by the device.

You will see the result like this:

```
ESM210R Rocker Switch Single: B0 pressed
ESM210R Rocker Switch Single: B0 released
ESM210R Rocker Switch Single: BI pressed
ESM210R Rocker Switch Single: BI released
STM 431J Temperature Sensor: 28.2℃
STM 431J Temperature Sensor: 28.4℃
```

In order to analyze the EEP-specific reports in telegrams incoming from EnOcean devices, you have to know at least the module ID and the EEP of the targeted device in advance.

Using the "Teach-In" mechanism of EnOcean, you could get the module ID and the EEP by yourself. See the section "[How to know the module ID and the EEP](#How-to-know)" for details. At least you can surely obtain the module ID by yourself. But you can not necessarily obtain the EEP of all devices. If you don't know the EEP of your own device, check the user manual of the device or ask the seller which sold it to you.

---------------------------------------
## <a name="Methods"> Methods</a>

### <a name="teach-method"> teach(*device*)</a>

This method resisters a device. The [Device](#Device-object) object must be passed as the 1st argument. See the section "[Device object](#Device-object)" in details for the [`Device`](#Device-object) object.

```JavaScript
var enocean = require('node-enocean-utils');
enocean.teach({
	'id'  : '00 00 04 01 2B B4',
	'eep' : 'A5-07-01',
	'name': 'HM92-01WHC motion detector'
});
```

### <a name="getDeviceInfo-method"> getDeviceInfo(*id*)</a>

This method returns a [`Device`](#Device-object) object identified by the specified `id` among the registered devices using the [`teach()`](#teach-method) method.

The value of `id` must be a module ID of an EnOcean device. It must be hexadecimal representation such as `00 00 00 2C 86 5C`. `0000002C865C` and `00-00-00-2C-86-5C` are also acceptable. The value is not case-sensitive.

The module ID specified in EnOcean specifications consists of 24 bit, 32 bit, 48 bit. Therefore the value of `id` must be 6, 8, or 12 hexadecimal characters without white-space characters and hyphen characters.

If no device was found, then `null` will be returned.

```JavaScript
var enocean = require('node-enocean-utils');
enocean.teach({
	'id'  : '00 00 04 00 8F E0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});
var device = enocean.getDeviceInfo('00 00 04 01 2B B4');
console.log(device['id']);
console.log(device['name']);
```

The result of the sample code above will be as follows:

```
000004008FE0
STM250J Door Sensor
```

Note that the module ID in the result is slightly different from the `id` passed to [`teach()`](#teach-method) method. All module ID are normalized to the same format internally.


### <a name="getLearnedDevices-method"> getLearnedDevices()</a>

This method returns all of the registered devices as an hash object. The key of the hash object is a normalized module ID of a device.

```JavaScript
var enocean = require('node-enocean-utils');

enocean.teach({
	'id'  : '00 00 04 00 8F E0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});
enocean.teach({
	'id'  : '00 00 04 01 2B B4',
	'eep' : 'A5-07-01',
	'name': 'HM92-01WHC motion detector'
});
enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

var devices = enocean.getLearnedDevices();
for(var id in devices) {
	var device = devices[id];
	var cols = [device['id'], device['eep'], device['name']];
	console.log(cols.join(' | '));
}
```

The result of the sample code above will be as follows:

```
000004008FE0 | D5-00-01 | STM250J Door Sensor
000004012BB4 | A5-07-01 | HM92-01WHC motion detector
000004013195 | A5-02-05 | STM 431J Temperature Sensor
```

### <a name="startMonitor-method"> startMonitor(*params*, *callback*)</a>

This method starts monitoring incoming telegrams.

The 1st argument `params` is required. It must be a hash object having the properties as follows:

Property | Type   | Required | Description
---------|--------|----------|------------
`path`   | String | required | The path of the USB gateway. If you use Windows OS, it should be like `COM3`. If you use Linux, it should be like `/dev/tty-usbserial1`.
`rate`   | Number | optional | The baud rate of the USB gateway. The default value of the `rate` property is 56700. If your USB gateway supports the default baud rate, you don't need to specify the property.

When this method completes to start monitoring, the specified `callback` function will be called. No argument will be passed the callback function.

 The `callback` argument is optional. If the `callback` is not passed to this method, this method will do nothing when this method completes to start monitoring.

### <a name="stopMonitor-method"> stopMonitor(*callback*)</a>

This method stops monitoring incoming telegrams. When this method completes to stop monitoring, the specified `callback` function will be called. No argument will be passed the `callback` function.

The `callback` argument is optional. If the `callback` is not passed to this method, this method will do nothing when this method completes to stop monitoring.

---------------------------------------
## <a name="Events"> Events</a>

Whenever an EnOcean telegram was received, an event will be fired on the [`EnoceanUtils`](#EnoceanUtils-object) object.

### <a name="data-event"> `data` event</a>

The `data` event will be fired whenever any telegram was received event even if the telegram was not able to be parsed (The EEP was not supported by this module) or the telegram was a Teach-In telegram.

### <a name="data-known-event"> `data-known` event</a>

The `data-known` event will be fired only if the received telegram came from the devices which you registered using the `teach()` method and the registered EEP for the device was supported by this module.

### <a name="data-unknown-event"> `data-unknown` event</a>

The `data-unknown` event will be fired only if the received telegram was not able to be parsed (The module ID of the originator device was not registered or the EEP was not supported by this module).

### <a name="data-learn-event"> `data-learn` event</a>

The `data-learn` event will be fired when the received telegram was a Teach-In telegram.

---------------------------------------
## <a name="Objects"> Objects</a>

### <a name="EnoceanUtils-object"> `EnoceanUtils` object</a>

The `EnoceanUtils` object can be obtain by the code below as you can see the previous sections many times.

```JavaScript
var enocean = require('node-enocean-utils');
```

As you know, this document explain how to use the `EnoceanUtils` object.

### <a name="Device-object"> `Device` object</a>

The `Device` object represents an EnOcean device. This object is just a hash object.

When you use the [`teach`](#teach-method) method, you have to create this object by yourself. When you use the [`getDeviceInfo()`](#getDeviceInfo-method) method or the [`getLearnedDevices()`](#getLearnedDevices-method) method, you can obtain this object. You can see this object in the [`Telegram`](#Telegram-object) object as well.

This object consists of the properties as follows. The columns named "Required" is for the 1st argument of the [`teach()`](#teach-method) method:

Property      | Type   | Required | Description
--------------|--------|----------|------------------
`id`          | String | required | The module ID of the device. The value must be a string. (e.g. "00 00 00 2C 86 5C")
`eep`         | String | required | The EEP which the device supports. The value must be a string. (e.g. "F6-02-04")
`name`        | String | optional | The name of the device which you can identify the device. The value is not used for any process in this module. You can set any name. The length of the value must be equal to or less than 50.
`manufacturer`| String | optional | The manufacturer name of the device. The value is not used for any process. You can set any name. The length of the value must be equal to or less than 50.

### <a name="Telegram-object"> `Telegram` object</a>

The `Telegram` object represents an EnOcean telegram. This object is just a hash object.

Whenever an EnOcean telegram is received, an `Telegram` object will be passed to the callback function for the relevant event as the 1st argument. The structure of the `Telegram` object is as follows:

Property          | Type    | Description
------------------|---------|------------
`message`         | [`Message`](#Message-object) | See the section "[`Message` object](#Message-object)"
`buffer`          | Buffer  | This Buffer object represents a whole extent of the telegram.
`hex`             | Array   | This array represents a whole extent of the telegram. Each element in the array is an hexadecimal representation of each byte.
`structure`       | Array   | This array is used for [`analyzer.js`](#analyzer-js). You probably don't need this array. If you are interested in this array, you can see the structure using `console.dir()`.

Though there are a lot of values in this object, you don't need to use all values. It is enough to know only the `message` property in this object. You can get a [`Message`](#Message-object) object through the `message` property. See the section "[`Message` object](#Message-object)" for details.

### <a name="Message-object"> `Message` object</a>

You can obtain most of the necessary values through The `message` property in the [`Telegram`](#Telegram-object) object. The `message` property in this object returns a hash object having the properties as follows:

Property          | Type    | Description
------------------|---------|------------
`packet_type`     | Number  | The code of the packet type. You can see the meaning of this value from the `packet_type_desc` property.
`packet_type_desc`| String  | The pakcet type.
`device`          | Object  |The [`Device`](#Device-object) object representing the originated device.
`oid`             | String  | The module ID of the originated device. This value is not normalized.
`crc`             | Boolean | The result of all of the CRC8 checks specified in EnOcean Serial Protocol 3 (ESP3) specification. If all of the CRC8 checks were passed, the value of this property will be true, otherwise false.
`eep`             | String  | The EEP of the telegram.
`known`           | Boolean | If the originated device was registered and the EEP was supported by this module, this value will be true, otherwise false.
`value`           | Object  | The [`Value`](#Value-object) representing the EEP-specific report from the originated device. This value is an hash object. The properties in the object depends on the EEP. See the section "[Value] object](#Value-object)" and the section "[Supported EEPs](#Supported-EEPs)" in details.
`desc`            | String  | This value represents the report from the originated device. This value is a string summarizing the report.
`learn`           | Boolean | When the telegram is a Teach-In telegram, this value will be true, otherwise false.
`rorg`            | Number  | The R-ORG part in the EEP.
`rorg_desc`       | String  | The meaning of the R-ORG.
`func`            | Number  | The FUNC part in the EEP.
`func_desc`       | String  | The meaning of the FUNC.
`type`            | Number  | The TYPE part in the EEP.
`type_desc`       | String  | The meaning of the TYPE.
`dbm`             | Number  | The RSSI value. The unit is dBm.
`dbm_desc`        | String  | The RSSI with the unit.
`data_dl_buffer`  | Buffer  | A Buffer object representing the Data DL.

```JavaScript
var enocean = require('node-enocean-utils');

enocean.teach({
	'id'  : '00 00 04 01 31 95',
	'eep' : 'A5-02-05',
	'name': 'STM 431J Temperature Sensor'
});

enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-known', (telegram) => {
	console.dir(telegram['message']);
});
```

The result of the code above will be as follows:

```JavaScript
{ packet_type: 10,
  packet_type_desc: 'RADIO_ERP2 (ERP2 protocol radio telegram)',
  device:
   { id: '000004013195',
     eep: 'A5-02-05',
     name: 'STM 431J Temperature Sensor',
     manufacturer: '',
     learned: true },
  oid: '04 01 31 95',
  crc: true,
  eep: 'A5-02-05',
  known: true,
  value: { temperature: '28.7' },
  desc: '28.7℃',
  learn: false,
  rorg: 'A5',
  rorg_desc: '4BS Telegram',
  func: '02',
  func_desc: 'Temperature Sensors',
  type: '05',
  type_desc: 'Temperature Sensor Range 0℃ to +40℃',
  dbm: -41,
  dbm_desc: '-41 dBm' }
```

### <a name="Value-object"> `Value` object</a>

You can obtain the EEP-specific report from the `Value` object which you can access through the `value` property in the [`Telegram`](#Telegram-object). The sample code below shows how to obtain and utilize the `Value` object.

```JavaScript
var enocean = require('node-enocean-utils');

enocean.teach({
	'id'  : '00 00 04 00 8F E0',
	'eep' : 'D5-00-01',
	'name': 'STM250J Door Sensor'
});

enocean.teach({
	'id'  : '00 00 00 2C 86 5C',
	'eep' : 'F6-02-04',
	'name': 'ESM210R Rocker Switch Single'
});

enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-known', (telegram) => {
	var value = telegram['message']['value']; // Value object
	var eep = telegram['message']['eep'];
	if(eep === 'D5-00-01') {
		// STM250J Door Sensor
		if(value['contact'] === 1) {
			console.log('The door was closed.');
		} else if(value['contact'] === 0) {
			console.log('The door was opened.');
		}
	} else if(eep === 'F6-02-04') {
		// ESM210R Rocker Switch Single
		if(value['pressed'] === 1) {
			console.log(value['button'] + ' was pressed.');
		} else if(value['pressed'] === 0) {
			console.log(value['button'] + ' was released.');
		}
	}
});
```
The two type of devices are registered, a door sensor and a rocker switch. In the callback function for the `data-known` event, the EEP is determined from `Telegram.message.eep` property. As you can see, the properties supported by the `Value` object are different depending on the EEP. See the section "[Supported EEPs](#Supported-EEPs)" for details.

---------------------------------------
## <a name="Supported-EEPs"> Supported EEPs</a>

This module supports the EEPs as follows. This section describes the structure of the `Value` object for each EEP as well.

### A5-02-05

* RORG : 4BS Telegram (A5)
* FUNC : Temperature Sensors (02)
* TYPE : Temperature Sensor Range 0°C to +40°C (05)

Property      | Type   | Description
--------------|--------|------------
`temperature` | Number | This value is the temperature measured by the originated temperature sensor. The unit is Celsius (℃).

### A5-04-01

* RORG : 4BS Telegram (A5)
* FUNC : Temperature and Humidity Sensor (04)
* TYPE : Range 0°C to +40°C and 0% to 100% (01)

Property       | Type   | Description
---------------|--------|------------
`humidity`     | Number | This value is the humidity measured by the originated sensor. The unit is percent (%).
`temperature`  | Number | This value is the temperature measured by the originated temperature sensor. The unit is Celsius (℃). If the originated sensor does not have temperature sensor availability, this value is null.


### A5-07-01

* RORG : 4BS Telegram (A5)
* FUNC : Occupancy Sensor (07)
* TYPE : Occupancy with Supply voltage monitor (01)

Property      | Type   | Description
--------------|--------|------------
`pirs`        | Number | This value represents the PIR status. If the occupancy sensor detect any motion, this value will be 1, otherwise 0.
`svc`         | Number | This value represents the supply voltage. This value is a floating number between 0 and 5. The unit is V.

### A5-09-04

* RORG : 4BS Telegram (A5)
* FUNC : Gas Sensor (09)
* TYPE : CO2 Sensor (04)

Property       | Type   | Description
---------------|--------|------------
`humidity`     | Number | This value is the humidity measured by the originated sensor. The unit is percent (%). If the originated sensor does not have humidity sensor availability, this value is null.
`concentration`| Number | This value is the CO2 concentration measured by the originated sensor. The unit is ppm.
`temperature`  | Number | This value is the temperature measured by the originated temperature sensor. The unit is Celsius (℃). If the originated sensor does not have temperature sensor availability, this value is null.

### D5-00-01

* RORG : 1BS Telegram (D5)
* FUNC : Contacts and Switches (00)
* TYPE : Single Input Contact (01)

Property      | Type   | Description
--------------|--------|------------
`contact`     | Number | This value will be 1 if the door was closed. Otherwise it will be 0.

### F6-02-02

* RORG : RPS Telegram (F6)
* FUNC : Rocker Switch, 2 Rocker (02)
* TYPE : Light and Blind Control - Application Style 2 (02)

Property  | Type   | Description
----------|--------|------------
`pressed` | Number | If a button was pressed, this value will be 1. If a button was released, this value will be 0.
`button`  | String | The button name which was pressed or released. This value is either 'BI', 'B0', 'AI', or 'A0'.

### F6-02-04

* RORG : RPS Telegram (F6)
* FUNC : Rocker Switch, 2 Rocker (02)
* TYPE : Light and blind control ERP2 (04)

Property  | Type   | Description
----------|--------|------------
`pressed` | Number | If a button was pressed, this value will be 1. If a button was released, this value will be 0.
`button`  | String | The button name which was pressed or released. This value is either 'BI', 'B0', 'AI', or 'A0'.


---------------------------------------
## <a name="Command-Line-Tools"> Command Line Tools</a>

This module includes some useful command line scripts in `tools` folder.

### <a name="analyzer-js"> analyzer.js</a>

This script analyzes all incoming telegrams and shows you the results as formatted texts. If you want to analyze EEP-specific telegrams, set the device information as an array to the `analyzer.json` located in the same folder. The JSON blow is an example of `analyzer.json`:

```JavaScript
[
	{
		"id"  : "00 00 04 00 8F E0",
		"eep" : "D5-00-01",
		"name": "STM250J Door Sensor"
	},
	{
		"id"  : "00 00 04 01 31 95",
		"eep" : "A5-02-05",
		"name": "STM 431J Temperature Sensor"
	}
]
```

If you run this script, this script listens to incoming telegrams. Whenever an telegram comes, this script shows the result. This script takes two arguments. The 1st argument is the path of the serial port. The 1st argument is required. The 2nd argument is the baud rate of the serial port. The 2nd argument is optional. If you don't specify the 2nd argument, the baud rate is 56700.

This script shows the result as follows:

```
D:\GitHub\node-enocean-utils\tools>node analyzer.js COM7
===============================================================================
[Summary]
- HEX                          |55 00 0A 02 0A 9B 22 04 01 31 95 00 00 48 08..
- Packet Type                  |RADIO_ERP2 (ERP2 protocol radio telegram)
- Device Name                  |STM 431J Temperature Sensor
- Device ID                    |000004013195
- Manufacturer                 |Unknown
- EEP                          |A5-02-05
- RORG                         |4BS Telegram
- FUNC                         |Temperature Sensors
- TYPE                         |Temperature Sensor Range 0℃ to +40℃
- Data                         |28.7℃
- Learn                        |false
- Known                        |true
- RSSI                         |-41 dBm
- CRC                          |valid
-------------------------------------------------------------------------------
[Telegram]
- Sync. Byte                   |55         |55
- Header                       |00 0A 02 0A|
  - Data Length                |00 0A      |10 byte
  - Optional Length            |02         |2 byte
  - Packet Type                |0A         |RADIO_ERP2 (ERP2 protocol radio ..
- CRC8H                        |9B         |valid
- Data                         |22 04 01 31|
  - Header                     |22         |
    - Address Control          |01         |Originator-ID 32 bit; no Destina..
    - Extended header available|00         |No extended header
    - Telegram type (R-ORG)    |02         |4BS telegram (0xA5)
  - Originator-ID              |04 01 31 95|04 01 31 95
  - Data_DL                    |00 00 48 08|
    - Temperature              |48         |28.7℃
    - LRN Bit                  |01         |Data telegram
  - CRC                        |63         |valid
- Optional Data                |01 29      |
  - SubTelNum                  |01         |1
  - dBm                        |29         |-41 dBm
- CRC8D                        |CA         |valid
```

### <a name="learn-js"> learn.js</a>

This script analyzes incoming Teach-In telegrams and shows you the results. If you run this script, this script listens to incoming Teach-In telegrams. Whenever an Teach-In telegram comes, this script shows the result.

This script takes two arguments. The 1st argument is the path of the serial port. The 1st argument is required. The 2nd argument is the baud rate of the serial port. The 2nd argument is optional. If you don't specify the 2nd argument, the baud rate is 56700.

This script shows the result as follows:

```
D:\GitHub\node-enocean-utils\tools>node learn.js COM7
Module ID   |EEP     |Manufacturer
------------|--------|--------------------
000004012BB4|A5-07-81|SIMICX_CO_LTD
000004013195|A5-02-05|ENOCEAN_GMBH
000004008FE0|        |
```

---------------------------------------
## <a name="How-to-know"> How to know the module ID and the EEP</a>

In order to know the module ID and the EEP, read the user manual of the device you own at first if it is available. If it does not describe such information, you can investigate the information by yourself depending on the type of the device.

The devices sending telegrams grouped in 4BS (e.g. temperature sensors) or 1BS (e.g. door sensors) are probably equipped with a small button. If you press the button, the device will send a Teach-In telegrams. If you can catch the telegram, you can get the module ID and the EEP.

For catching Teach-In telegrams, the [`learn.js`](#learn-js) described in the previous section is useful.

If the device is grouped in 1BS (e.g. door sensors), it will inform only the module ID. To make matters worse, if your device is grouped in RPS (e.g. locker switches), it does not have the Teach-In mechanism.

Anyway, you can get at least the module ID even if the device is grouped in RPS. Run the [`analizer.js`](#analyzer-js) and press a button on the locker switch. Then you will catch a RPS telegram and see the result. In the result, you can see the module ID in the line for the Device ID.

Finally, if you could not get the EEP by yourself, ask the seller which the device sold to you. That's the last resort.

---------------------------------------
## <a name="How-to-create"> How to create your custom EEP parser</a>

This module supports some EEPs, there are a lot of EEPs this module does not support. If you need to use an EEP which this module does not support, you can develop a custom parser by yourself.

At first, set an callback function for the [`data-unknown`](#data-unknown-event) event. You can catch all telegrams whose EEPs are not supported by this module.

You can obtain a Buffer object representing the Data of Data Link Layer (Data_DL) specified in the EnOcean Radio Protocol 2 (ERP2) Specification P16. Once you get the Data_DL, you can parse it based on the EnOcean Equipment Profiles (EEP) Specification Version 2.6.5.

In order to obtain the Buffer object representing the  Data_DL, access to the `data_dl_buffer` property in the [`Message`](#Message-object).

Note that you have to know the EEP of the targeted device in advance to parse the Data_DL.

```JavaScript
var enocean = require('node-enocean-utils');
enocean.startMonitor({'path': 'COM7', 'rate': 57600});

enocean.on('data-unknown', (telegram) => {
	// Buffer object representing the Data DL
	var buf = telegram['message']['data_dl_buffer'];

	// If you know the EEP of the originated device,
	// you can parse the Data DL based on EEP specification.
	// The code below assumes that the EEP is F6-02-04.
	// This EEP represents the Light and blind control ERP2
	// such as rocker switches.
	// The specification for F6-02-04 is described in
	// the EEP 2.6.5 specification P17.

	// The Data DL consists of a byte, that is 8bit.
	var dd = buf.readUInt8(buf);

	// The 1st bit represents "Energy Bow" which means
	// whether a button was pressed or released.
	// In this case, releasing a button is not necessary.
	if((dd & 0b10000000) === 0) {
		return;
	}

	// The bit from 5th to 8th represents whether the
	// button was pressed or released.
	if(dd & 0b00001000) {
		console.log('The button BI was pressed.');
	} else if(dd & 0b00000100) {
		console.log('The button B0 was pressed.');
	} else if(dd & 0b00000010) {
		console.log('The button AI was pressed.');
	} else if(dd & 0b00000001) {
		console.log('The button A0 was pressed.');
	}
});
```

---------------------------------------
## <a name="License"> License</a>

The MIT License (MIT)

Copyright 2016 Futomi Hatano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
