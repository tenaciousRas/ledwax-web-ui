#!/usr/bin/env node
'use strict';

const Hapi = require('hapi');
const Sequelize = require('sequelize');
const Path = require('path');
const api = require('../../src/modules/middleware/index.js');
const routes = require('../../src/modules/middleware/routes/index.routes');
const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'test';
const default_particle_config = require('../../src/particle-config').attributes[rt_ctx_env];
const particlewrap = require('particle-api-js');
const particle = new particlewrap(default_particle_config);

let sequelConfig = require('../../src/config/sequelize.config.json')[rt_ctx_env];
let internals = {
	dbConfig : {
		"username" : sequelConfig.username,
		"password" : sequelConfig.password,
		"database" : sequelConfig.database,
		"connStr" : sequelConfig.connStr,
		"sequelize" : {
			"host" : sequelConfig.host,
			"port" : sequelConfig.port,
			"dialect" : sequelConfig.dialect,
			"pool" : {
				"max" : sequelConfig.pool.max,
				"min" : sequelConfig.pool.min,
				"idle" : sequelConfig.pool.idle
			}
		}
	}
};

module.exports.createServer = (done) => {

	let server = new Hapi.Server({
		debug : {
			request : [ 'debug' ],
			log : [ 'debug' ]
		}
	});
	server.connection({
		port : 8753
	});
	server.route(routes);
	let prom = server.register(
		{
			register : require('hapi-sequelize'),
			options : [
				{
					name : 'apidb', // identifier
					models : [ Path.join(__dirname, '../../src/modules/middleware/models/**/*.model.js') ],
					sequelize : new Sequelize(internals.dbConfig.database,
						internals.dbConfig.username,
						internals.dbConfig.password,
						internals.dbConfig.sequelize), // sequelize instance
					sync : true, // sync models - default false
					forceSync : false // force sync (drops tables) - default false
				}
			]
		}
	);
	prom.then(
		(data) => {
			server.log([ 'info', 'mockserver' ], 'registered hapi-sequelize module');
			server.ext('onPreHandler', (request, reply) => {
				request.app.particle = {};
				request.app.particle.config = default_particle_config;
				request.app.particle.api = particle;
				return reply.continue();
			});
		},
		(err) => {
			server.log([ 'error', 'mockserver' ], 'there was an error registering hapi-sequelize module\n' + err);
		}
	);
	return server;
};