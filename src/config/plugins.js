#!/usr/bin/env node
'use strict';

const Path = require('path');
const Sequelize = require('sequelize');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const sequelConfig = require('./sequelize.config.json')[rt_ctx_env];
let internals = {
	db : {
		"username": sequelConfig.username,
		"password": sequelConfig.password,
		"database": sequelConfig.database,
		"connStr": sequelConfig.connStr,
		"sequelize": {
			"host": sequelConfig.host,
			"port": sequelConfig.port,
			"dialect": sequelConfig.dialect,
			"pool": {
				"max": sequelConfig.pool.max,
				"min": sequelConfig.pool.min,
				"idle": sequelConfig.pool.idle
			}
		}
	}
,
	staticContentPath : '../modules/public-ledwax-web-ui'
};

module.exports = {
	internals : internals,
	plugins : [
		// Registers the logging and process monitor
		{
			plugin : {
				register : 'good',
				options : {
					reporters : [ {
						reporter : require('good-console'),
						events : {
							error : '*',
							debug : '*',
							log : '*',
							response : '*',
							request : '*'
						}
					} ]
				}
			},
			options : {
				select : [ 'web', 'api' ]
			}
		},
		// Registers the static content handler
		{
			plugin : 'inert',
			options : {
				select : [ 'api' ]
			}
		},
		// Registers the template rendering engine
		{
			plugin : 'vision',
			options : {
				select : [ 'api', 'web' ]
			}
		}, {
			plugin : {
				register : 'visionary',
				options : {
					engines : {
						html : 'handlebars'
					},
					path : Path.join(__dirname, internals.staticContentPath),
					isCached : !internals.debug
				}
			},
			options : {
				select : [ 'web' ]
			}
		},
		// Register Swagger to document the REST api
		{
			plugin : {
				register : 'hapi-swagger',
				options : {
					info : {
						title : 'Api Documentation',
						description : 'REST API Documentation'
					},
					endpoint : '/swagger',
					documentationPath : '/docs',
					apiVersion : require(Path.join(__dirname, '../modules/middleware/package.json')).version
				}
			},
			options : {
				select : [ 'api' ]
			}
		},
		// Registers the database handler
		{
			plugin : {
				register : 'hapi-sequelize',
				options : [ {
					name : 'apidb', // identifier
					models : [ Path.join(__dirname, '../modules/middleware/models/*.js') ],
					sequelize : new Sequelize(internals.db.database,
						internals.db.username,
						internals.db.password,
						internals.db.sequelize), // sequelize instance
					sync : true, // sync models - default false
					forceSync : true // force sync (drops tables) - default false
				} ]
			},
			options : {
				select : [ 'api' ]
			}
		},
		// Registers the UI content server
		{
			plugin : './modules/public-ledwax-web-ui',
			options : {
				select : [ 'web' ]
			}
		},
		// Registers the REST api
		{
			plugin : './modules/middleware',
			options : {
				select : [ 'api' ]
			}
		}
	]
};