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

const addCorsHeaders = (request, reply) => {
	if (!request.headers.origin) {
		return reply.continue();
	}
	// depending on whether we have a boom or not,
	// headers need to be set differently.
	let response = request.response.isBoom ? request.response.output : request.response

	response.headers['access-control-allow-origin'] = request.headers.origin
	response.headers['access-control-allow-credentials'] = 'true'
	if (request.method !== 'options') {
		return reply.continue();
	}

	response.statusCode = 200
	response.headers['access-control-expose-headers'] = 'content-type, content-length, etag'
	response.headers['access-control-max-age'] = 60 * 10 // 10 minutes
	// dynamically set allowed headers & method
	if (request.headers['access-control-request-headers']) {
		response.headers['access-control-allow-headers'] = request.headers['access-control-request-headers']
	}
	if (request.headers['access-control-request-method']) {
		response.headers['access-control-allow-methods'] = request.headers['access-control-request-method']
	}
	reply.continue();
};

// glue uses a manifest to configure and run hapi for us
Glue.compose(hapiConfig.application, options, (err, server) => {

	if (err) {
		throw err;
	}
	server.ext('onPreResponse', addCorsHeaders);
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