var hapi = require('hapi'), glue = require('glue'), config = require('./config'), inert = ('inert');

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
		console.log('[hapi] server v' + server.version + ' running at: ',
				server.connections[0].info.uri);
	});

	// export the server for testing
	module.exports.server = server;
});
