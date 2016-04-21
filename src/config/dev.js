var Path = require('path');
var plugins = require('./plugins');
var internals = plugins.internals;

// export server config settings
module.exports = {
	application : {
		server : {
		// TODO: cache, cors, etc
		},
		connections : [
				{
					port : process.env.LEDWAX_WEB_PORT || 3000,
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
		registrations : plugins.plugins
	}
};