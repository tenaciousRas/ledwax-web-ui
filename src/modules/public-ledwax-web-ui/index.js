exports.register = function(server, options, next) {

	// register route to serve static content
	server.route({
		method : 'GET',
		path : '/public/{path*}',
		handler : {
			directory : {
				path : './app',
				index : false
			}
		}
	});

	return next();
};
exports.register.attributes = {
	pkg : require('./package.json')
};