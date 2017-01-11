#!/usr/bin/env node
'use strict';

const Hapi = require('hapi'),
	Glue = require('glue'),
	Inert = require('inert'),
	Path = require('path');
const boom = require('boom');

const particlewrap = require('particle-api-js');
const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
let default_particle_config = require('./particle-config').attributes[rt_ctx_env];
let particle = null;
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

const buildParticleConfigFromDB = (request, reply) => {
	const logTag = 'index#buildParticleConfigFromDB';
	let db = request.getDb('apidb');
	let cloud = db.getModel('particle_cloud');
	let cloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
	let prom = {};
	prom.then = (succCb, errCb) => {
		try {
			cloud.findOne({
				where : {
					id : {
						$eq : cloudId
					}
				}
			}).then((cloud) => {
				let ret = {};
				request.server.log([ 'debug', logTag ],
					'DB call complete - promise success, cloud =:' + cloud);
				if (null == cloud) {
					ret = default_particle_config;
				} else {
					let dbConfig = {};
					dbConfig.name = cloud.name;
					dbConfig.baseUrl = 'http://' + cloud.ip + (cloud.port ? ':' + cloud.port : '');
					dbConfig.clientSecret = cloud.client_secret;
					dbConfig.clientId = cloud.client_id;
					dbConfig.tokenDuration = cloud.token_duration;
					ret = dbConfig;
				}
				request.server.log([ 'debug', logTag ],
					'got DB config for cloud =:' + JSON.stringify(ret));
				succCb(ret);
			});
		} catch (e) {
			errCb(e);
		}
	};
	return prom;
};

const ledwaxAuthScheme = (server, options) => {
	const authFunc = (request, reply) => {
		let result = {
			credentials : null
		};
		let invalidAuth = false;
		let ct = request.state['sessiontoken'];
		if (!ct) {
			if (request.query) {
				ct = request.query.sessiontoken;
			}
			if (!ct && request.payload) {
				ct = request.payload.sessiontoken;
			}
		}
		let cloudid = null;
		if (!cloudid) {
			if (request.query) {
				cloudid = request.query.particleCloudId;
			}
			if (!cloudid && request.payload) {
				cloudid = request.payload.particleCloudId;
			}
		}
		let db = request.getDb('apidb');
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		try {
			webuser.findOne({
				where : {
					sessiontoken : ct
				},
				include : [
					{
						model : particleCloud,
						where : {
							id : cloudid
						}
					}
				]
			}).then((user) => {
				request.server.log([ 'debug', 'user.contoller' ],
					'DB call complete - promise success, user =:' + user);
				if (null == user) {
					invalidAuth = true;
				}
				result.credentials = {
					userid : user.dataValues.id,
					sessiontoken : user.dataValues.sessiontoken,
					authtoken : user.dataValues.particle_clouds[0].webuser_particle_cloud_auth_tokens.authtoken
				};
				if (invalidAuth) {
					let err = 'unable to find user by session token';
					reply(boom.unauthorized(err), null, result);
				} else {
					reply.continue(result);
				}
			});
		} catch (e) {
			reply.continue(e);
		}
	};
	return {
		authenticate : authFunc,
		options : {
			payload : false
		}
	};
};

// glue uses a manifest to configure and run hapi for us
Glue.compose(hapiConfig.application, options, (err, server) => {

	if (err) {
		throw err;
	}
	server.ext('onPreResponse', addCorsHeaders);
	server.ext('onPreHandler', (request, reply) => {
		request.app.particle = {};
		let prom = buildParticleConfigFromDB(request, reply);
		prom.then((cfg) => {
			request.app.particle.config = cfg;
			request.app.particle.api = new particlewrap(cfg);
			request.server.log([ 'debug', 'index.js#onPreHandler' ],
				"request.app.particle: " + JSON.stringify(request.app.particle));
			return reply.continue();
		}, (err) => {
			request.server.log([ 'error', 'index.js#onPreHandler' ],
				"there was an error getting particle api: " + e);
		});
	});
	server.auth.scheme('custom', ledwaxAuthScheme);
	server.auth.strategy('default', 'custom');
	server.auth.default('default');
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