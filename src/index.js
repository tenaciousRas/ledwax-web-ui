#!/usr/bin/env node
'use strict';

const Hapi = require('hapi'),
	Glue = require('glue'),
	Inert = require('inert'),
	Path = require('path');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';

let hapiConfig = require('./config/app.config')[rt_ctx_env];

// Configure the hapi server using a manifest(config) file
let options = {
	relativeTo : __dirname
};

// glue uses a manifest to configure and run hapi for us
Glue.compose(hapiConfig.application, options, (err, server) => {

	if (err) {
		throw err;
	}
	server.start(() => {
		let connects = ' running at: ';
		for (let i = 0; i < server.connections.length; i++) {
			connects += server.connections[i].info.uri;
			if (i < server.connections.length - 1) {
				connects += ", ";
			}
		}
		console.log('LEDWax running in ' + rt_ctx_env
			+ ' mode; using [hapi] server v' + server.version
			+ connects);
	});
	// export the server for testing
	module.exports.server = server;
});