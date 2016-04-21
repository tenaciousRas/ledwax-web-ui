'use strict';

var Hapi = require('hapi'),
	mongoose = require('mongoose'),
	api = require('../../src/modules/middleware/index.js');

module.exports.createServer = function(done){
	mongoose.connect('mongodb://localhost/dev');

	var server = new Hapi.Server();
	server.connection({port: 8753});
	server.register(api, function(err){
		done();
	});

	return server;
};