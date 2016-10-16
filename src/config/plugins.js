#!/usr/bin/env node
'use strict';

const Path = require('path');
const Sequelize = require('sequelize');

let internals = {
	db: require('./sequelize.config.json')[rt_ctx_env],
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
					apiVersion : '0.1.0' // require('../modules/middleware/package.json').version
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
					name: 'apidb', // identifier
			    models: ['./src/modules/middleware/models/*.js'],  // relative to src/index.js
			    sequelize: new Sequelize(internals.db.database,
							internals.db.username,
							internals.db.password,
							internals.db.sequelize), // sequelize instance
			    sync: true, // sync models - default false
			    forceSync: false // force sync (drops tables) - default false
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
