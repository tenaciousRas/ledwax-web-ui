'use strict';

const Hapi = require('hapi');
const pg = require('pg');
const	api = require('../../src/modules/middleware/index.js');
const	routes = require('../../src/modules/middleware/routes/index.routes');

var internals = {
	defaults: {
		database: 'postgres://postgres:password@localhost/ledwax_web_ui_dev_test'
	}
};

var db;

module.exports.createServer = function(done) {

	var server = new Hapi.Server({debug: {request: ['debug'], log: ['debug']}});
	server.connection({
		port : 8753
	});
	server.route(routes);
	var pgClient = pg.Client;
	var client = new pgClient({
      user: 'postgres',
      password: 'password',
      database: 'ledwax_web_ui_dev_test',
      host: 'localhost',
      port: 5432
    });
	server.db = client;

	return server;
};
