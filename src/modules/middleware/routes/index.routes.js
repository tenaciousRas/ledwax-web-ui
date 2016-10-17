"use strict";

const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const ledwaxDeviceController = require('../controllers/ledwax_device');
const	validations = require('../validations');

let routeConfig = [
	{
		method : 'GET',
		path : '/oauth/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ],
			validate: validations.auth.loginGet
		}
	}, {
		method : 'POST',
		path : '/oauth/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ],
			validate: validations.auth.loginPost
		}
	}, {
		method : 'GET',
		path : '/users/find',
		handler : userController.findCookie,
		config : {
			description : 'Find a stored user in DB by ID.',
			notes : 'Return a user object.',
			tags : [ 'api' ],
			validate: validations.user.findCookie
		}
	}, {
		method : 'POST',
		path : '/users/create',
		handler : userController.insert,
		config : {
			description : 'Create a new persistent user.',
			notes : 'Returns the persistent user object.',
			tags : [ 'api' ],
			validate: validations.user.insert
		}
	}, {
		method : 'POST',
		path : '/users/update',
		handler : userController.updateCookie,
		config : {
			description : 'Update an existing persistent user\'s cookietoken.',
			notes : 'Returns the persistent user object.',
			tags : [ 'api' ],
			validate: validations.user.updateCookie
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
			validate: validations.ledwaxDevices[key]
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
