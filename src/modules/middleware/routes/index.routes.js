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

let dynFuncNames = ledwaxDeviceController.dynamicFuncNames;
for (let i = 0; i < dynFuncNames.length; i++) {
	let key = dynFuncNames[i];
	routeConfig.push({
		method : 'GET',
		path : '/devices/' + key,
		handler : ledwaxDeviceController.controller[key],
		config : {
			description : 'Path dynamically generated.',
			notes : 'Returns a ledwax return value.',
			tags : [ 'api' ],
			validate: validations.ledwaxDevices[key]
		}
	});
}

module.exports = routeConfig;
