"use strict";

var authController = require('../controllers/auth'), validations = require('../validations');

module.exports = [
	{
		method : 'GET',
		path : '/oauth/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ]
		}
	}, {
		method : 'POST',
		path : '/oauth/login',
		handler : authController.login,
		config : {
			description : 'Authenticate a user.',
			notes : 'Returns HTTP status code and message.',
			tags : [ 'api' ]
		}
	},
	{
		method : 'GET',
		path : '/users/list',
		handler : authController.list,
		config : {
			description : 'List users stored in DB.',
			notes : 'Return array of users.',
			tags : [ 'api' ]
		}
	}
];
