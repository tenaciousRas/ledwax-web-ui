var Path = require('path');

var internals = {
	debug : true,
	dbconnection : 'mongodb://localhost/dev',
	staticContentPath : '../modules/public-ledwax-web-ui'
};

// export server config settings
module.exports = {
	application : {
		server : {
		// TODO: cache, cors, etc
		},
		connections : [
				{
					port : process.env.WEB_PORT || 3000,
					labels : [ 'web' ],
					routes : {
						files : {
							// serves static content files from this directory
							relativeTo : Path.join(__dirname,
									internals.staticContentPath)
						}
					}
				}, {
					port : process.env.API_PORT || 3001,
					labels : [ 'api' ],
					routes : {
						validate : {
							options : {
								// ignores unknown json props and doesnt
								// validate them
								allowUnknown : true
							}
						}
					}
				} ],
		registrations : [ {
			// Registers the logging and process monitor
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
		// Registers the database handler
		// {
		// plugin : {
		// register : './modules/mongoose-config',
		// options : {
		// database : internals.dbconnection
		// }
		// },
		// options : {
		// select : [ 'api' ]
		// }
		// },
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
		}, ]
	}
};