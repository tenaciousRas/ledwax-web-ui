var hapi = require('hapi'), glue = require('glue'), inert = ('inert');

rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev'

config = require('./config/' + rt_ctx_env)

// Configure the hapi server using a manifest(config) file
var options = {
	relativeTo : __dirname
};

// glue uses a manifest to configure and run hapi for us
glue.compose(config.application, options, function(err, server) {

	if (err) {
		throw err;
	}
	server.start(function() {
		console.log('LEDWax running in ' + rt_ctx_env
				+ ' mode; using [hapi] server v' + server.version
				+ ' running at: ', server.connections[0].info.uri);
	});

	// export the server for testing
	module.exports.server = server;
});
