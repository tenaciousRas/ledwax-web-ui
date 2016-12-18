'use strict';

var glob = require('glob'),
	path = require('path');

exports.register = (server, options, next) => {

	// register routes
	glob('./routes/**/*.routes.js', {
		cwd : __dirname
	}, (err, matches) => {
		matches.forEach((filepath) => {
			server.route(require(filepath));
		});

		return next();
	});
};

exports.register.attributes = {
	pkg : require('./package.json')
};