'use strict';

var glob = require('glob'), path = require('path');

exports.register = function(server, options, next) {

	// register data models
	glob('./models/**/*.model.js', {
		cwd : __dirname
	}, function(err, matches) {
		matches.forEach(require);

		// register routes
		glob('./routes/*.routes.js', {
			cwd : __dirname
		}, function(err, matches) {
			matches.forEach(function(filepath) {
				server.route(require(filepath));
			});

			return next();
		});
	});

};
exports.register.attributes = {
	pkg : require('./package.json')
};
