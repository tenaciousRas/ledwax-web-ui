"use strict";

var controller = require('../controllers/auth'), validations = require('../validations');

module.exports = [ {
	method : 'GET',
	path : '/widgets',
	handler : controller.list,
	config : {
		description : 'Get a list of widgets',
		notes : 'Returns an array of all widgets in the database.',
		tags : [ 'api' ]
	}
}, {
	method : 'POST',
	path : '/widgets',
	handler : controller.update,
	config : {
		description : 'Update a Widget',
		notes : 'Updates an existing widget, or inserts a new one.',
		tags : [ 'api' ],
		validate : validations.update
	}
}, {
	method : 'GET',
	path : '/oauth/login',
	handler : controller.list,
	config : {
		description : 'Get a list of widgets',
		notes : 'Returns an array of all widgets in the database.',
		tags : [ 'api' ]
	}
} ];
