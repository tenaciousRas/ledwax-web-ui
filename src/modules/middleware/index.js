'use strict';

var glob = require('glob'), path = require('path');
const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
let particleConfig = require('../../particle-config').attributes[rt_ctx_env];

exports.register = (server, options, next) => {

	// register data models
	glob('./models/**/*.model.js', {
			cwd : __dirname
		}, (err, matches) => {
			let models = [];
			matches.forEach((filepath) => {
				require(filepath);
			});
				glob('./routes/*.routes.js', {
					cwd : __dirname
				}, (err, matches) => {
					matches.forEach((filepath) => {
						server.route(require(filepath));
					});

					return next();
				});
		});
		server.method('particle.config', () => {return particleConfig;});
};
exports.register.attributes = {
	pkg : require('./package.json')
};
