#!/usr/bin/env node
'use strict';

const Hapi = require('hapi');
const Sequelize = require('sequelize');
// const pg = require('pg');
const	api = require('../../src/modules/middleware/index.js');
const	routes = require('../../src/modules/middleware/routes/index.routes');
const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particleConfig = require('../../src/particle-config').attributes[rt_ctx_env];

var internals = {
	dbConfig: require('../../src/config/sequelize.config.json')[rt_ctx_env]
};
var db;

module.exports.createServer = (done) => {

	var server = new Hapi.Server({debug: {request: ['debug'], log: ['debug']}});
	server.connection({
		port : 8753
	});
	server.route(routes);
	let prom = server.register(
			{
		      register: require('hapi-sequelize'),
		      options: [
		        {
		          name: 'apidb', // identifier
		          models: ['./src/modules/middleware/models/**/*.js'],  // relative to /webui -- where npm test is run
					    sequelize: new Sequelize(internals.dbConfig.database,
									internals.dbConfig.username,
									internals.dbConfig.password,
									internals.dbConfig.sequelize), // sequelize instance
					    sync: true, // sync models - default false
					    forceSync: false // force sync (drops tables) - default false
		        }
		      ]
		  }
	);
	prom.then(
	  (data) => {
	  },
		(err) => {
			server.log(['error', 'mockserver'], 'there was an error registering hapi-sequelize module\n' + err);
		}
	);
	server.method('particle.config', () => {return particleConfig;});
	return server;
};
