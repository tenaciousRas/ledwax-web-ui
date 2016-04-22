"use strict";

var authController = require('../controllers/auth'), validations = require('../validations');

module.exports = [ {
	method : 'GET',
	path : '/oauth/login',
	handler : authController.list,
	config : {
		description : 'Get a list of widgets',
		notes : 'Returns an array of all users in the database.',
		tags : [ 'api' ]
	}
}, {
	method : 'POST',
	path : '/oauth/login',
	handler : authController.update,
	config : {
		description : 'Get a list of widgets',
		notes : 'Returns an array of all users in the database.',
		tags : [ 'api' ]
	}
} ];
