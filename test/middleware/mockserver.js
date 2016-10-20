#!/usr/bin/env node
'use strict';

const Hapi = require('hapi');
const Sequelize = require('sequelize');
const Path = require('path');
const api = require('../../src/modules/middleware/index.js');
const routes = require('../../src/modules/middleware/routes/index.routes');
const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'test';
const particleConfig = require('../../src/particle-config').attributes[rt_ctx_env];

let internals = {
	dbConfig : require('../../src/config/sequelize.config.json')[rt_ctx_env]
};
let db;

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
					forceSync : true // force sync (drops tables) - default false
				}
			]
		}
	);
	prom.then(
		(data) => {
			server.log([ 'info', 'mockserver' ], 'registered hapi-sequelize module');
		},
		(err) => {
			server.log([ 'error', 'mockserver' ], 'there was an error registering hapi-sequelize module\n' + err);
		}
	);
	server.method('particle.config', () => {
		return particleConfig;
	});
	return server;
};