"use strict";

const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const ledwaxDeviceController = require('../controllers/ledwax_device');
const ledwaxCloudDeviceController = require('../controllers/ledwax_cloud_device');
const ledwaxDeviceDiscoverController = require('../controllers/ledwax_device_discover');
const validations = require('../validations');

let routeConfig = [
	{
		method : [ 'POST', 'GET' ],
		path : '/',
		handler : (request, reply) => {
			// return heartbeat
			return reply('LEDWAX REST API running at ' + request.server.uri + '!');
		}
	}, {
		method : 'GET',
		path : '/user/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ],
			validate : validations.auth.loginGet
		}
	}, {
		method : 'POST',
		path : '/user/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ],
			validate : validations.auth.loginPost
		}
	}, {
		method : 'GET',
		path : '/users/find',
		handler : userController.find,
		config : {
			description : 'Find a stored user in DB by session ID.',
			notes : 'Return a user object.',
			tags : [ 'api' ],
			validate : validations.user.find
		}
	}, {
		method : 'POST',
		path : '/users/create',
		handler : userController.insert,
		config : {
			description : 'Create a new persistent user.',
			notes : 'Returns the persistent user object.',
			tags : [ 'api' ],
			validate : validations.user.insert
		}
	}, {
		method : 'POST',
		path : '/users/update',
		handler : userController.update,
		config : {
			description : 'Set current strip being controlled for given device.',
			notes : 'Returns the persistent user object.',
			tags : [ 'api' ],
			validate : validations.user.insert
		}
	}, {
		method : 'POST',
		path : '/devices/setCurrentStrip',
		handler : ledwaxDeviceController.controller.setCurrentStrip,
		config : {
			description : 'Set current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setCurrentStrip
		}
	}, {
		method : 'POST',
		path : '/devices/setBrightness',
		handler : ledwaxDeviceController.controller.setBrightness,
		config : {
			description : 'Set brightness for current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setBrightness
		}
	}, {
		method : 'POST',
		path : '/devices/setDispMode',
		handler : ledwaxDeviceController.controller.setDispMode,
		config : {
			description : 'Set LED display mode for current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setDispMode
		}
	}, {
		method : 'POST',
		path : '/devices/setColor',
		handler : ledwaxDeviceController.controller.setColor,
		config : {
			description : 'Set LED strip color for given mode-color-index, for current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setColor
		}
	}, {
		method : 'POST',
		path : '/devices/setMultiColorHoldTime',
		handler : ledwaxDeviceController.controller.setMultiColorHoldTime,
		config : {
			description : 'Set LED multi-color hold time for current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setMultiColorHoldTime
		}
	}, {
		method : 'POST',
		path : '/devices/setLEDFadeTimeInterval',
		handler : ledwaxDeviceController.controller.setLEDFadeTimeInterval,
		config : {
			description : 'Set LED fade time interval for current strip being controlled for given device.',
			notes : 'Returns result of LEDWax device function call, 1 = error, 0 = success.',
			tags : [ 'api' ],
			validate : validations.ledwaxDevicesConvenience.setLEDFadeTimeInterval
		}
	}, {
		method : 'GET',
		path : '/devices/retrieveAllStoredDevices',
		handler : ledwaxCloudDeviceController.retrieveAllStoredDevices,
		config : {
			description : 'Get all devices in persistent storage.',
			notes : 'Returns an array of device objects or empty array',
			tags : [ 'api' ],
			validate : validations.ledwaxCloudDevices.retrieveAllStoredDevices
		}
	}, {
		method : 'GET',
		path : '/devices/retrieveStoredDevice',
		handler : ledwaxCloudDeviceController.retrieveStoredDevice,
		config : {
			description : 'Get all devices in persistent storage.',
			notes : 'Returns a single device objects or an empty object',
			tags : [ 'api' ],
			validate : validations.ledwaxCloudDevices.retrieveStoredDevice
		}
	}, {
		method : 'POST',
		path : '/devices/saveDevice',
		handler : ledwaxCloudDeviceController.saveDevice,
		config : {
			description : 'Save device to persistent storage.',
			notes : 'Performs insert or update.  Returns the saved object.',
			tags : [ 'api' ],
			validate : validations.ledwaxCloudDevices.saveDevice
		}
	}, {
		method : 'GET',
		path : '/devices/discoverDevices',
		handler : ledwaxDeviceDiscoverController.discoverLEDWaxDevices,
		config : {
			description : 'Discover LEDWax devices registered with the particle cloud for authenticated user.',
			notes : 'Performs insert or update.  Returns the saved object.',
			tags : [ 'api' ],
			validate : validations.ledwaxCloudDeviceDiscover.discoverDevices
		}
	}, {
		method : 'GET',
		path : '/devices/discoverCaps',
		handler : ledwaxDeviceDiscoverController.discoverLEDWaxDeviceCaps,
		config : {
			description : 'Discover LEDWax device capabilities registered with the particle cloud for authenticated user.',
			notes : 'Performs insert or update.  Returns the saved object.',
			tags : [ 'api' ],
			validate : validations.ledwaxCloudDeviceDiscover.discoverCaps
		}
	}
];

/**
 * Add a dynamic route for iot vars andfunctions.
 */
const addDynamicRoute = (key, method, notes) => {
	routeConfig.push({
		method : method,
		path : '/devices/' + key,
		handler : ledwaxDeviceController.controller[key],
		config : {
			description : 'Dynamically generated path.',
			notes : notes,
			tags : [ 'api' ],
			validate : validations.ledwaxDevices[key]
		}
	});
};

/**
 * Build dynamic routes for dynamic handler functions in controller.
 */
const buildDynamicRoutesForController = () => {
	// routes for iot vars
	let dynFuncNames = ledwaxDeviceController.dynamicFuncNames.iotVars;
	for (let i = 0; i < dynFuncNames.length; i++) {
		let key = dynFuncNames[i].handlerFuncName;
		addDynamicRoute(key, 'GET', 'Returns a ledwax return value.');
	}
	// routes for iot FNs
	dynFuncNames = ledwaxDeviceController.dynamicFuncNames.iotFns;
	for (let i = 0; i < dynFuncNames.length; i++) {
		let key = dynFuncNames[i].handlerFuncName;
		addDynamicRoute(key, 'POST', 'Returns a ledwax function.');
	}
};
buildDynamicRoutesForController();

module.exports = routeConfig;