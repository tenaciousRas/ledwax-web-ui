/**
 * configure the database connection
 */
'use strict';

var assert = require('assert');
var pg = require('pg');
var pkg = require('./package.json');
var glob = require('glob'),
    Hoek = require("hoek");

var internals = {
	defaults: {
		database: {
      user: 'postgres',
      password: 'password',
      database: 'ledwax_web_ui_dev_test',
      host: 'localhost',
      port: 5432
    }
	}
};

var PG_CON = [];
var run_once = false;

function assign_connection(request, reply) { // DRY
  request.pg = getCon();
  reply.continue();
}

function getCon() {
  return { client: PG_CON[0].client, done: PG_CON[0].done };
};

exports.register = function(server, options, next) {
	var settings = Hoek.applyToDefaults(internals.defaults, options);

  server.ext('onPreAuth', function (request, reply) {
    // each connection created is shut down when the server stops (e.g tests)
    if(!run_once) {
      run_once = true;
      server.log(['info', pkg.name], 'Connecting to DB');
      // connect once and expose the connection via PG_CON
    	var pgClient = pg.Client;
    	var client = new pgClient(settings.database);
    	client.connect(function(err, client, done) {
        assert(!err, pkg.name + ' :: ERROR Connecting during run-once to PostgreSQL!\n' + err);
        PG_CON.push({ client: client, done: done});
        server.log(['info', pkg.name], 'Connected to DB');
      });
      server.on('stop', function () { // only one server.on('stop') listener
        PG_CON.forEach(function (con) { // close all the connections
          con && con.client && con.client.readyForQuery && con.client.end();
          con && con.done && con.done();
        });
        server.log(['info', pkg.name], 'DB Connection Closed');
      });
    }
    if(PG_CON.length === 0) {
      pg.connect(settings.database, function(err, client, done) {
        assert(!err, pkg.name + ' :: ERROR Connecting to PostgreSQL!\n' + err);
        PG_CON.push({ client: client, done: done});
        assign_connection(request, reply);
        server.log(['info', pkg.name], 'reused DB Connection ' + getCon().client);
      });
    } else {
      assign_connection(request, reply);
    }
  });

	// common plugin method
	function exposePlugin(){
		server.expose('db', getCon());
		server.expose('getCon', getCon);
	}
	return next();
};

exports.register.attributes = {
  pkg: pkg
};
