/**
 * Mongoose plugin configures the database connection
 */
'use strict';

var glob = require('glob'),
    mongoose = require('mongoose'),
    Hoek = require("hoek");

var internals = {
	defaults: {
		database: 'mongodb://localhost/ledwax-web-ui-dev'
	}
};

exports.register = function(server, options, next){
	var settings = Hoek.applyToDefaults(internals.defaults, options),
		db;

	// attempt reuse existing connection
	if(mongoose.connection.readyState === mongoose.Connection.STATES.connected){
		console.log('[mongodb] already connected');	
		db = mongoose.connection;
		return exposePlugin();
	}

	// connect to mongodb
	db = mongoose.connect(settings.database).connection;
	db.on('error', console.error.bind(console, '[mongodb] [error] '));
	db.on('disconnected', function(){
	    console.log('[mongodb] disconnected');
	});

	// open a connection
	db.once('open', function(){
	    console.log('[mongodb] connected');
	    return exposePlugin();
	});

	// common plugin method
	function exposePlugin(){
		server.expose('db', db);
		return next();
	}
};

exports.register.attributes = {
    pkg: require('./package.json')
};
